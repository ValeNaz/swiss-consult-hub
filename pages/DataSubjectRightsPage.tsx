import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/LegalPages.css';
import '../styles/DataSubjectRights.css';

type RightType = 'access' | 'rectification' | 'erasure' | 'portability' | 'objection' | 'limitation';

const DataSubjectRightsPage: React.FC = () => {
    const { t } = useTranslation('legal');
    const [formData, setFormData] = useState({
        rightType: '' as RightType | '',
        fullName: '',
        email: '',
        phone: '',
        description: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRightTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, rightType: e.target.value as RightType }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log('🔐 Richiesta Diritti:', formData);
        
        setIsSubmitted(true);
        setIsSubmitting(false);
        
        // Reset form after 5 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                rightType: '',
                fullName: '',
                email: '',
                phone: '',
                description: '',
            });
        }, 5000);
    };

    const rights = [
        {
            id: 'access',
            title: t('dataRights.rights.access.title'),
            description: t('dataRights.rights.access.description'),
            icon: t('dataRights.rights.access.icon'),
        },
        {
            id: 'rectification',
            title: t('dataRights.rights.rectification.title'),
            description: t('dataRights.rights.rectification.description'),
            icon: t('dataRights.rights.rectification.icon'),
        },
        {
            id: 'erasure',
            title: t('dataRights.rights.erasure.title'),
            description: t('dataRights.rights.erasure.description'),
            icon: t('dataRights.rights.erasure.icon'),
        },
        {
            id: 'portability',
            title: t('dataRights.rights.portability.title'),
            description: t('dataRights.rights.portability.description'),
            icon: t('dataRights.rights.portability.icon'),
        },
        {
            id: 'objection',
            title: t('dataRights.rights.objection.title'),
            description: t('dataRights.rights.objection.description'),
            icon: t('dataRights.rights.objection.icon'),
        },
        {
            id: 'limitation',
            title: t('dataRights.rights.limitation.title'),
            description: t('dataRights.rights.limitation.description'),
            icon: t('dataRights.rights.limitation.icon'),
        },
    ];

    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1>{t('dataRights.header.title')}</h1>
                    <p className="legal-last-update">
                        {t('dataRights.header.subtitle')}
                    </p>
                </header>

                {/* Content */}
                <div className="legal-content">
                    {/* Introduzione */}
                    <section className="legal-section">
                        <h2>{t('dataRights.intro.title')}</h2>
                        <p>
                            {t('dataRights.intro.description')}
                        </p>
                        <div className="legal-info-box">
                            <h4>{t('dataRights.intro.infoBox.title')}</h4>
                            <p><strong>{t('dataRights.intro.infoBox.responseTime')}</strong> {t('dataRights.intro.infoBox.responseTimeValue')}</p>
                            <p><strong>{t('dataRights.intro.infoBox.free')}</strong> {t('dataRights.intro.infoBox.freeValue')}</p>
                            <p><strong>{t('dataRights.intro.infoBox.verification')}</strong> {t('dataRights.intro.infoBox.verificationValue')}</p>
                        </div>
                    </section>

                    {/* Grid Diritti */}
                    <section className="legal-section">
                        <h2>{t('dataRights.rights.title')}</h2>
                        <div className="rights-grid">
                            {rights.map((right) => (
                                <div key={right.id} className="right-card">
                                    <div className="right-icon">{right.icon}</div>
                                    <h3>{right.title}</h3>
                                    <p>{right.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Form */}
                    <section className="legal-section">
                        <h2>{t('dataRights.form.title')}</h2>
                        {isSubmitted ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <Check size={48} />
                                </div>
                                <h3>{t('dataRights.success.title')}</h3>
                                <p>
                                    {t('dataRights.success.message')}
                                </p>
                                <p className="success-note">
                                    {t('dataRights.success.confirmationEmail')} <strong>{formData.email}</strong>
                                </p>
                            </div>
                        ) : (
                            <form className="rights-form" onSubmit={handleSubmit}>
                                {/* Right Type Selection */}
                                <div className="form-section">
                                    <label className="form-label required">
                                        {t('dataRights.form.selectLabel')}
                                    </label>
                                    <div className="radio-group">
                                        {rights.map((right) => (
                                            <label key={right.id} className="radio-card">
                                                <input
                                                    type="radio"
                                                    name="rightType"
                                                    value={right.id}
                                                    checked={formData.rightType === right.id}
                                                    onChange={handleRightTypeChange}
                                                    required
                                                />
                                                <div className="radio-content">
                                                    <span className="radio-icon">{right.icon}</span>
                                                    <span className="radio-title">{right.title}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="form-section">
                                    <label className="form-label required" htmlFor="fullName">
                                        {t('dataRights.form.labels.fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        className="form-input"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        placeholder={t('dataRights.form.placeholders.fullName')}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-section">
                                        <label className="form-label required" htmlFor="email">
                                            {t('dataRights.form.labels.email')}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder={t('dataRights.form.placeholders.email')}
                                        />
                                    </div>

                                    <div className="form-section">
                                        <label className="form-label" htmlFor="phone">
                                            {t('dataRights.form.labels.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder={t('dataRights.form.placeholders.phone')}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-section">
                                    <label className="form-label required" htmlFor="description">
                                        {t('dataRights.form.labels.description')}
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder={t('dataRights.form.placeholders.description')}
                                    />
                                    <p className="form-hint">
                                        {t('dataRights.form.hint')}
                                    </p>
                                </div>

                                {/* Notice */}
                                <div className="form-notice">
                                    <AlertCircle size={20} />
                                    <div>
                                        <strong>{t('dataRights.form.notice.title')}</strong> {t('dataRights.form.notice.text')}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="form-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('dataRights.form.submitting') : t('dataRights.form.submit')}
                                </button>

                                <p className="form-privacy">
                                    {t('dataRights.form.privacyText')}{' '}
                                    <a href="/#/privacy-policy">{t('dataRights.form.privacyLink')}</a>.
                                </p>
                            </form>
                        )}
                    </section>

                    {/* Alternative Contact */}
                    <section className="legal-section">
                        <h2>{t('dataRights.contact.title')}</h2>
                        <p>{t('dataRights.contact.intro')}</p>
                        <div className="legal-contact-box">
                            <h4>{t('dataRights.contact.dpoTitle')}</h4>
                            <p><strong>{t('dataRights.contact.email')}</strong> <a href="mailto:dpo@swissconsulthub.ch">dpo@swissconsulthub.ch</a></p>
                            <p><strong>{t('dataRights.contact.phone')}</strong> +41 412 420 442</p>
                            <p><strong>{t('dataRights.contact.address')}</strong> Spinnereistrasse 5, 6220 Emmenbrücke, Lucerna, Svizzera</p>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="legal-section">
                        <h2>{t('dataRights.faq.title')}</h2>

                        <div className="faq-item">
                            <h4>{t('dataRights.faq.q1.question')}</h4>
                            <p>{t('dataRights.faq.q1.answer')}</p>
                        </div>

                        <div className="faq-item">
                            <h4>{t('dataRights.faq.q2.question')}</h4>
                            <p>{t('dataRights.faq.q2.answer')}</p>
                        </div>

                        <div className="faq-item">
                            <h4>{t('dataRights.faq.q3.question')}</h4>
                            <p>{t('dataRights.faq.q3.answer')}</p>
                        </div>

                        <div className="faq-item">
                            <h4>{t('dataRights.faq.q4.question')}</h4>
                            <p>{t('dataRights.faq.q4.answer')}</p>
                        </div>
                    </section>

                    {/* IFPD Contact */}
                    <section className="legal-section">
                        <h2>{t('dataRights.authority.title')}</h2>
                        <p>
                            {t('dataRights.authority.intro')}
                        </p>
                        <div className="legal-contact-box">
                            <h4>{t('dataRights.authority.name')}</h4>
                            <p><strong>{t('dataRights.authority.address')}</strong> {t('dataRights.authority.addressValue')}</p>
                            <p><strong>{t('dataRights.authority.email')}</strong> <a href="mailto:contact@edoeb.admin.ch">contact@edoeb.admin.ch</a></p>
                            <p><strong>{t('dataRights.authority.phone')}</strong> +41 31 325 95 95</p>
                            <p><strong>{t('dataRights.authority.website')}</strong> <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer">www.edoeb.admin.ch</a></p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="legal-footer-section">
                    <p className="legal-back-link">
                        <a href="/#/">{t('dataRights.footer.backLink')}</a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default DataSubjectRightsPage;
