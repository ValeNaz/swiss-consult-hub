import React, { useState, useEffect } from 'react';
import { getCityByPostalCode, isValidSwissPostalCode } from '../../utils/swissPostalCodes';
import '../../styles/PostalCodeInput.css';

interface PostalCodeInputProps {
    postalCode: string;
    city: string;
    onPostalCodeChange: (value: string) => void;
    onCityChange: (value: string) => void;
    errorPostalCode?: string;
    errorCity?: string;
    country?: string;
}

const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
    postalCode,
    city,
    onPostalCodeChange,
    onCityChange,
    errorPostalCode,
    errorCity,
    country = 'Switzerland'
}) => {
    const [postalCodeValid, setPostalCodeValid] = useState<boolean | null>(null);
    const [suggestedCity, setSuggestedCity] = useState<string | null>(null);

    useEffect(() => {
        if (country === 'Switzerland' && postalCode.length === 4) {
            const isValid = isValidSwissPostalCode(postalCode);
            setPostalCodeValid(isValid);

            if (isValid) {
                const detectedCity = getCityByPostalCode(postalCode);
                if (detectedCity) {
                    setSuggestedCity(detectedCity);
                    if (!city) {
                        onCityChange(detectedCity);
                    }
                } else {
                    setSuggestedCity(null);
                }
            } else {
                setSuggestedCity(null);
            }
        } else if (postalCode.length > 0 && postalCode.length !== 4) {
            setPostalCodeValid(false);
            setSuggestedCity(null);
        } else {
            setPostalCodeValid(null);
            setSuggestedCity(null);
        }
    }, [postalCode, country, city, onCityChange]);

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        onPostalCodeChange(value);
    };

    const applySuggestedCity = () => {
        if (suggestedCity) {
            onCityChange(suggestedCity);
            setSuggestedCity(null);
        }
    };

    return (
        <div className="postal-code-input-group">
            <div className="field-row-v2">
                <div className="field-group-v2">
                    <label>
                        Codice postale <span className="required">*</span>
                    </label>
                    <div className={`input-with-validation ${errorPostalCode ? 'has-error' : ''} ${postalCodeValid === true ? 'is-valid' : ''} ${postalCodeValid === false ? 'is-invalid' : ''}`}>
                        <input
                            type="text"
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder={country === 'Switzerland' ? '6900' : 'CAP'}
                            maxLength={4}
                        />
                        {postalCodeValid === true && !errorPostalCode && (
                            <span className="validation-icon valid">✓</span>
                        )}
                        {postalCodeValid === false && postalCode.length > 0 && (
                            <span className="validation-icon invalid">✗</span>
                        )}
                    </div>
                    {errorPostalCode && <div className="field-error">{errorPostalCode}</div>}
                    {!errorPostalCode && postalCodeValid === false && postalCode.length > 0 && (
                        <div className="field-hint-error">
                            Il CAP svizzero deve essere di 4 cifre
                        </div>
                    )}
                </div>

                <div className="field-group-v2">
                    <label>
                        Città <span className="required">*</span>
                    </label>
                    <div className={`input-with-validation ${errorCity ? 'has-error' : ''}`}>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                            placeholder="Lugano"
                        />
                        {city && !errorCity && (
                            <span className="validation-icon valid">✓</span>
                        )}
                    </div>
                    {errorCity && <div className="field-error">{errorCity}</div>}
                </div>
            </div>

            {suggestedCity && city !== suggestedCity && (
                <div className="city-suggestion">
                    <span className="suggestion-icon">💡</span>
                    <span className="suggestion-text">
                        Hai scritto <strong>{postalCode}</strong>. Intendevi <strong>{suggestedCity}</strong>?
                    </span>
                    <button
                        type="button"
                        className="suggestion-button"
                        onClick={applySuggestedCity}
                    >
                        Usa questa città
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostalCodeInput;
