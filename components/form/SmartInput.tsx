import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import '../../styles/SmartInput.css';

interface SmartInputProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'email' | 'tel' | 'date';
    placeholder?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    tooltip?: string;
    icon?: React.ReactNode;
    validation?: (value: string) => { valid: boolean; message?: string };
    min?: number | string;
    max?: number | string;
    step?: number;
    currency?: string;
    autoComplete?: string;
}

const SmartInput: React.FC<SmartInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    error,
    hint,
    tooltip,
    icon,
    validation,
    min,
    max,
    step,
    currency,
    autoComplete
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const [validationState, setValidationState] = useState<{ valid: boolean; message?: string } | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (isTouched && validation && value) {
            const result = validation(String(value));
            setValidationState(result);
        }
    }, [value, isTouched, validation]);

    const handleBlur = () => {
        setIsFocused(false);
        setIsTouched(true);
    };

    const showValidation = isTouched && !error && validationState;
    const showError = isTouched && error;

    return (
        <div className={`smart-input ${isFocused ? 'focused' : ''} ${showError ? 'error' : ''} ${showValidation?.valid ? 'valid' : ''}`}>
            <label className="smart-input-label">
                {label}
                {required && <span className="required-indicator">*</span>}
                {tooltip && (
                    <div
                        className="tooltip-trigger"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <Info size={16} />
                        {showTooltip && (
                            <div className="tooltip-content">{tooltip}</div>
                        )}
                    </div>
                )}
            </label>

            <div className="smart-input-wrapper">
                {icon && <div className="input-icon">{icon}</div>}

                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`smart-input-field ${icon ? 'with-icon' : ''} ${currency ? 'with-currency' : ''}`}
                    min={min}
                    max={max}
                    step={step}
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(showError)}
                    aria-describedby={showError ? `${label}-error` : undefined}
                />

                {currency && <span className="input-currency">{currency}</span>}

                {showValidation && validationState.valid && (
                    <div className="input-validation-icon success">
                        <CheckCircle2 size={20} />
                    </div>
                )}

                {showError && (
                    <div className="input-validation-icon error">
                        <AlertCircle size={20} />
                    </div>
                )}
            </div>

            {hint && !showError && !showValidation && (
                <p className="smart-input-hint">{hint}</p>
            )}

            {showError && (
                <p className="smart-input-error" id={`${label}-error`}>{error}</p>
            )}

            {showValidation && !validationState.valid && validationState.message && (
                <p className="smart-input-warning">{validationState.message}</p>
            )}

            {showValidation && validationState.valid && validationState.message && (
                <p className="smart-input-success">{validationState.message}</p>
            )}
        </div>
    );
};

export default SmartInput;
