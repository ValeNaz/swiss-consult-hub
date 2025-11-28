import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Info } from 'lucide-react';
import '../../styles/SmartSelect.css';

interface SmartSelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
}

interface SmartSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SmartSelectOption[];
    required?: boolean;
    error?: string;
    hint?: string;
    tooltip?: string;
    variant?: 'dropdown' | 'buttons' | 'cards';
}

const SmartSelect: React.FC<SmartSelectProps> = ({
    label,
    value,
    onChange,
    options,
    required = false,
    error,
    hint,
    tooltip,
    variant = 'buttons'
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (variant === 'dropdown') {
        return (
            <div className="smart-select dropdown">
                <label className="smart-select-label">
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

                <div className="select-wrapper">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="smart-select-field"
                        aria-invalid={Boolean(error)}
                    >
                        <option value="">Seleziona...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="select-icon" size={20} />
                </div>

                {hint && !error && <p className="smart-select-hint">{hint}</p>}
                {error && <p className="smart-select-error">{error}</p>}
            </div>
        );
    }

    if (variant === 'cards') {
        return (
            <div className="smart-select cards">
                <label className="smart-select-label">
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

                <div className="select-cards">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`select-card ${value === opt.value ? 'active' : ''}`}
                            onClick={() => onChange(opt.value)}
                        >
                            {opt.icon && <div className="card-icon">{opt.icon}</div>}
                            <div className="card-content">
                                <span className="card-label">{opt.label}</span>
                                {opt.description && (
                                    <span className="card-description">{opt.description}</span>
                                )}
                            </div>
                            {value === opt.value && (
                                <div className="card-check">
                                    <CheckCircle2 size={20} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {hint && !error && <p className="smart-select-hint">{hint}</p>}
                {error && <p className="smart-select-error">{error}</p>}
            </div>
        );
    }

    // Default: buttons variant
    return (
        <div className="smart-select buttons">
            <label className="smart-select-label">
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

            <div className="select-buttons">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`select-button ${value === opt.value ? 'active' : ''}`}
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.icon && <span className="button-icon">{opt.icon}</span>}
                        <span className="button-label">{opt.label}</span>
                        {value === opt.value && (
                            <CheckCircle2 className="button-check" size={18} />
                        )}
                    </button>
                ))}
            </div>

            {hint && !error && <p className="smart-select-hint">{hint}</p>}
            {error && <p className="smart-select-error">{error}</p>}
        </div>
    );
};

export default SmartSelect;
