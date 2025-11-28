export type FileValidationErrorKey = 'tooLarge' | 'invalidType';

export interface FileValidationResult {
  valid: boolean;
  errorKey?: FileValidationErrorKey;
  message?: string;
  maxSizeMB?: number;
}

export const DEFAULT_MAX_UPLOAD_MB = 10;
const ALLOWED_TYPES = ['application/pdf'];

export function validatePdfFile(file: File, maxSizeMB: number = DEFAULT_MAX_UPLOAD_MB): FileValidationResult {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      errorKey: 'tooLarge',
      maxSizeMB,
      message: `Il file supera la dimensione massima di ${maxSizeMB}MB`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      errorKey: 'invalidType',
      maxSizeMB,
      message: 'Solo file PDF sono consentiti.'
    };
  }

  return { valid: true };
}
