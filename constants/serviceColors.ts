/**
 * Colori dei servizi - Consistenti in tutto il pannello admin
 * Sincronizzati con i colori del sito pubblico
 */

export const SERVICE_COLORS: Record<string, string> = {
  creditizia: '#4f46e5',      // Indigo
  assicurativa: '#2563eb',    // Blue
  immobiliare: '#059669',     // Emerald
  lavorativa: '#ea580c',      // Orange
  legale: '#7c3aed',          // Violet
  medica: '#0891b2',          // Cyan
  fiscale: '#db2777',         // Pink
  commerciale: '#dc2626',     // Red
  generale: '#6b7886'         // Gray
};

export const SERVICE_LABELS: Record<string, string> = {
  creditizia: 'Credito',
  assicurativa: 'Assicurazione',
  immobiliare: 'Immobiliare',
  lavorativa: 'Lavoro',
  legale: 'Legale',
  medica: 'Medica',
  fiscale: 'Fiscale',
  commerciale: 'Commerciale',
  generale: 'Generale'
};

export const getServiceColor = (serviceType: string): string => {
  return SERVICE_COLORS[serviceType] || SERVICE_COLORS.generale;
};

export const getServiceLabel = (serviceType: string): string => {
  return SERVICE_LABELS[serviceType] || serviceType;
};

export const getServiceColorWithAlpha = (serviceType: string, alpha: number = 0.1): string => {
  const color = getServiceColor(serviceType);
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
