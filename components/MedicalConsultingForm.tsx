import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';

interface MedicalFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
    medicalBranch: string;
    insuranceType: string;
    insuranceCompany: string;
}

const MedicalConsultingForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<MedicalFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
        medicalBranch: '',
        insuranceType: '',
        insuranceCompany: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const result = await formSubmissionService.submitRequest({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                serviceType: 'medica',
                description: `Richiesta consulenza medica - ${formData.medicalBranch}${formData.notes ? ': ' + formData.notes : ''}`,
                notes: formData.notes,
                additionalData: {
                    medicalBranch: formData.medicalBranch,
                    insuranceType: formData.insuranceType,
                    insuranceCompany: formData.insuranceCompany
                }
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
                    notes: '',
                    medicalBranch: '',
                    insuranceType: '',
                    insuranceCompany: '',
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
                <h3>{t('medical.title')}</h3>
                <p>
                    {t('medical.subtitle')}
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
                            placeholder={t('common.placeholders.firstName')}
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
                            placeholder={t('common.placeholders.lastName')}
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
                            rows={4}
                            placeholder={t('medical.placeholders.notes')}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field full-width">
                        <label htmlFor="medicalBranch" className="form-label">
                            {t('medical.medicalBranch')} <span className="required">*</span>
                        </label>
                        <select
                            id="medicalBranch"
                            name="medicalBranch"
                            value={formData.medicalBranch}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        >
                            <option value="">{t('medical.branches.select')}</option>
                            <option value="ortopedia">{t('medical.branches.orthopedics')}</option>
                            <option value="odontoiatria">{t('medical.branches.dentistry')}</option>
                            <option value="urologia">{t('medical.branches.urology')}</option>
                            <option value="medicina-generale">{t('medical.branches.generalMedicine')}</option>
                        </select>
                    </div>
                </div>

                <div className="insurance-section">
                    <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                        {t('medical.insuranceType')} <span className="required">*</span>
                    </h4>

                    <div className="form-row">
                        <div className="form-field full-width">
                            <label htmlFor="insuranceType" className="form-label">
                                {t('medical.insuranceType')}
                            </label>
                            <select
                                id="insuranceType"
                                name="insuranceType"
                                value={formData.insuranceType}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            >
                                <option value="">{t('medical.insuranceTypes.select')}</option>
                                <option value="base">{t('medical.insuranceTypes.base')}</option>
                                <option value="complementare">{t('medical.insuranceTypes.supplementary')}</option>
                            </select>
                        </div>
                    </div>

                    {formData.insuranceType && (
                        <div className="form-row">
                            <div className="form-field full-width">
                                <label htmlFor="insuranceCompany" className="form-label">
                                    {t('medical.insuranceCompany')} <span className="required">*</span>
                                </label>
                                <select
                                    id="insuranceCompany"
                                    name="insuranceCompany"
                                    value={formData.insuranceCompany}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                >
                                    <option value="">{t('medical.insuranceCompanies.select')}</option>
                                    <option value="css">{t('medical.insuranceCompanies.css')}</option>
                                    <option value="swica">{t('medical.insuranceCompanies.swica')}</option>
                                    <option value="helsana">{t('medical.insuranceCompanies.helsana')}</option>
                                    <option value="sanitas">{t('medical.insuranceCompanies.sanitas')}</option>
                                    <option value="concordia">{t('medical.insuranceCompanies.concordia')}</option>
                                    <option value="visana">{t('medical.insuranceCompanies.visana')}</option>
                                    <option value="groupe-mutuel">{t('medical.insuranceCompanies.groupeMutuel')}</option>
                                    <option value="assura">{t('medical.insuranceCompanies.assura')}</option>
                                    <option value="altra">{t('medical.insuranceCompanies.other')}</option>
                                </select>
                            </div>
                        </div>
                    )}
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

export default MedicalConsultingForm;
