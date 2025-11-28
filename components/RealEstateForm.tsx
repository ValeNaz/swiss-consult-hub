import React, { useState } from 'react';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { useTranslation } from 'react-i18next';

interface RealEstateFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
}

const RealEstateForm: React.FC = () => {
    const { t } = useTranslation('forms');
    const [formData, setFormData] = useState<RealEstateFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                serviceType: 'immobiliare',
                description: `${t('realEstate.title')}${formData.notes ? ': ' + formData.notes : ''}`,
                notes: formData.notes
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
                <h3>{t('realEstate.title')}</h3>
                <p>
                    {t('realEstate.subtitle')}
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
                            rows={6}
                            placeholder={t('common.placeholders.notes')}
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

export default RealEstateForm;
