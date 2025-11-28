import React from 'react';
import type { TargetAudience } from '../types';
import { useTranslation } from 'react-i18next';

interface TargetBadgeProps {
    target: TargetAudience;
}

const TargetBadge: React.FC<TargetBadgeProps> = ({ target }) => {
    const { t } = useTranslation('services');
    return (
        <span className="target-badge" data-target={target}>
            {t(`targetAudience.${target}`)}
        </span>
    );
};

export default TargetBadge;
