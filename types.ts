
export type TargetAudience = 'privati' | 'pmi' | 'aziende';

export interface Service {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    theme:
        | 'assicurativa'
        | 'immobiliare'
        | 'lavorativa'
        | 'legale'
        | 'medica'
        | 'creditizia'
        | 'commerciale';
    icon: string;
    details: {
        sectionTitle?: string;
        points: string[];
    };
    ctaPrimary: {
        text: string;
        link: string;
    };
    ctaSecondary?: {
        text: string;
        link: string;
    };
    targetAudience?: TargetAudience[];
    idealFor?: string;
}
