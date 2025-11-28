
import React from 'react';
import HeroVideo from '../media/Video/HeroHome.mp4';
import Button from '../components/Button';
import ServiceCard from '../components/ServiceCard';
import ProcessStep from '../components/ProcessStep';
import TrustStats from '../components/TrustStats';
import ServicesMarquee from '../components/ServicesMarquee';
import { SERVICES_DATA, PROCESS_STEPS } from '../constants';
import { useTranslation } from 'react-i18next';
import '../styles/HomePage.css';

const VALUE_POINTS = [] as const; // testo via i18n

const HomePage: React.FC = () => {
    const { t } = useTranslation('home');
    return (
        <div>
            <section className="hero-home">
                <div className="hero-video">
                    <video
                        className="hero-video-element"
                        src={HeroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                    />
                </div>
                <div className="container hero-content">
                    <h1 className="hero-title">
                        {t('hero.title')}
                    </h1>
                    <div className="hero-anchors">
                        <span>{t('hero.anchor1')}</span>
                        <span className="separator">•</span>
                        <span>{t('hero.anchor2')}</span>
                        <span className="separator">•</span>
                        <span>{t('hero.anchor3')}</span>
                    </div>
                    <div className="hero-cta">
                        <Button href="#/contatti" variant="tertiary" size="lg">
                            {t('hero.ctaPrimary')}
                        </Button>
                        <Button href="#/servizi" variant="secondary" size="lg" className="on-dark">
                            {t('hero.ctaSecondary')}
                        </Button>
                    </div>
                    <div className="hero-stats-group">
                        <div className="hero-stat">
                            <strong>500+</strong> {t('hero.stats.clients')}
                        </div>
                        <div className="hero-stat">
                            <strong>7</strong> {t('hero.stats.areas')}
                        </div>
                        <div className="hero-stat">
                            <strong>4</strong> {t('hero.stats.offices')}
                        </div>
                    </div>
                </div>
                <ServicesMarquee />
            </section>

            <section className="section">
                <div className="container">
                    <div className="section-heading animate-on-scroll">
                        <span className="section-eyebrow">{t('process.eyebrow')}</span>
                        <h2 className="section-title">{t('process.title')}</h2>
                        <p className="section-subtitle">
                            {t('process.subtitle')}
                        </p>
                    </div>
                    <div className="process-steps">
                        {[1,2,3].map((n) => (
                            <div key={n} className="animate-on-scroll">
                                <ProcessStep 
                                    number={n} 
                                    title={t(`process.step${n}Title`)} 
                                    description={t(`process.step${n}Description`)} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-neutral">
                <div className="container">
                    <div className="section-heading animate-on-scroll">
                        <span className="section-eyebrow">{t('servicesSection.eyebrow')}</span>
                        <h2 className="section-title">{t('servicesSection.title')}</h2>
                        <p className="section-subtitle">
                            {t('servicesSection.subtitle')}
                        </p>
                    </div>
                    <div className="services-grid">
                        {SERVICES_DATA.map((service) => (
                            <div className="animate-on-scroll" key={service.slug}>
                                <ServiceCard service={service} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section bg-gradient-navy">
                <div className="container">
                    <div className="animate-on-scroll">
                        <TrustStats />
                    </div>
                </div>
            </section>

            <section className="section why-us-section">
                <div className="container">
                    <div className="why-us-grid animate-on-scroll">
                        <div className="why-us-content">
                            <span className="section-eyebrow">{t('whyUs.eyebrow')}</span>
                            <h2 className="section-title">
                                {t('whyUs.title')}
                            </h2>
                            <p className="section-subtitle">
                                {t('whyUs.subtitle')}
                            </p>
                            <ul className="bullet-list why-us-list">
                                <li>{t('whyUs.point1')}</li>
                                <li>{t('whyUs.point2')}</li>
                                <li>{t('whyUs.point3')}</li>
                            </ul>
                            <div className="cta-group">
                                <Button href="#/chi-siamo" variant="primary">
                                    {t('whyUs.ctaTeam')}
                                </Button>
                                <Button href="#/servizi" variant="secondary">
                                    {t('whyUs.ctaServices')}
                                </Button>
                            </div>
                        </div>

                        <div className="values-container">
                            {(['1','2','3'] as const).map((idx, index) => (
                                <article key={idx} className={`value-card-modern value-${index + 1}`}>
                                    <div className="value-number">{idx}</div>
                                    <div className="value-content">
                                        <h3>{t(`whyUs.value${idx}Title`)}</h3>
                                        <p>{t(`whyUs.value${idx}Description`)}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="section bg-gradient-navy">
                <div className="container section-heading centered">
                    <h2 className="section-title title-on-dark">
                        {t('finalCta.title')}
                    </h2>
                    <p className="section-subtitle text-on-dark">
                        {t('finalCta.subtitle')}
                    </p>
                    <div className="cta-group centered">
                        <Button href="#/contatti" variant="tertiary" size="lg">
                            {t('finalCta.cta')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
