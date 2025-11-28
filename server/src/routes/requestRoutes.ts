import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import * as requestController from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCreateRequest,
  validateUpdateRequest,
  validateUUID,
  validateRequestId,
  validatePagination
} from '../middleware/validation.js';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticate);

/**
 * @route   GET /api/requests
 * @desc    Ottieni tutte le richieste (con filtri e paginazione)
 * @access  Private
 */
router.get('/', validatePagination, requestController.getAllRequests);

/**
 * @route   GET /api/requests/stats
 * @desc    Ottieni statistiche richieste (Dashboard)
 * @access  Private
 */
router.get('/stats', requestController.getStats);

/**
 * @route   GET /api/requests/:id
 * @desc    Ottieni richiesta per ID con dettagli
 * @access  Private
 */
router.get('/:id', validateUUID, requestController.getRequestById);

/**
 * @route   POST /api/requests
 * @desc    Crea nuova richiesta
 * @access  Private (Admin, Operator, Consultant)
 */
router.post(
  '/',
  authorize('admin', 'operator', 'consultant'),
  validateCreateRequest,
  requestController.createRequest
);

/**
 * @route   PUT /api/requests/:id
 * @desc    Aggiorna richiesta
 * @access  Private (Admin, Operator, Consultant)
 */
router.put(
  '/:id',
  authorize('admin', 'operator', 'consultant'),
  validateUUID,
  validateUpdateRequest,
  requestController.updateRequest
);

/**
 * @route   DELETE /api/requests/:id
 * @desc    Elimina richiesta
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), validateUUID, requestController.deleteRequest);

// =====================================================
// ATTACHMENTS ROUTES
// =====================================================

/**
 * @route   GET /api/requests/:requestId/attachments
 * @desc    Ottieni tutti gli allegati di una richiesta
 * @access  Private
 */
router.get('/:requestId/attachments', validateRequestId, requestController.getAttachments);

/**
 * @route   POST /api/requests/:requestId/attachments
 * @desc    Upload file allegato
 * @access  Private (Admin, Operator, Consultant)
 */
router.post(
  '/:requestId/attachments',
  authorize('admin', 'operator', 'consultant'),
  validateRequestId,
  upload.single('file'),
  requestController.uploadAttachment
);

/**
 * @route   DELETE /api/requests/:requestId/attachments/:attachmentId
 * @desc    Elimina allegato
 * @access  Private (Admin, Operator)
 */
router.delete(
  '/:requestId/attachments/:attachmentId',
  authorize('admin', 'operator'),
  requestController.deleteAttachment
);

export default router;
