/**
 * Utility per la gestione centralizzata degli errori
 */

export interface ErrorInfo {
  code: string;
  message: string;
  originalError?: Error;
  timestamp: Date;
}

export class AppError extends Error {
  code: string;
  timestamp: Date;

  constructor(message: string, code: string = 'GENERIC_ERROR') {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = new Date();
  }
}

// Error codes
export const ErrorCodes = {
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
  SAVE_ERROR: 'SAVE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Error messages in Italian
const errorMessages: Record<string, string> = {
  AUTH_FAILED: 'Autenticazione fallita. Verifica le credenziali.',
  AUTH_REQUIRED: 'È necessario effettuare il login.',
  PERMISSION_DENIED: 'Non hai i permessi per eseguire questa azione.',
  NETWORK_ERROR: 'Errore di connessione. Verifica la tua connessione internet.',
  VALIDATION_ERROR: 'I dati inseriti non sono validi.',
  NOT_FOUND: 'Risorsa non trovata.',
  DATA_FETCH_ERROR: 'Errore nel caricamento dei dati.',
  SAVE_ERROR: 'Errore durante il salvataggio.',
  UNKNOWN_ERROR: 'Si è verificato un errore imprevisto.'
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | AppError | string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof AppError && errorMessages[error.code]) {
    return errorMessages[error.code];
  }

  // Handle Firebase errors
  if (error.message.includes('auth/')) {
    const firebaseErrorCode = error.message.match(/auth\/([^)]+)/)?.[1];
    switch (firebaseErrorCode) {
      case 'user-not-found':
        return 'Email non trovata.';
      case 'wrong-password':
        return 'Password errata.';
      case 'email-already-in-use':
        return 'Email già registrata.';
      case 'weak-password':
        return 'La password è troppo debole.';
      case 'invalid-email':
        return 'Email non valida.';
      case 'too-many-requests':
        return 'Troppi tentativi. Riprova più tardi.';
      default:
        return 'Errore di autenticazione.';
    }
  }

  // Handle network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return errorMessages.NETWORK_ERROR;
  }

  return error.message || errorMessages.UNKNOWN_ERROR;
}

/**
 * Log error to console in development - versione ottimizzata
 */
export function logError(error: Error | AppError, context?: string): void {
  if (!import.meta.env.DEV) return;

  // Ignora errori di connessione ripetuti
  const message = error.message || '';
  if (
    message.includes('Failed to fetch') ||
    message.includes('Server non disponibile') ||
    message.includes('ERR_CONNECTION_REFUSED')
  ) {
    // Log solo warning compatto per errori di connessione
    console.warn(`⚠️ ${context || 'API'}: Server non raggiungibile`);
    return;
  }

  // Log completo per altri errori
  console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
  console.error(error);
  if (error instanceof AppError) {
    console.log('Error Code:', error.code);
    console.log('Timestamp:', error.timestamp);
  }
  console.groupEnd();
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(
  error: Error | AppError | unknown,
  context?: string
): string {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logError(errorObj, context);
  return getUserFriendlyMessage(errorObj);
}

/**
 * Suppress non-critical errors from browser extensions
 */
export function suppressExtensionErrors(): void {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Suppress MetaMask/Ethereum wallet errors
    const message = args[0]?.toString() || '';
    if (
      message.includes('ethereum') ||
      message.includes('MetaMask') ||
      message.includes('evmAsk') ||
      message.includes('Cannot redefine property')
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };
}

/**
 * Create error boundary fallback
 */
export function createErrorBoundaryFallback(error: Error, resetError: () => void) {
  return {
    error,
    resetError,
    message: getUserFriendlyMessage(error)
  };
}

/**
 * Async error handler wrapper
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T | null, string | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const message = handleError(error, context);
    return [null, message];
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

export default {
  AppError,
  ErrorCodes,
  getUserFriendlyMessage,
  logError,
  handleError,
  suppressExtensionErrors,
  createErrorBoundaryFallback,
  tryCatch,
  retryWithBackoff
};