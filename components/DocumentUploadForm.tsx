import React, { useState } from 'react';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { useTranslation } from 'react-i18next';
import { DEFAULT_MAX_UPLOAD_MB, validatePdfFile } from '../utils/fileValidation';

interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
    identityDocument: File | null;
}

const DocumentUploadForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        message: '',
        identityDocument: null,
    });

    const [fileName, setFileName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const validation = validatePdfFile(file);
            if (!validation.valid) {
                setFileError(
                    t(`loanRequest.fileErrors.${validation.errorKey}`, {
                        max: validation.maxSizeMB || DEFAULT_MAX_UPLOAD_MB
                    })
                );
                e.target.value = '';
                setFormData(prev => ({
                    ...prev,
                    identityDocument: null
                }));
                setFileName('');
                return;
            }
        }

        setFileError(null);
        setFormData(prev => ({
            ...prev,
            identityDocument: file
        }));
        setFileName(file ? file.name : '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        if (fileError) {
            setSubmitMessage({
                type: 'error',
                text: fileError
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const nameParts = formData.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || nameParts[0];

            // Prepara i file da caricare
            const files: { file: File; documentType: string }[] = [];
            if (formData.identityDocument) {
                files.push({
                    file: formData.identityDocument,
                    documentType: 'identity_document'
                });
            }

            const result = await formSubmissionService.submitRequest({
                firstName,
                lastName,
                email: formData.email,
                phone: formData.phone,
                serviceType: 'creditizia',
                description: `${t('credit.title')}${formData.message ? ': ' + formData.message : ''}`,
                notes: formData.message,
                additionalData: {
                    hasIdentityDocument: !!formData.identityDocument,
                    documentName: formData.identityDocument?.name
                },
                files: files.length > 0 ? files : undefined
            });

            if (result.success) {
                setSubmitMessage({
                    type: 'success',
                    text: t('common.successMessage')
                });

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: '',
                    identityDocument: null,
                });
                setFileName('');
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: result.error || t('common.errorMessage')
                });
            }
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: t('common.errorMessage')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="document-upload-form">
            <div className="form-header">
                <h3>{t('credit.title')}</h3>
                <p>
                    {t('credit.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="credit-request-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="name" className="form-label">
                            {t('common.firstName')} {t('common.lastName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={`${t('common.placeholders.firstName')} ${t('common.placeholders.lastName')}`}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">
                            {t('common.email')} <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('common.placeholders.email')}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phone" className="form-label">
                            {t('common.phone')} <span className="required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('common.placeholders.phone')}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="message" className="form-label">
                            {t('common.message')}
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows={4}
                            placeholder={t('common.placeholders.message')}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="identityDocument" className="form-label">
                            {t('loanRequest.idDocument')} <span className="required">*</span>
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="identityDocument"
                                name="identityDocument"
                                onChange={handleFileChange}
                                required
                                className="file-input"
                                accept=".pdf,application/pdf"
                            />
                            <label htmlFor="identityDocument" className="file-upload-label">
                                <span className="file-upload-button">{t('loanRequest.chooseFile')}</span>
                                <span className="file-upload-text">
                                    {fileName || t('loanRequest.noFileSelected')}
                                </span>
                            </label>
                        </div>
                        <p className="form-hint">
                            {t('loanRequest.fileHint')}
                        </p>
                        {fileError && (
                            <p className="form-error">{fileError}</p>
                        )}
                    </div>
                </div>

                {submitMessage && (
                    <div className={`form-message ${submitMessage.type}`}>
                        {submitMessage.text}
                    </div>
                )}

                <div className="form-actions">
                    <Button
                        type="submit"
                        variant="tertiary"
                        size="lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('common.submitting') : t('common.submit')}
                    </Button>
                </div>

                <p className="form-privacy">
                    {t('common.privacyText')}{' '}
                    <a href="#/privacy">{t('common.privacyLink')}</a>.
                </p>
            </form>
        </div>
    );
};

export default DocumentUploadForm;
