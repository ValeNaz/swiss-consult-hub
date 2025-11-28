import React, { useState, useEffect } from 'react';
import '../../styles/PhoneInputSmart.css';

interface PhoneInputSmartProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label: string;
    required?: boolean;
}

interface CountryCode {
    code: string;
    country: string;
    flag: string;
    name: string;
}

const DEFAULT_COUNTRY_CODES: CountryCode[] = [
    { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Svizzera' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italia' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germania' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'Francia' },
    { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA/Canada' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'Regno Unito' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spagna' }
];

const PhoneInputSmart: React.FC<PhoneInputSmartProps> = ({
    value,
    onChange,
    error,
    label,
    required
}) => {
    const [prefix, setPrefix] = useState('+41');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [customCodes, setCustomCodes] = useState<CountryCode[]>([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customPrefix, setCustomPrefix] = useState('');
    const [customCountry, setCustomCountry] = useState('');

    // Combine default and custom codes
    const allCountryCodes = [...DEFAULT_COUNTRY_CODES, ...customCodes];

    useEffect(() => {
        // Parse existing value
        if (value) {
            const matchedCode = allCountryCodes.find(c => value.startsWith(c.code));
            if (matchedCode) {
                setPrefix(matchedCode.code);
                setPhoneNumber(value.substring(matchedCode.code.length).trim());
            } else {
                setPhoneNumber(value);
            }
        }
    }, []);

    useEffect(() => {
        const fullNumber = `${prefix}${phoneNumber.replace(/\s/g, '')}`;
        onChange(fullNumber);

        // Validate phone number
        if (phoneNumber) {
            const digitsOnly = phoneNumber.replace(/[\s\-()]/g, '');
            setIsValid(digitsOnly.length >= 7 && digitsOnly.length <= 15);
        } else {
            setIsValid(null);
        }
    }, [prefix, phoneNumber, onChange]);

    const formatPhoneNumber = (num: string) => {
        // Remove all non-digits
        const digits = num.replace(/\D/g, '');

        // Format based on prefix
        if (prefix === '+41') {
            // Swiss format: XX XXX XX XX
            if (digits.length <= 2) return digits;
            if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
            if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
            return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        }

        // Default format with spaces every 3 digits
        return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleAddCustomPrefix = () => {
        if (customPrefix && customCountry) {
            // Validate prefix format (+XXX)
            const prefixRegex = /^\+\d{1,4}$/;
            if (!prefixRegex.test(customPrefix)) {
                alert('Il prefisso deve essere nel formato +XXX (es. +351, +7)');
                return;
            }

            // Check if already exists
            if (allCountryCodes.some(c => c.code === customPrefix)) {
                alert('Questo prefisso esiste già');
                return;
            }

            const newCode: CountryCode = {
                code: customPrefix,
                country: customCountry.toUpperCase().slice(0, 2),
                flag: '🌍',
                name: customCountry
            };

            setCustomCodes([...customCodes, newCode]);
            setPrefix(customPrefix);
            setShowCustomInput(false);
            setShowDropdown(false);
            setCustomPrefix('');
            setCustomCountry('');
        }
    };

    const selectedCountry = allCountryCodes.find(c => c.code === prefix) || allCountryCodes[0];

    return (
        <div className="phone-input-smart">
            <label className="phone-label">
                {label}
                {required && <span className="required"> *</span>}
            </label>
            <div className={`phone-input-wrapper ${error ? 'has-error' : ''} ${isValid === true ? 'is-valid' : ''} ${isValid === false ? 'is-invalid' : ''}`}>
                <div className="prefix-selector" onClick={() => setShowDropdown(!showDropdown)}>
                    <span className="flag">{selectedCountry.flag}</span>
                    <span className="code">{prefix}</span>
                    <span className="arrow">▼</span>
                </div>

                {showDropdown && (
                    <div className="prefix-dropdown">
                        {allCountryCodes.map((country) => (
                            <div
                                key={country.code}
                                className={`dropdown-item ${country.code === prefix ? 'active' : ''}`}
                                onClick={() => {
                                    setPrefix(country.code);
                                    setShowDropdown(false);
                                }}
                            >
                                <span className="flag">{country.flag}</span>
                                <span className="name">{country.name}</span>
                                <span className="code">{country.code}</span>
                            </div>
                        ))}

                        {!showCustomInput ? (
                            <div
                                className="dropdown-item add-custom"
                                onClick={() => setShowCustomInput(true)}
                            >
                                <span className="flag">➕</span>
                                <span className="name">Aggiungi altro prefisso</span>
                            </div>
                        ) : (
                            <div className="custom-prefix-form">
                                <input
                                    type="text"
                                    className="custom-input"
                                    placeholder="+351"
                                    value={customPrefix}
                                    onChange={(e) => setCustomPrefix(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Portogallo"
                                    value={customCountry}
                                    onChange={(e) => setCustomCountry(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="custom-buttons">
                                    <button
                                        type="button"
                                        className="custom-btn save"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddCustomPrefix();
                                        }}
                                    >
                                        Salva
                                    </button>
                                    <button
                                        type="button"
                                        className="custom-btn cancel"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCustomInput(false);
                                            setCustomPrefix('');
                                            setCustomCountry('');
                                        }}
                                    >
                                        Annulla
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <input
                    type="tel"
                    className="phone-number-input"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={prefix === '+41' ? '78 123 45 67' : '123 456 789'}
                />

                {isValid === true && !error && (
                    <span className="validation-icon valid">✓</span>
                )}
                {isValid === false && phoneNumber && (
                    <span className="validation-icon invalid">✗</span>
                )}
            </div>
            {error && <div className="field-error">{error}</div>}
            {!error && phoneNumber && isValid === false && (
                <div className="field-hint-error">Numero di telefono non valido (richiesti 7-15 cifre)</div>
            )}
        </div>
    );
};

export default PhoneInputSmart;
