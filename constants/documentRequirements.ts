export const DOCUMENT_UPLOAD_FIELDS = [
    'betreibungsauszugCurrent',
    'betreibungsauszugPrevious',
    'documentoPersonale',
    'permessoSoggiorno',
    'bustePaga',
    'contrattoLavoro',
    'contrattoAffitto',
    'polizzaAssicurazione',
    'autenticaPermesso',
    'contrattoCredito'
] as const;

export type DocumentUploadField = typeof DOCUMENT_UPLOAD_FIELDS[number];
export type DocumentTranslationKey = `loanRequest.documents.${DocumentUploadField}`;

export interface DocumentRequirement {
    field: DocumentUploadField;
    translationKey: DocumentTranslationKey;
    optional?: boolean;
}

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = DOCUMENT_UPLOAD_FIELDS.map((field) => ({
    field,
    translationKey: `loanRequest.documents.${field}` as DocumentTranslationKey,
    optional: field === 'contrattoCredito'
}));
