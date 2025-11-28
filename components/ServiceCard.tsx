import React from 'react';
import type { Service } from '../types';
import TargetBadge from './TargetBadge';
import ServiceIcon from './ServiceIcon';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const { slug, theme, targetAudience, idealFor } = service;
    const { t } = useTranslation('services');

    const serviceTitle = t(`services.${theme}.title`);

    return (
        <article className="service-card card-hover-lift" data-service={theme}>
            <div className="service-card-header">
                <ServiceIcon service={theme} className="icon" />
                <p className="service-type">{serviceTitle}</p>
            </div>
            {targetAudience && targetAudience.length > 0 && (
                <div className="service-card-badges">
                    {targetAudience.map((target) => (
                        <TargetBadge key={target} target={target} />
                    ))}
                </div>
            )}
            <p className="subtitle">{t(`services.${theme}.subtitle`)}</p>
            {idealFor && <p className="service-card-ideal">{t(`services.${theme}.idealFor`)}</p>}
            <a className="micro-cta" href={`#/servizi/${slug}`} aria-label={`${t('page.moreInfo')} ${serviceTitle}`}>
                {t('page.moreInfo')}
            </a>
        </article>
    );
};

export default ServiceCard;
