import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as requestController from '../controllers/requestController.js';
import { validateCreateRequest, validateRequestId } from '../middleware/validation.js';
import { RequestModel } from '../models/Request.js';

const router = Router();

// Rate limiting (per IP) per prevenire abusi
const createRequestLimiter = rateLimit({ windowMs: 60_000, max: 5 });
const uploadLimiter = rateLimit({ windowMs: 60_000, max: 10 });

// Sanitize payload per richieste pubbliche
function sanitizePublicRequest(req: Request, _res: Response, next: NextFunction) {
  const { client_name, client_email, client_phone, service_type, description, notes, amount } = req.body || {};
  req.body = {
    client_name,
    client_email,
    client_phone,
    service_type,
    description,
    notes,
    amount,
    status: 'nuova',
    priority: 'media'
  };
  next();
}

// Autorizzazione upload pubblico: consenti solo su richieste create pubblicamente
async function ensurePublicRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { requestId } = req.params as { requestId: string };
    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Richiesta non trovata' });
    }
    if (request.created_by) {
      return res.status(403).json({ success: false, error: 'Upload non consentito su questa richiesta' });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Errore verifica richiesta' });
  }
}

// Public: crea richiesta
router.post('/requests', createRequestLimiter, sanitizePublicRequest, validateCreateRequest, requestController.createRequest);

// Public: upload allegato a richiesta esistente
router.post(
  '/requests/:requestId/attachments',
  uploadLimiter,
  validateRequestId,
  ensurePublicRequest,
  upload.single('file'),
  requestController.uploadAttachment
);

export default router;
