import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { DEFAULT_MAX_UPLOAD_MB, validatePdfFile } from '../utils/fileValidation';

interface TaxFormData {
    // Dati anagrafici
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;

    // Dati di contatto
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    canton: string;

    // Dati fiscali
    taxId: string;
    maritalStatus: string;
    employmentStatus: string;
    annualIncome: string;

    // Documenti
    documents: File[];
}

const TaxDeclarationForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<TaxFormData>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        canton: '',
        taxId: '',
        maritalStatus: '',
        employmentStatus: '',
        annualIncome: '',
        documents: [],
    });

    const [fileNames, setFileNames] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length === 0) return;

        const acceptedFiles: File[] = [];
        let errorMessage: string | null = null;

        files.forEach((file) => {
            const validation = validatePdfFile(file);
            if (!validation.valid) {
                errorMessage = t(`loanRequest.fileErrors.${validation.errorKey}`, {
                    max: validation.maxSizeMB || DEFAULT_MAX_UPLOAD_MB
                });
                return;
            }
            acceptedFiles.push(file);
        });

        if (errorMessage) {
            setFileError(errorMessage);
        } else {
            setFileError(null);
        }

        if (acceptedFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, ...acceptedFiles]
            }));
            setFileNames(prev => [...prev, ...acceptedFiles.map((f: File) => f.name)]);
        }

        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
        setFileNames(prev => prev.filter((_, i) => i !== index));
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
            // Prepara gli allegati da caricare
            const files: { file: File; documentType: string }[] = (formData.documents || []).map((f) => ({
                file: f,
                documentType: 'tax_document'
            }));

            const result = await formSubmissionService.submitRequest({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                serviceType: 'fiscale',
                description: `Dichiarazione dei redditi - ${formData.employmentStatus}`,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                dateOfBirth: formData.dateOfBirth,
                amount: parseFloat(formData.annualIncome) || undefined,
                additionalData: {
                    placeOfBirth: formData.placeOfBirth,
                    nationality: formData.nationality,
                    canton: formData.canton,
                    taxId: formData.taxId,
                    maritalStatus: formData.maritalStatus,
                    employmentStatus: formData.employmentStatus,
                    annualIncome: formData.annualIncome,
                    documentsCount: formData.documents.length
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
                    dateOfBirth: '',
                    placeOfBirth: '',
                    nationality: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    postalCode: '',
                    canton: '',
                    taxId: '',
                    maritalStatus: '',
                    employmentStatus: '',
                    annualIncome: '',
                    documents: [],
                });
                setFileNames([]);
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
        <div className="tax-declaration-form">
            <div className="form-header">
                <h3>{t('tax.title')}</h3>
                <p>
                    {t('tax.description')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="commercial-form">
                {/* Dati Anagrafici */}
                <div className="form-section">
                    <h4 className="form-section-title">{t('tax.sections.personal')}</h4>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="firstName" className="form-label">
                                {t('tax.firstName')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.firstName')}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="lastName" className="form-label">
                                {t('tax.lastName')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.lastName')}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="dateOfBirth" className="form-label">
                                {t('tax.dateOfBirth')} <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="placeOfBirth" className="form-label">
                                {t('tax.placeOfBirth')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                name="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.placeOfBirth')}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="nationality" className="form-label">
                                {t('tax.nationality')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.nationality')}
                            />
                        </div>
                    </div>
                </div>

                {/* Dati di Contatto */}
                <div className="form-section">
                    <h4 className="form-section-title">{t('tax.sections.contact')}</h4>

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
                        <div className="form-field full-width">
                            <label htmlFor="address" className="form-label">
                                {t('tax.address')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.address')}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="postalCode" className="form-label">
                                {t('tax.postalCode')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.postalCode')}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="city" className="form-label">
                                {t('tax.city')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.city')}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="canton" className="form-label">
                                {t('tax.canton')} <span className="required">*</span>
                            </label>
                            <select
                                id="canton"
                                name="canton"
                                value={formData.canton}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            >
                                <option value="">{t('tax.cantons.select')}</option>
                                <option value="TI">{t('tax.cantons.TI')}</option>
                                <option value="ZH">{t('tax.cantons.ZH')}</option>
                                <option value="BE">{t('tax.cantons.BE')}</option>
                                <option value="GE">{t('tax.cantons.GE')}</option>
                                <option value="VD">{t('tax.cantons.VD')}</option>
                                <option value="VS">{t('tax.cantons.VS')}</option>
                                <option value="GR">{t('tax.cantons.GR')}</option>
                                <option value="AG">{t('tax.cantons.AG')}</option>
                                <option value="SG">{t('tax.cantons.SG')}</option>
                                <option value="LU">{t('tax.cantons.LU')}</option>
                                <option value="BS">{t('tax.cantons.BS')}</option>
                                <option value="BL">{t('tax.cantons.BL')}</option>
                                <option value="SO">{t('tax.cantons.SO')}</option>
                                <option value="FR">{t('tax.cantons.FR')}</option>
                                <option value="NE">{t('tax.cantons.NE')}</option>
                                <option value="JU">{t('tax.cantons.JU')}</option>
                                <option value="SZ">{t('tax.cantons.SZ')}</option>
                                <option value="ZG">{t('tax.cantons.ZG')}</option>
                                <option value="SH">{t('tax.cantons.SH')}</option>
                                <option value="AR">{t('tax.cantons.AR')}</option>
                                <option value="AI">{t('tax.cantons.AI')}</option>
                                <option value="TG">{t('tax.cantons.TG')}</option>
                                <option value="UR">{t('tax.cantons.UR')}</option>
                                <option value="OW">{t('tax.cantons.OW')}</option>
                                <option value="NW">{t('tax.cantons.NW')}</option>
                                <option value="GL">{t('tax.cantons.GL')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dati Fiscali */}
                <div className="form-section">
                    <h4 className="form-section-title">{t('tax.sections.fiscal')}</h4>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="taxId" className="form-label">
                                {t('tax.taxId')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="taxId"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.taxId')}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="maritalStatus" className="form-label">
                                {t('tax.maritalStatus')} <span className="required">*</span>
                            </label>
                            <select
                                id="maritalStatus"
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            >
                                <option value="">{t('tax.maritalStatuses.select')}</option>
                                <option value="single">{t('tax.maritalStatuses.single')}</option>
                                <option value="married">{t('tax.maritalStatuses.married')}</option>
                                <option value="divorced">{t('tax.maritalStatuses.divorced')}</option>
                                <option value="widowed">{t('tax.maritalStatuses.widowed')}</option>
                                <option value="registered_partnership">{t('tax.maritalStatuses.registeredPartnership')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="employmentStatus" className="form-label">
                                {t('tax.employmentStatus')} <span className="required">*</span>
                            </label>
                            <select
                                id="employmentStatus"
                                name="employmentStatus"
                                value={formData.employmentStatus}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            >
                                <option value="">{t('tax.employmentStatuses.select')}</option>
                                <option value="employed">{t('tax.employmentStatuses.employed')}</option>
                                <option value="self_employed">{t('tax.employmentStatuses.selfEmployed')}</option>
                                <option value="unemployed">{t('tax.employmentStatuses.unemployed')}</option>
                                <option value="retired">{t('tax.employmentStatuses.retired')}</option>
                                <option value="student">{t('tax.employmentStatuses.student')}</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="annualIncome" className="form-label">
                                {t('tax.annualIncome')} <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="annualIncome"
                                name="annualIncome"
                                value={formData.annualIncome}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                placeholder={t('tax.placeholders.annualIncome')}
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Documenti */}
                <div className="form-section">
                    <h4 className="form-section-title">{t('tax.sections.documents')}</h4>
                    <p className="form-section-description">
                        {t('tax.documents.description')}
                    </p>

                    <div className="form-row">
                        <div className="form-field full-width">
                            <label htmlFor="documents" className="form-label">
                                {t('tax.documents.label')} <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="documents"
                                    name="documents"
                                    onChange={handleFileChange}
                                    multiple
                                    className="file-input"
                                    accept=".pdf,application/pdf"
                                    aria-invalid={Boolean(fileError)}
                                />
                                <label htmlFor="documents" className="file-upload-label">
                                    <span className="file-upload-button">{t('tax.documents.chooseFiles')}</span>
                                    <span className="file-upload-text">
                                        {fileNames.length > 0 ? t('tax.documents.filesSelected', { count: fileNames.length }) : t('tax.documents.noFiles')}
                                    </span>
                                </label>
                            </div>
                            <p className="form-hint">
                                {t('tax.documents.hint')}
                            </p>
                            {fileError && (
                                <p className="form-error">{fileError}</p>
                            )}

                            {fileNames.length > 0 && (
                                <div className="uploaded-files-list">
                                    {fileNames.map((name, index) => (
                                        <div key={index} className="uploaded-file-item">
                                            <span className="file-name">{name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="remove-file-button"
                                                aria-label={t('tax.documents.removeFile')}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        disabled={isSubmitting || formData.documents.length === 0}
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

export default TaxDeclarationForm;
