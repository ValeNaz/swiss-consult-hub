import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { DEFAULT_MAX_UPLOAD_MB, validatePdfFile } from '../utils/fileValidation';

interface JobFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cv: File | null;
    coverLetter: File | null;
    idDocument: File | null;
    residencePermit: File | null;
    notes: string;
}

const JobConsultingForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<JobFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cv: null,
        coverLetter: null,
        idDocument: null,
        residencePermit: null,
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        const file = files && files.length > 0 ? files[0] : null;

        if (file) {
            const validation = validatePdfFile(file);
            if (!validation.valid) {
                setFileErrors(prev => ({
                    ...prev,
                    [name]: t(`loanRequest.fileErrors.${validation.errorKey}`, {
                        max: validation.maxSizeMB || DEFAULT_MAX_UPLOAD_MB
                    })
                }));
                e.target.value = '';
                setFormData(prev => ({
                    ...prev,
                    [name]: null
                }));
                return;
            }
        }

        setFileErrors(prev => {
            if (!prev[name]) return prev;
            const { [name]: _removed, ...rest } = prev;
            return rest;
        });

        setFormData(prev => ({
            ...prev,
            [name]: file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        if (Object.keys(fileErrors).length > 0) {
            setSubmitMessage({
                type: 'error',
                text: t('loanRequest.fileErrors.pending')
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Prepara gli allegati da caricare
            const files: { file: File; documentType: string }[] = [];
            if (formData.cv) files.push({ file: formData.cv, documentType: 'cv' });
            if (formData.coverLetter) files.push({ file: formData.coverLetter, documentType: 'cover_letter' });
            if (formData.idDocument) files.push({ file: formData.idDocument, documentType: 'identity_document' });
            if (formData.residencePermit) files.push({ file: formData.residencePermit, documentType: 'residence_permit' });

            const result = await formSubmissionService.submitRequest({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                serviceType: 'lavorativa',
                description: `Candidatura per consulenza lavorativa${formData.notes ? ': ' + formData.notes : ''}`,
                notes: formData.notes,
                additionalData: {
                    hasCv: !!formData.cv,
                    cvName: formData.cv?.name,
                    hasCoverLetter: !!formData.coverLetter,
                    coverLetterName: formData.coverLetter?.name,
                    hasIdDocument: !!formData.idDocument,
                    idDocumentName: formData.idDocument?.name,
                    hasResidencePermit: !!formData.residencePermit,
                    residencePermitName: formData.residencePermit?.name
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
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    cv: null,
                    coverLetter: null,
                    idDocument: null,
                    residencePermit: null,
                    notes: '',
                });

                // Reset file inputs
                const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
                fileInputs.forEach(input => {
                    input.value = '';
                });
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
        <div className="contact-request-form">
            <div className="form-header">
                <h3>{t('job.title')}</h3>
                <p>
                    {t('job.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="commercial-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName" className="form-label">
                            {t('common.firstName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder="Mario"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="lastName" className="form-label">
                            {t('common.lastName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder="Rossi"
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
                            placeholder="mario.rossi@example.com"
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
                            placeholder="+41 78 123 45 67"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="cv" className="form-label">
                            {t('job.cv')} <span className="required">*</span>
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="cv"
                                name="cv"
                                onChange={handleFileChange}
                                required
                                className="file-input"
                                accept=".pdf,application/pdf"
                                aria-invalid={Boolean(fileErrors.cv)}
                            />
                            <label htmlFor="cv" className="file-upload-label">
                                {formData.cv ? formData.cv.name : t('job.chooseFile')}
                            </label>
                        </div>
                        <span className="form-hint">{t('job.fileHint')}</span>
                        {fileErrors.cv && <p className="form-error">{fileErrors.cv}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="coverLetter" className="form-label">
                            {t('job.coverLetter')}
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="coverLetter"
                                name="coverLetter"
                                onChange={handleFileChange}
                                className="file-input"
                                accept=".pdf,application/pdf"
                                aria-invalid={Boolean(fileErrors.coverLetter)}
                            />
                            <label htmlFor="coverLetter" className="file-upload-label">
                                {formData.coverLetter ? formData.coverLetter.name : `${t('job.chooseFile')} (${t('job.optional')})`}
                            </label>
                        </div>
                        <span className="form-hint">{t('job.fileHint')}</span>
                        {fileErrors.coverLetter && <p className="form-error">{fileErrors.coverLetter}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="idDocument" className="form-label">
                            {t('job.idDocument')} <span className="required">*</span>
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="idDocument"
                                name="idDocument"
                                onChange={handleFileChange}
                                required
                                className="file-input"
                                accept=".pdf,application/pdf"
                                aria-invalid={Boolean(fileErrors.idDocument)}
                            />
                            <label htmlFor="idDocument" className="file-upload-label">
                                {formData.idDocument ? formData.idDocument.name : t('job.chooseFile')}
                            </label>
                        </div>
                        <span className="form-hint">{t('job.fileHint')}</span>
                        {fileErrors.idDocument && <p className="form-error">{fileErrors.idDocument}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="residencePermit" className="form-label">
                            {t('job.residencePermit')}
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="residencePermit"
                                name="residencePermit"
                                onChange={handleFileChange}
                                className="file-input"
                                accept=".pdf,application/pdf"
                                aria-invalid={Boolean(fileErrors.residencePermit)}
                            />
                            <label htmlFor="residencePermit" className="file-upload-label">
                                {formData.residencePermit ? formData.residencePermit.name : `${t('job.chooseFile')} (${t('job.optional')})`}
                            </label>
                        </div>
                        <span className="form-hint">{t('job.fileHint')}</span>
                        {fileErrors.residencePermit && <p className="form-error">{fileErrors.residencePermit}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field full-width">
                        <label htmlFor="notes" className="form-label">
                            {t('common.notes')}
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows={6}
                            placeholder={t('job.placeholders.notes')}
                        />
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

export default JobConsultingForm;
