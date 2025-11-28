import React, { useState, useEffect, useRef } from 'react';
import { googlePlacesService, AddressSuggestion } from '../../services/googlePlacesService';
import '../../styles/AddressInputSmart.css';

interface AddressInputSmartProps {
    street: string;
    streetNumber: string;
    onStreetChange: (value: string) => void;
    onStreetNumberChange: (value: string) => void;
    onAddressSelect?: (details: {
        street: string;
        streetNumber: string;
        city: string;
        state?: string;
        postalCode: string;
        country?: string;
        countryCode?: string;
    }) => void;
    errorStreet?: string;
    errorStreetNumber?: string;
    countryCode?: string;
    restrictToCountry?: boolean;
    placeholder?: string;
    enableAutocomplete?: boolean; // NEW: opzionale, default true
    showHelper?: boolean; // NEW: mostra/nasconde suggerimento
}

const AddressInputSmart: React.FC<AddressInputSmartProps> = ({
    street,
    streetNumber,
    onStreetChange,
    onStreetNumberChange,
    onAddressSelect,
    errorStreet,
    errorStreetNumber,
    countryCode,
    restrictToCountry = false,
    placeholder,
    enableAutocomplete = true,
    showHelper = false
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [detectedCountry, setDetectedCountry] = useState('');
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize combined value
        const combined = street && streetNumber ? `${street} ${streetNumber}` : street;
        if (combined !== inputValue) {
            setInputValue(combined);
        }

        // Initialize detected country ONLY if autocomplete is enabled
        if (enableAutocomplete) {
            googlePlacesService.initialize().then(() => {
                setDetectedCountry(googlePlacesService.getDetectedCountry());
            }).catch(() => {
                // Silent fail - user can still type freely
            });
        }
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (value: string) => {
        // SEMPRE permetti di digitare liberamente
        setInputValue(value);
        onStreetChange(value);

        // Clear previous timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Google autocomplete è SOLO ausiliario - opzionale
        if (enableAutocomplete && value.length >= 3) {
            setIsLoading(true);
            debounceTimeout.current = setTimeout(async () => {
                try {
                    const targetCountry = countryCode || detectedCountry;
                    const results = await googlePlacesService.getAddressSuggestions(
                        value,
                        targetCountry,
                        restrictToCountry
                    );
                    setSuggestions(results);
                    setShowSuggestions(results.length > 0);
                } catch (error) {
                    // Silent fail - l'utente può sempre digitare
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            }, 500); // Aumentato debounce per essere meno invadente
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
        setInputValue(suggestion.description);
        setShowSuggestions(false);
        setIsLoading(true);

        try {
            const details = await googlePlacesService.getPlaceDetails(suggestion.placeId);

            if (details) {
                onStreetChange(details.street);
                onStreetNumberChange(details.streetNumber);

                if (onAddressSelect) {
                    onAddressSelect({
                        street: details.street,
                        streetNumber: details.streetNumber,
                        city: details.city,
                        state: details.state,
                        postalCode: details.postalCode,
                        country: details.country,
                        countryCode: details.countryCode
                    });
                }

                setInputValue(`${details.street}${details.streetNumber ? ' ' + details.streetNumber : ''}`);
            }
        } catch (error) {
            console.error('Error getting place details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="address-input-smart" ref={wrapperRef}>
            <div className="field-row-v2">
                <div className="field-group-v2 flex-3">
                    <label>
                        Via <span className="required">*</span>
                    </label>
                    <div className={`address-input-wrapper ${errorStreet ? 'has-error' : ''} ${showSuggestions ? 'has-suggestions' : ''}`}>
                        {enableAutocomplete && <span className="address-icon">📍</span>}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onFocus={() => {
                                if (suggestions.length > 0 && enableAutocomplete) {
                                    setShowSuggestions(true);
                                }
                            }}
                            placeholder={placeholder || "Type your address..."}
                        />
                        {enableAutocomplete && isLoading && (
                            <span className="loading-icon-minimal">⏳</span>
                        )}
                    </div>

                    {enableAutocomplete && showSuggestions && suggestions.length > 0 && (
                        <div className="address-suggestions-minimal">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={`${suggestion.placeId}-${index}`}
                                    className="suggestion-item-minimal"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <div className="suggestion-content">
                                        <div className="suggestion-main">{suggestion.mainText}</div>
                                        <div className="suggestion-secondary">{suggestion.secondaryText}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {errorStreet && <div className="field-error">{errorStreet}</div>}
                </div>

                <div className="field-group-v2 flex-1">
                    <label>
                        N. <span className="required">*</span>
                    </label>
                    <div className={`input-with-validation ${errorStreetNumber ? 'has-error' : ''}`}>
                        <input
                            type="text"
                            value={streetNumber}
                            onChange={(e) => onStreetNumberChange(e.target.value)}
                            placeholder="10"
                        />
                        {streetNumber && !errorStreetNumber && (
                            <span className="validation-icon valid">✓</span>
                        )}
                    </div>
                    {errorStreetNumber && <div className="field-error">{errorStreetNumber}</div>}
                </div>
            </div>

            {showHelper && enableAutocomplete && (
                <div className="address-helper-minimal">
                    💡 Optional: Select a suggestion to auto-fill fields
                </div>
            )}
        </div>
    );
};

export default AddressInputSmart;
