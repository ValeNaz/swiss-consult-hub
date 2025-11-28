import React, { useState, useEffect } from 'react';
import '../../styles/EmailInputSmart.css';

interface EmailInputSmartProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label: string;
    required?: boolean;
}

const COMMON_EMAIL_PROVIDERS = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    'bluewin.ch',
    'gmx.ch',
    'protonmail.com'
];

const EmailInputSmart: React.FC<EmailInputSmartProps> = ({
    value,
    onChange,
    error,
    label,
    required
}) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (value) {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setIsValid(emailRegex.test(value));

            // Generate suggestions
            if (value.includes('@')) {
                const [localPart, domain] = value.split('@');
                if (domain && domain.length > 0 && domain.length < 5) {
                    const domainSuggestions = COMMON_EMAIL_PROVIDERS
                        .filter(provider => provider.startsWith(domain.toLowerCase()))
                        .map(provider => `${localPart}@${provider}`)
                        .slice(0, 3);

                    setSuggestions(domainSuggestions);
                    setShowSuggestions(domainSuggestions.length > 0);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } else {
            setIsValid(null);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value]);

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="email-input-smart">
            <label className="email-label">
                {label}
                {required && <span className="required"> *</span>}
            </label>
            <div className={`email-input-wrapper ${error ? 'has-error' : ''} ${isValid === true ? 'is-valid' : ''} ${isValid === false ? 'is-invalid' : ''}`}>
                <span className="email-icon">✉️</span>
                <input
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toLowerCase())}
                    placeholder="mario.rossi@example.com"
                    autoComplete="email"
                />
                {isValid === true && !error && (
                    <span className="validation-icon valid">✓</span>
                )}
                {isValid === false && value && (
                    <span className="validation-icon invalid">✗</span>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="email-suggestions">
                    <div className="suggestions-label">Forse intendevi:</div>
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {error && <div className="field-error">{error}</div>}
            {!error && value && isValid === false && (
                <div className="field-hint-error">
                    Email non valida. Assicurati che contenga @ e un dominio valido
                </div>
            )}
        </div>
    );
};

export default EmailInputSmart;
