import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

/**
 * Middleware per gestire gli errori di validazione
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Errori di validazione',
      details: errors.array()
    });
    return;
  }

  next();
}

/**
 * Validazioni per Auth
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email non valida')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La password deve contenere almeno 6 caratteri'),
  handleValidationErrors
];

export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email non valida')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La password deve contenere almeno 6 caratteri'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il nome deve contenere almeno 2 caratteri'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'consultant', 'viewer'])
    .withMessage('Ruolo non valido'),
  handleValidationErrors
];

/**
 * Validazioni per Clients
 */
export const validateCreateClient = [
  body('first_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il nome deve contenere almeno 2 caratteri'),
  body('last_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il cognome deve contenere almeno 2 caratteri'),
  body('email')
    .isEmail()
    .withMessage('Email non valida')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['nuovo', 'attivo', 'inattivo'])
    .withMessage('Status non valido'),
  handleValidationErrors
];

export const validateUpdateClient = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il nome deve contenere almeno 2 caratteri'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il cognome deve contenere almeno 2 caratteri'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email non valida')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['nuovo', 'attivo', 'inattivo'])
    .withMessage('Status non valido'),
  handleValidationErrors
];

/**
 * Validazioni per Requests
 */
export const validateCreateRequest = [
  body('client_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Il nome del cliente deve contenere almeno 2 caratteri'),
  body('client_email')
    .isEmail()
    .withMessage('Email non valida')
    .normalizeEmail(),
  body('service_type')
    .isIn(['creditizia', 'assicurativa', 'immobiliare', 'lavorativa', 'legale', 'medica', 'fiscale'])
    .withMessage('Tipo di servizio non valido'),
  body('status')
    .optional()
    .isIn(['nuova', 'in_lavorazione', 'completata', 'archiviata', 'rifiutata'])
    .withMessage('Status non valido'),
  body('priority')
    .optional()
    .isIn(['bassa', 'media', 'alta', 'urgente'])
    .withMessage('Priorità non valida'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Importo deve essere numerico'),
  handleValidationErrors
];

export const validateUpdateRequest = [
  body('status')
    .optional()
    .isIn(['nuova', 'in_lavorazione', 'completata', 'archiviata', 'rifiutata'])
    .withMessage('Status non valido'),
  body('priority')
    .optional()
    .isIn(['bassa', 'media', 'alta', 'urgente'])
    .withMessage('Priorità non valida'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Importo deve essere numerico'),
  handleValidationErrors
];

/**
 * Validazione UUID
 */
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID non valido'),
  handleValidationErrors
];

/**
 * Validazione requestId (UUID)
 */
export const validateRequestId = [
  param('requestId')
    .isUUID()
    .withMessage('Request ID non valido'),
  handleValidationErrors
];

/**
 * Validazione paginazione
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page deve essere un numero >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve essere un numero tra 1 e 100'),
  handleValidationErrors
];
