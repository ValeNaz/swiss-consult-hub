
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import TargetBadge from '../components/TargetBadge';
import ServiceIcon from '../components/ServiceIcon';
import CreditCalculatorV2 from '../components/CreditCalculatorV2';
import DocumentUploadForm from '../components/DocumentUploadForm';
import TaxDeclarationForm from '../components/TaxDeclarationForm';
import ContactRequestForm from '../components/ContactRequestForm';
import LoanRequestModalV2 from '../components/LoanRequestModalV2';
import InsuranceConsultingForm from '../components/InsuranceConsultingForm';
import RealEstateForm from '../components/RealEstateForm';
import JobConsultingForm from '../components/JobConsultingForm';
import LegalConsultingForm from '../components/LegalConsultingForm';
import MedicalConsultingForm from '../components/MedicalConsultingForm';
import { SERVICES_DATA } from '../constants';

const ServiceDetailPage: React.FC = () => {
    const { t } = useTranslation('services');
    const { slug } = useParams<{ slug: string }>();
    const service = SERVICES_DATA.find((item) => item.slug === slug);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

    if (!service) {
        return (
            <section className="section">
                <div className="container section-heading">
                    <h2 className="section-title">{t('detail.notFound')}</h2>
                    <p className="section-subtitle">{t('detail.notFoundDesc')}</p>
                    <div className="cta-group centered">
                        <Button href="#/servizi" variant="secondary">
                            {t('detail.backToServices')}
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    const i18nDescriptionRaw = t(`services.${service.theme}.description`, { defaultValue: service.description || '' });
    const descriptionParagraphs = i18nDescriptionRaw && typeof i18nDescriptionRaw === 'string'
        ? i18nDescriptionRaw.split('\n').map((paragraph) => paragraph.trim()).filter(Boolean)
        : [];

    return (
        <div>
            <section className="section">
                <div className="container hero-service">
                    <aside className="service-info-box" data-service={service.theme}>
                        <span className="icon"><ServiceIcon service={service.theme} /></span>
                        {service.targetAudience && service.targetAudience.length > 0 && (
                            <div className="service-card-badges" style={{ marginBottom: '12px' }}>
                                {service.targetAudience.map((target) => (
                                    <TargetBadge key={target} target={target} />
                                ))}
                            </div>
                        )}
                        <h1>{t(`services.${service.theme}.title`, { defaultValue: service.title })}</h1>
                        <p className="subtitle">{t(`services.${service.theme}.subtitle`, { defaultValue: service.subtitle })}</p>
                        <div className="cta-group">
                            <Button href={service.ctaPrimary.link} variant="tertiary" size="full">
                                {t(`services.${service.theme}.ctaPrimary`, { defaultValue: service.ctaPrimary.text })}
                            </Button>
                            {service.ctaSecondary ? (
                                <Button href={service.ctaSecondary.link} variant="secondary" size="full">
                                    {t(`services.${service.theme}.ctaSecondary`, { defaultValue: service.ctaSecondary.text })}
                                </Button>
                            ) : null}
                        </div>
                        <div className="info-box on-dark">
                            <span className="info-box-title">{t('detail.immediateSupport')}</span>
                            <div className="info-box-item">
                                <a href="mailto:info@swissconsulthub.ch">info@swissconsulthub.ch</a>
                            </div>
                            <div className="info-box-item">
                                <a href="tel:+41783588121">+41 783 588 121</a>
                            </div>
                        </div>
                    </aside>
                    <div className="service-content" data-service={service.theme}>
                        {service.idealFor && (
                            <div className="ideal-for-badge">
                                {t(`services.${service.theme}.idealFor`, { defaultValue: service.idealFor })}
                            </div>
                        )}
                        <div className="service-section">
                            <span className="section-eyebrow">{t('detail.overview')}</span>
                            {descriptionParagraphs.length ? (
                                descriptionParagraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))
                            ) : (
                                <p>
                                    {t('detail.contactForDetails')}
                                </p>
                            )}
                        </div>

                        {service.details?.points?.length ? (
                            <div className="service-section">
                                <h4>{t(`services.${service.theme}.sectionTitle`, { defaultValue: service.details.sectionTitle ?? 'Cosa include il servizio' })}</h4>
                                <ul className="bullet-list">
                                    {(() => {
                                      const translatedPoints = t(`services.${service.theme}.points`, { returnObjects: true, defaultValue: null });
                                      const points = (Array.isArray(translatedPoints) ? translatedPoints : service.details.points) || [];
                                      return points.map((point, index) => (
                                        <li key={index}>{point}</li>
                                      ));
                                    })()}
                                </ul>
                            </div>
                        ) : null}

                        <div className="service-section">
                            <h4>{t('detail.howWeWork.title')}</h4>
                            <ul className="bullet-list">
                                {t('detail.howWeWork.points', { returnObjects: true }).map((point: string, index: number) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="info-box">
                            <span className="info-box-title">{t('detail.usefulDocuments.title')}</span>
                            <div className="info-box-item">
                                {t('detail.usefulDocuments.checklist')}
                            </div>
                            <div className="info-box-item">
                                {t('detail.usefulDocuments.call')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Calcolatore e Form per Consulenza Creditizia */}
            {service.slug === 'consulenza-creditizia' && (
                <>
                    <section className="section bg-neutral" data-service={service.theme}>
                        <div className="container">
                            <div className="section-heading">
                                <span className="section-eyebrow">{t('detail.creditCalculator.eyebrow')}</span>
                                <h2 className="section-title">{t('detail.creditCalculator.title')}</h2>
                                <p className="section-subtitle">
                                    {t('detail.creditCalculator.subtitle')}
                                </p>
                            </div>
                            <CreditCalculatorV2 onOpenLoanModal={() => setIsLoanModalOpen(true)} />
                        </div>
                    </section>

                    <LoanRequestModalV2 isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} />
                </>
            )}

            {/* Form per Consulenza Commerciale */}
            {service.slug === 'consulenza-commerciale' && (
                <>
                    <section className="section bg-neutral" data-service={service.theme}>
                        <div className="container">
                            <div className="section-heading">
                                <span className="section-eyebrow">{t('detail.taxDeclaration.eyebrow')}</span>
                                <h2 className="section-title">{t('detail.taxDeclaration.title')}</h2>
                                <p className="section-subtitle">
                                    {t('detail.taxDeclaration.subtitle')}
                                </p>
                            </div>
                            <TaxDeclarationForm />
                        </div>
                    </section>

                    <section className="section">
                        <div className="container">
                            <div className="section-heading">
                                <span className="section-eyebrow">{t('detail.contactRequest.eyebrow')}</span>
                                <h2 className="section-title">{t('detail.contactRequest.title')}</h2>
                                <p className="section-subtitle">
                                    {t('detail.contactRequest.subtitle')}
                                </p>
                            </div>
                            <ContactRequestForm />
                        </div>
                    </section>
                </>
            )}

            {/* Form per Consulenza Assicurativa */}
            {service.slug === 'consulenza-assicurativa' && (
                <section className="section bg-neutral" data-service={service.theme}>
                    <div className="container">
                        <div className="section-heading">
                            <span className="section-eyebrow">{t('detail.insuranceConsulting.eyebrow')}</span>
                            <h2 className="section-title">{t('detail.insuranceConsulting.title')}</h2>
                            <p className="section-subtitle">
                                {t('detail.insuranceConsulting.subtitle')}
                            </p>
                        </div>
                        <InsuranceConsultingForm />
                    </div>
                </section>
            )}

            {/* Form per Intermediazione Immobiliare */}
            {service.slug === 'intermediazione-immobiliare' && (
                <section className="section bg-neutral" data-service={service.theme}>
                    <div className="container">
                        <div className="section-heading">
                            <span className="section-eyebrow">{t('detail.realEstate.eyebrow')}</span>
                            <h2 className="section-title">{t('detail.realEstate.title')}</h2>
                            <p className="section-subtitle">
                                {t('detail.realEstate.subtitle')}
                            </p>
                        </div>
                        <RealEstateForm />
                    </div>
                </section>
            )}

            {/* Form per Consulenza Lavorativa */}
            {service.slug === 'consulenza-lavorativa-professionale' && (
                <section className="section bg-neutral" data-service={service.theme}>
                    <div className="container">
                        <div className="section-heading">
                            <span className="section-eyebrow">{t('detail.jobConsulting.eyebrow')}</span>
                            <h2 className="section-title">{t('detail.jobConsulting.title')}</h2>
                            <p className="section-subtitle">
                                {t('detail.jobConsulting.subtitle')}
                            </p>
                        </div>
                        <JobConsultingForm />
                    </div>
                </section>
            )}

            {/* Form per Consulenza Legale */}
            {service.slug === 'consulenza-legale' && (
                <section className="section bg-neutral" data-service={service.theme}>
                    <div className="container">
                        <div className="section-heading">
                            <span className="section-eyebrow">{t('detail.legalConsulting.eyebrow')}</span>
                            <h2 className="section-title">{t('detail.legalConsulting.title')}</h2>
                            <p className="section-subtitle">
                                {t('detail.legalConsulting.subtitle')}
                            </p>
                        </div>
                        <LegalConsultingForm />
                    </div>
                </section>
            )}

            {/* Form per Consulenza Medica */}
            {service.slug === 'consulenza-medica' && (
                <section className="section bg-neutral" data-service={service.theme}>
                    <div className="container">
                        <div className="section-heading">
                            <span className="section-eyebrow">{t('detail.medicalConsulting.eyebrow')}</span>
                            <h2 className="section-title">{t('detail.medicalConsulting.title')}</h2>
                            <p className="section-subtitle">
                                {t('detail.medicalConsulting.subtitle')}
                            </p>
                        </div>
                        <MedicalConsultingForm />
                    </div>
                </section>
            )}

            <section className="section bg-neutral">
                <div className="container section-heading animate-on-scroll">
                    <span className="section-eyebrow">{t('detail.readyToStart.eyebrow')}</span>
                    <h2 className="section-title">{t('detail.readyToStart.title')}</h2>
                    <p className="section-subtitle">
                        {t('detail.readyToStart.subtitle')}
                    </p>
                    <div className="cta-group centered">
                        <Button href="#/contatti" variant="tertiary" size="lg">
                            {t('detail.readyToStart.primaryCta')}
                        </Button>
                        <Button href="#/servizi" variant="secondary" size="lg">
                            {t('detail.readyToStart.secondaryCta')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServiceDetailPage;
