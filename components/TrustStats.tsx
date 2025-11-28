import React from 'react';
import { useTranslation } from 'react-i18next';

const TRUST_STATS_DATA = [
    { value: '500+', key: 'clients' },
    { value: '7', key: 'areas' },
    { value: '4', key: 'offices' },
    { value: '15+', key: 'partners' },
];

const TrustStats: React.FC = () => {
    const { t } = useTranslation('home');
    
    return (
        <div className="trust-stats">
            {TRUST_STATS_DATA.map((stat, index) => (
                <div key={index} className="trust-stat-item">
                    <div className="trust-stat-value">{stat.value}</div>
                    <div className="trust-stat-label">{t(`trustStats.${stat.key}`)}</div>
                </div>
            ))}
        </div>
    );
};

export default TrustStats;
