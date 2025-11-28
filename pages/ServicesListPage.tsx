
import React from 'react';
import { SERVICES_DATA, TARGET_AUDIENCE_LABELS } from '../constants';
import Button from '../components/Button';
import ServiceIcon from '../components/ServiceIcon';
import type { TargetAudience } from '../types';
import { useTranslation } from 'react-i18next';

const ServicesListPage: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [activeFilter, setActiveFilter] = React.useState<TargetAudience | 'tutti'>('tutti');
    const { t } = useTranslation('services');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleServiceClick = (slug: string) => {
        window.location.href = `#/servizi/${slug}`;
        setIsMobileMenuOpen(false);
    };

    const filteredServices = activeFilter === 'tutti'
        ? SERVICES_DATA
        : SERVICES_DATA.filter(service =>
            service.targetAudience?.includes(activeFilter)
        );

    return (
        <div>
            <section className="hero-internal">
                <div className="container">
                    <h1>{t('page.title')}</h1>
                    <p className="subtitle">
                        {t('page.subtitle')}
                    </p>
                </div>
            </section>

            <section className="section bg-neutral">
                <div className="container">
                    {/* Service Filters */}
                    <div className="service-filters animate-on-scroll">
                        <button
                            className={`filter-button ${activeFilter === 'tutti' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('tutti')}
                        >
                            {t('page.filter.all', { count: SERVICES_DATA.length })}
                        </button>
                        <button
                            className={`filter-button ${activeFilter === 'privati' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('privati')}
                        >
                            {t('targetAudience.privati')}
                        </button>
                        <button
                            className={`filter-button ${activeFilter === 'pmi' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('pmi')}
                        >
                            {t('targetAudience.pmi')}
                        </button>
                        <button
                            className={`filter-button ${activeFilter === 'aziende' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('aziende')}
                        >
                            {t('targetAudience.aziende')}
                        </button>
                    </div>

                    {/* Mobile service dropdown menu - shows ONLY on mobile */}
                    <div className="services-mobile-menu-container">
                        <button 
                            className="services-mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span>{t('page.mobileMenu')}</span>
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        {isMobileMenuOpen && (
                            <nav className="services-mobile-dropdown">
                                <ul>
                                    {SERVICES_DATA.map((service) => (
                                        <li key={service.slug} data-service={service.theme}>
                                            <button onClick={() => handleServiceClick(service.slug)}>
                                                <ServiceIcon service={service.theme} />
                                                <span>{t(`services.${service.theme}.title`)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>

                    <div className="services-page">
                        <aside className="services-sidebar">
                        <nav aria-label={t('page.navigation')}>
                            <ul className="services-menu">
                                {SERVICES_DATA.map((service) => (
                                    <li key={service.slug} className="services-menu-item" data-service={service.theme}>
                                        <a className="services-menu-link" href={`#/servizi/${service.slug}`}>
                                            {t(`services.${service.theme}.title`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="info-box services-info-desktop">
                            <span className="info-box-title">{t('page.support.title')}</span>
                            <div className="info-box-item">
                                {t('page.support.email')} <a href="mailto:info@swissconsulthub.ch">info@swissconsulthub.ch</a>
                            </div>
                            <div className="info-box-item">
                                {t('page.support.phone')} <a href="tel:+41412420442">+41 412 420 442</a>
                            </div>
                        </div>
                    </aside>
                    <div className="service-summary-list">
                        {filteredServices.length === 0 ? (
                            <div className="no-results">
                                <p>{t('page.noResults')}</p>
                                <Button onClick={() => setActiveFilter('tutti')} variant="secondary" size="sm">
                                    {t('page.showAll')}
                                </Button>
                            </div>
                        ) : (
                            filteredServices.map((service) => (
                            <article
                                key={service.slug}
                                className="service-summary animate-on-scroll"
                                data-service={service.theme}
                            >
                                <div className="service-meta">
                                    <div className="service-meta-icon" aria-hidden="true">
                                        <ServiceIcon service={service.theme} />
                                    </div>
                                    <div>
                                        <h3>{t(`services.${service.theme}.title`)}</h3>
                                        <p>{t(`services.${service.theme}.subtitle`)}</p>
                                    </div>
                                </div>
                                {service.details?.points?.length ? (
                                    <ul className="bullet-list">
                                        {(() => {
                                            const points = t(`services.${service.theme}.points`, { returnObjects: true });
                                            return Array.isArray(points)
                                                ? points.slice(0, 3).map((point, index) => (
                                                    <li key={index}>{point}</li>
                                                ))
                                                : null;
                                        })()}
                                    </ul>
                                ) : null}
                                <div className="service-actions">
                                    <Button href={`#/servizi/${service.slug}`} variant="secondary" size="sm">
                                        {t('page.moreInfo')}
                                    </Button>
                                    <Button href={service.ctaPrimary.link} variant="tertiary" size="sm">
                                        {t(`services.${service.theme}.ctaPrimary`)}
                                    </Button>
                                </div>
                            </article>
                        ))
                        )}
                    </div>
                    </div>

                    {/* Mobile info box at bottom - shows ONLY on mobile */}
                    <div className="info-box services-info-mobile">
                        <span className="info-box-title">{t('page.support.title')}</span>
                        <div className="info-box-item">
                            {t('page.support.email')} <a href="mailto:info@swissconsulthub.ch">info@swissconsulthub.ch</a>
                        </div>
                        <div className="info-box-item">
                            {t('page.support.phone')} <a href="tel:+41412420442">+41 412 420 442</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServicesListPage;
