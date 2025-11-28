import React, { useState } from 'react';
import Button from '../components/Button';
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/ContactPage.css';

const ContactPage: React.FC = () => {
    const { t } = useTranslation('contact');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (isSubmitted) {
            setIsSubmitted(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
            setFormData({ fullName: '', email: '', phone: '', company: '', subject: '', message: '' });
        }, 1500);
    };

    const contactInfo = [
        {
            icon: <Mail size={24} />,
            title: t('quickContact.email'),
            items: [
                { label: 'info@swissconsulthub.ch', href: 'mailto:info@swissconsulthub.ch' }
            ]
        },
        {
            icon: <Phone size={24} />,
            title: t('quickContact.phone'),
            items: [
                { label: '+41 412 420 442', href: 'tel:+41412420442' },
                { label: '+41 783 588 121', href: 'tel:+41783588121' }
            ]
        },
        {
            icon: <MapPin size={24} />,
            title: t('quickContact.locations'),
            items: [
                { label: t('quickContact.offices.emmenbrucke.name'), desc: t('quickContact.offices.emmenbrucke.address') },
                { label: t('quickContact.offices.zurich.name'), desc: t('quickContact.offices.zurich.address') },
                { label: t('quickContact.offices.lugano.name'), desc: t('quickContact.offices.lugano.address') },
                { label: t('quickContact.offices.lucerne.name'), desc: t('quickContact.offices.lucerne.address') }
            ]
        },
        {
            icon: <Clock size={24} />,
            title: t('quickContact.hours'),
            items: [
                { label: t('quickContact.schedule.weekdays'), desc: t('quickContact.schedule.weekdaysHours') },
                { label: t('quickContact.schedule.saturday'), desc: t('quickContact.schedule.saturdayHours') }
            ]
        }
    ];

    const subjects = [
        t('subjects.credit'),
        t('subjects.insurance'),
        t('subjects.realEstate'),
        t('subjects.employment'),
        t('subjects.legal'),
        t('subjects.medical'),
        t('subjects.tax'),
        t('subjects.other')
    ];

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <div className="contact-hero-text">
                        <span className="section-eyebrow">{t('hero.eyebrow')}</span>
                        <h1 className="contact-hero-title">{t('hero.title')}</h1>
                        <p className="contact-hero-subtitle">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                    <div className="contact-hero-image">
                        <div className="hero-placeholder">
                            <div className="hero-icon">💬</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="contact-quick">
                <div className="container">
                    <div className="quick-cards-grid">
                        {contactInfo.map((info, index) => (
                            <div key={index} className="quick-card">
                                <div className="quick-card-icon">{info.icon}</div>
                                <h3 className="quick-card-title">{info.title}</h3>
                                <div className="quick-card-content">
                                    {info.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="quick-card-item">
                                            {item.href ? (
                                                <a href={item.href} className="quick-card-link">
                                                    {item.label}
                                                    <ArrowRight size={16} />
                                                </a>
                                            ) : (
                                                <>
                                                    <div className="quick-card-label">{item.label}</div>
                                                    {item.desc && <div className="quick-card-desc">{item.desc}</div>}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="contact-main">
                <div className="container">
                    <div className="contact-layout">
                        {/* Form Section */}
                        <div className="contact-form-section">
                            <div className="form-header">
                                <h2 className="form-title">{t('contactForm.title')}</h2>
                                <p className="form-subtitle">{t('contactForm.subtitle')}</p>
                            </div>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fullName" className="form-label">{t('contactForm.labels.fullName')}</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            className="form-input"
                                            placeholder={t('contactForm.placeholders.fullName')}
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">{t('contactForm.labels.email')}</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="form-input"
                                            placeholder={t('contactForm.placeholders.email')}
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">{t('contactForm.labels.phone')}</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="form-input"
                                            placeholder={t('contactForm.placeholders.phone')}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="company" className="form-label">{t('contactForm.labels.company')}</label>
                                        <input
                                            id="company"
                                            name="company"
                                            type="text"
                                            className="form-input"
                                            placeholder={t('contactForm.placeholders.company')}
                                            value={formData.company}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject" className="form-label">{t('contactForm.labels.subject')}</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="form-input form-select"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t('subjects.selectPlaceholder')}</option>
                                        {subjects.map((subj) => (
                                            <option key={subj} value={subj}>{subj}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">{t('contactForm.labels.message')}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="form-input form-textarea"
                                        placeholder={t('contactForm.placeholders.message')}
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-actions">
                                    <Button
                                        type="submit"
                                        variant="tertiary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? t('contactForm.buttons.submitting') : t('contactForm.buttons.submit')}
                                        <Send size={18} />
                                    </Button>
                                </div>

                                {isSubmitted && (
                                    <div className="form-success-message">
                                        <div className="success-icon">✓</div>
                                        <h4>{t('contactForm.success.title')}</h4>
                                        <p>{t('contactForm.success.message')}</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Info Section */}
                        <div className="contact-info-section">
                            <div className="info-card">
                                <div className="info-card-icon">📞</div>
                                <h3 className="info-card-title">{t('infoCards.call.title')}</h3>
                                <p className="info-card-text">{t('infoCards.call.description')}</p>
                                <a href="tel:+41412420442" className="info-card-link">
                                    +41 412 420 442
                                </a>
                            </div>

                            <div className="info-card">
                                <div className="info-card-icon">📧</div>
                                <h3 className="info-card-title">{t('infoCards.email.title')}</h3>
                                <p className="info-card-text">{t('infoCards.email.description')}</p>
                                <a href="mailto:info@swissconsulthub.ch" className="info-card-link">
                                    info@swissconsulthub.ch
                                </a>
                            </div>

                            <div className="info-card">
                                <div className="info-card-icon">🏢</div>
                                <h3 className="info-card-title">{t('infoCards.visit.title')}</h3>
                                <p className="info-card-text">{t('infoCards.visit.description')}</p>
                                <div className="office-list">
                                    <div className="office-item">
                                        <strong>{t('infoCards.visit.offices.emmenbrucke')}</strong>
                                        <small>{t('infoCards.visit.offices.emmenbruckeAddress')}</small>
                                    </div>
                                    <div className="office-item">
                                        <strong>{t('infoCards.visit.offices.zurich')}</strong>
                                        <small>{t('infoCards.visit.offices.zurichAddress')}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card info-card-highlight">
                                <div className="info-card-icon">⏰</div>
                                <h3 className="info-card-title">{t('infoCards.hours.title')}</h3>
                                <div className="hours-list">
                                    <div className="hour-item">
                                        <span className="day">{t('infoCards.hours.weekdays')}</span>
                                        <span className="time">{t('infoCards.hours.weekdaysHours')}</span>
                                    </div>
                                    <div className="hour-item">
                                        <span className="day">{t('infoCards.hours.saturday')}</span>
                                        <span className="time">{t('infoCards.hours.saturdayHours')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="contact-cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">{t('cta.title')}</h2>
                        <p className="cta-text">{t('cta.description')}</p>
                        <Button href="/" variant="tertiary">
                            {t('cta.button')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
