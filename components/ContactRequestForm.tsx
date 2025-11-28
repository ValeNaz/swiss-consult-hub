import React, { useState } from 'react';
import Button from './Button';
import { formSubmissionService } from '../services/formSubmissionService';
import { useTranslation } from 'react-i18next';

interface ContactFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
}

const ContactRequestForm: React.FC = () => {
    const { t } = useTranslation('contact');
    const [formData, setFormData] = useState<ContactFormData>({
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
                serviceType: 'generale',
                description: `Richiesta di contatto${formData.notes ? ': ' + formData.notes : ''}`,
                notes: formData.notes
            });

            if (result.success) {
                setSubmitMessage({
                    type: 'success',
                    text: t('form.success')
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
                    text: result.error || t('form.error')
                });
            }
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: t('form.error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-request-form">
            <div className="form-header">
                <h3>{t('form.title')}</h3>
                <p>
                    {t('form.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="commercial-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName" className="form-label">
                            {t('form.firstName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('form.placeholders.firstName')}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="lastName" className="form-label">
                            {t('form.lastName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('form.placeholders.lastName')}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">
                            {t('form.email')} <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('form.placeholders.email')}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phone" className="form-label">
                            {t('form.phone')} <span className="required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            placeholder={t('form.placeholders.phone')}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field full-width">
                        <label htmlFor="notes" className="form-label">
                            {t('form.notes')}
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows={6}
                            placeholder={t('form.placeholders.notes')}
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
                        {isSubmitting ? t('form.submitting') : t('form.submit')}
                    </Button>
                </div>

                <p className="form-privacy">
                    {t('form.privacy')}{' '}
                    <a href="#/privacy">{t('form.privacyLink')}</a>.
                </p>
            </form>
        </div>
    );
};

export default ContactRequestForm;
