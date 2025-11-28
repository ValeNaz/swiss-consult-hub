import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import '../../styles/SmartFileUpload.css';

interface SmartFileUploadProps {
    label: string;
    value: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
    error?: string;
    hint?: string;
    tooltip?: string;
    accept?: string;
    maxSize?: number; // in MB
}

const SmartFileUpload: React.FC<SmartFileUploadProps> = ({
    label,
    value,
    onChange,
    required = false,
    error,
    hint,
    tooltip,
    accept = '.pdf,application/pdf',
    maxSize = 10
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const validateFile = (file: File): boolean => {
        setUploadError(null);

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setUploadError(`Il file supera la dimensione massima di ${maxSize}MB`);
            return false;
        }

        // Check file type
        if (accept && !accept.includes(file.type) && !accept.includes(file.name.split('.').pop() || '')) {
            setUploadError('Tipo di file non valido. Solo PDF accettati.');
            return false;
        }

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                onChange(file);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                onChange(file);
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const displayError = error || uploadError;

    return (
        <div className={`smart-file-upload ${value ? 'has-file' : ''} ${displayError ? 'error' : ''}`}>
            <label className="smart-file-label">
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

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="file-input-hidden"
                aria-invalid={Boolean(displayError)}
            />

            {!value ? (
                <div
                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={32} className="upload-icon" />
                    <p className="upload-text">
                        Trascina qui il file o <span className="upload-link">clicca per selezionare</span>
                    </p>
                    <p className="upload-hint">PDF, massimo {maxSize}MB</p>
                </div>
            ) : (
                <div className="file-preview">
                    <div className="file-info">
                        <File size={24} className="file-icon" />
                        <div className="file-details">
                            <p className="file-name">{value.name}</p>
                            <p className="file-size">{formatFileSize(value.size)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="file-remove"
                        aria-label="Rimuovi file"
                    >
                        <X size={20} />
                    </button>
                    {!displayError && (
                        <div className="file-success">
                            <CheckCircle2 size={20} />
                        </div>
                    )}
                </div>
            )}

            {hint && !displayError && <p className="smart-file-hint">{hint}</p>}

            {displayError && (
                <p className="smart-file-error">
                    <AlertCircle size={16} />
                    {displayError}
                </p>
            )}
        </div>
    );
};

export default SmartFileUpload;
