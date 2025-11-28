
import React from 'react';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import '../styles/AboutPage.css';

const AboutPage: React.FC = () => {
    const { t } = useTranslation('about');
    
    return (
        <div>
            <section className="hero-internal">
                <div className="container">
                    <h1>{t('hero.title')}</h1>
                    <p className="subtitle">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            <section className="section mission-section">
                <div className="container">
                    <div className="mission-grid animate-on-scroll">
                        <div className="mission-content">
                            <span className="section-eyebrow">{t('mission.eyebrow')}</span>
                            <h2 className="section-title">{t('mission.title')}</h2>
                            <p className="section-subtitle">
                                {t('mission.subtitle')}
                            </p>
                            <ul className="bullet-list mission-list">
                                {(t('mission.points', { returnObjects: true }) as string[]).map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                ))}
                            </ul>
                            <div className="cta-group">
                                <Button href="#/servizi" variant="secondary">
                                    {t('mission.ctaServices')}
                                </Button>
                                <Button href="#/contatti" variant="tertiary">
                                    {t('mission.ctaMeeting')}
                                </Button>
                            </div>
                        </div>

                        <div className="pillars-container">
                            {(['1', '2', '3'] as const).map((idx, index) => (
                                <article key={idx} className={`pillar-card pillar-${index + 1}`}>
                                    <div className="pillar-number">{idx}</div>
                                    <div className="pillar-content">
                                        <h3>{t(`pillars.pillar${idx}Title`)}</h3>
                                        <p>{t(`pillars.pillar${idx}Description`)}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="section bg-neutral">
                <div className="container">
                    <div className="section-heading animate-on-scroll">
                        <span className="section-eyebrow">{t('history.eyebrow')}</span>
                        <h2 className="section-title">{t('history.title')}</h2>
                        <p className="section-subtitle">
                            {t('history.subtitle')}
                        </p>
                    </div>
                    <div className="timeline animate-on-scroll">
                        {(['2018', '2020', '2023'] as const).map((year) => (
                            <div key={year} className="timeline-item">
                                <span className="timeline-year">{year}</span>
                                <p>{t(`history.timeline.${year}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container two-column animate-on-scroll">
                    <div className="info-box">
                        <span className="info-box-title">{t('offices.title')}</span>
                        <div className="info-box-item">{t('offices.lucerne')}</div>
                        <div className="info-box-item">{t('offices.zurich')}</div>
                        <div className="info-box-item">{t('offices.lugano')}</div>
                        <div className="info-box-item">{t('offices.network')}</div>
                    </div>
                    <div>
                        <h2 className="headline-md">{t('team.title')}</h2>
                        <p>
                            {t('team.description')}
                        </p>
                        <ul className="bullet-list">
                            {(t('team.points', { returnObjects: true }) as string[]).map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="section bg-gradient-navy">
                <div className="container section-heading centered">
                    <h2 className="section-title title-on-dark">{t('finalCta.title')}</h2>
                    <p className="section-subtitle text-on-dark">
                        {t('finalCta.subtitle')}
                    </p>
                    <div className="cta-group centered">
                        <Button href="#/contatti" variant="tertiary" size="lg">
                            {t('finalCta.ctaConsultation')}
                        </Button>
                        <Button href="#/servizi" variant="secondary" size="lg">
                            {t('finalCta.ctaServices')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
