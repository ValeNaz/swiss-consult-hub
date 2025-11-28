import React, { useState } from 'react';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { useTranslation } from 'react-i18next';

interface LegalFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    consultingType: string;
    notes: string;
}

const LegalConsultingForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<LegalFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        consultingType: '',
        notes: '',
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
                serviceType: 'legale',
                description: `${t('legal.title')} - ${formData.consultingType}${formData.notes ? ': ' + formData.notes : ''}`,
                notes: formData.notes,
                additionalData: {
                    consultingType: formData.consultingType
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
                    consultingType: '',
                    notes: '',
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
                <h3>{t('legal.title')}</h3>
                <p>
                    {t('legal.subtitle')}
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
                        <label htmlFor="consultingType" className="form-label">
                            {t('legal.legalArea')} <span className="required">*</span>
                        </label>
                        <select
                            id="consultingType"
                            name="consultingType"
                            value={formData.consultingType}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        >
                            <option value="">{t('legal.areas.contracts')}</option>
                            <option value="contracts">{t('legal.areas.contracts')}</option>
                            <option value="disputes">{t('legal.areas.disputes')}</option>
                            <option value="family">{t('legal.areas.family')}</option>
                            <option value="corporate">{t('legal.areas.corporate')}</option>
                            <option value="real_estate">{t('legal.areas.real_estate')}</option>
                            <option value="labor">{t('legal.areas.labor')}</option>
                            <option value="other">{t('legal.areas.other')}</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field full-width">
                        <label htmlFor="notes" className="form-label">
                            {t('legal.caseDescription')}
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows={6}
                            placeholder={t('legal.placeholders.caseDescription')}
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

export default LegalConsultingForm;
