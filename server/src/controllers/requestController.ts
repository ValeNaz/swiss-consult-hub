import { Request, Response, NextFunction } from 'express';
import { RequestModel } from '../models/Request.js';
import { ClientModel } from '../models/Client.js';
import { CreateRequestDTO, UpdateRequestDTO, ServiceType, Attachment } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import emailService from '../services/emailService.js';

/**
 * Restituisce la base URL pubblica da usare per gli allegati.
 * Usa BACKEND_URL se disponibile, altrimenti ricava host/protocollo dalla request (anche dietro proxy).
 */
function getBaseUrl(req: Request): string {
  const envUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
  if (envUrl) {
    return envUrl;
  }

  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost || req.get('host') || `localhost:${process.env.PORT || 3001}`;
  const protocol = forwardedProto || req.protocol || 'http';

  return `${protocol}://${host}`.replace(/\/$/, '');
}

/**
 * Aggiunge l'URL pubblico calcolato dinamicamente a ogni allegato
 * per evitare URL "localhost" salvati nel database.
 */
function withPublicAttachmentUrls(attachments: Attachment[] = [], req: Request): Attachment[] {
  const baseUrl = getBaseUrl(req);

  return attachments.map((attachment) => ({
    ...attachment,
    url: attachment.path ? `${baseUrl}/uploads/${attachment.path}` : attachment.url
  }));
}

/**
 * Ottieni tutte le richieste
 */
export async function getAllRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, service_type, priority, assigned_to, search, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      status: status as string,
      service_type: service_type as string,
      priority: priority as string,
      assigned_to: assigned_to as string,
      search: search as string,
      limit: limitNum,
      offset
    };

    const [requests, total] = await Promise.all([
      RequestModel.findAll(filters),
      RequestModel.count({
        status: status as string,
        service_type: service_type as string,
        priority: priority as string,
        assigned_to: assigned_to as string,
        search: search as string
      })
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Ottieni richiesta per ID con dettagli completi
 */
export async function getRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const request = await RequestModel.findByIdWithDetails(id);

    if (!request) {
      throw createError('Richiesta non trovata', 404);
    }
    
    // Carica allegati direttamente e assicurati che siano presenti nella risposta
    const attachments = withPublicAttachmentUrls(
      await RequestModel.getAttachments(id),
      req
    );
    
    // Crea una risposta che include esplicitamente gli allegati
    const responseData = {
      ...request,
      attachments: attachments
    };
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea nuova richiesta
 */
export async function createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: CreateRequestDTO = req.body;

    // Se viene passato created_by, usa quello; altrimenti usa l'utente loggato
    if (!data.created_by && req.user) {
      data.created_by = req.user.userId;
    }

    // Crea la richiesta
    const requestId = await RequestModel.create(data);

    // Verifica se esiste già un cliente con questa email
    let client = await ClientModel.findByEmail(data.client_email);

    if (client) {
      // Cliente esistente: aggiorna status a 'attivo' se necessario
      if (client.status !== 'attivo') {
        await ClientModel.update(client.id, { status: 'attivo' });
      }
    } else {
      // Crea nuovo cliente
      const [firstName, ...lastNameParts] = data.client_name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const newClientId = await ClientModel.create({
        first_name: firstName,
        last_name: lastName,
        email: data.client_email,
        phone: data.client_phone,
        status: 'nuovo'
      });

      // Collega la richiesta al nuovo cliente
      await RequestModel.update(requestId, { client_id: newClientId } as any);
    }

    const request = await RequestModel.findByIdWithDetails(requestId);
    const mappedRequest = request
      ? {
          ...request,
          attachments: withPublicAttachmentUrls(request.attachments || [], req)
        }
      : null;

    // Invia email di notifica in background (non blocca la risposta)
    if (mappedRequest) {
      emailService.sendNewRequestNotification({
        request: mappedRequest,
        attachments: mappedRequest.attachments || []
      }).catch(err => {
        console.error('❌ Errore invio email notifica:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      data: mappedRequest,
      message: 'Richiesta creata con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aggiorna richiesta
 */
export async function updateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data: UpdateRequestDTO = req.body;

    const existingRequest = await RequestModel.findById(id);

    if (!existingRequest) {
      throw createError('Richiesta non trovata', 404);
    }

    const updated = await RequestModel.update(id, data);

    if (!updated) {
      throw createError('Nessuna modifica effettuata', 400);
    }

    const request = await RequestModel.findByIdWithDetails(id);
    const mappedRequest = request
      ? {
          ...request,
          attachments: withPublicAttachmentUrls(request.attachments || [], req)
        }
      : null;

    res.json({
      success: true,
      data: mappedRequest,
      message: 'Richiesta aggiornata con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina richiesta
 */
export async function deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const request = await RequestModel.findById(id);

    if (!request) {
      throw createError('Richiesta non trovata', 404);
    }

    // Elimina la richiesta (gli allegati vengono eliminati in cascata dal DB e i file dal filesystem tramite trigger/cleanup)
    const deleted = await RequestModel.delete(id);

    if (!deleted) {
      throw createError('Errore durante eliminazione richiesta', 500);
    }

    res.json({
      success: true,
      message: 'Richiesta eliminata con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Statistiche richieste (Dashboard)
 */
export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalRequests,
      newRequests,
      inProgressRequests,
      completedRequests,
      recentRequests
    ] = await Promise.all([
      RequestModel.count(),
      RequestModel.countByStatus('nuova'),
      RequestModel.countByStatus('in_lavorazione'),
      RequestModel.countByStatus('completata'),
      RequestModel.getRecent(30)
    ]);

    // Conta per tipo di servizio
    const serviceTypes: ServiceType[] = [
      'creditizia',
      'assicurativa',
      'immobiliare',
      'lavorativa',
      'legale',
      'medica',
      'fiscale'
    ];

    const requestsByService: Record<string, number> = {};

    for (const type of serviceTypes) {
      requestsByService[type] = await RequestModel.countByServiceType(type);
    }

    // Conta clienti attivi
    const activeClients = await ClientModel.countByStatus('attivo');
    const totalClients = await ClientModel.count();

    // Calcola conversion rate
    const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalRequests,
        newRequests,
        inProgressRequests,
        completedRequests,
        requestsByService,
        activeClients,
        totalClients,
        recentRequestsCount: recentRequests.length,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// ATTACHMENTS
// =====================================================

/**
 * Upload file allegato (storage locale)
 */
export async function uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { requestId } = req.params;
    const { documentType } = req.body as { documentType?: string };
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      throw createError('Nessun file fornito', 400);
    }

    // Verifica che la richiesta esista
    const request = await RequestModel.findById(requestId);
    if (!request) {
      throw createError('Richiesta non trovata', 404);
    }

    // Costruisci path locale e URL pubblico calcolato dalla request
    const relativePath = `requests/${requestId}/${file.filename}`;
    const url = `${getBaseUrl(req)}/uploads/${relativePath}`;

    // Salva attachment nel database
    const attachmentId = await RequestModel.addAttachment({
      request_id: requestId,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url,
      path: relativePath,
      document_type: documentType || 'document'
    });

    // Recupera e ritorna l'attachment creato
    const attachmentRecord = await RequestModel.getAttachmentById(attachmentId);
    const attachment = attachmentRecord
      ? withPublicAttachmentUrls([attachmentRecord], req)[0]
      : null;

    res.status(201).json({
      success: true,
      data: attachment,
      message: 'File caricato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina allegato
 */
export async function deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { requestId, attachmentId } = req.params;

    const attachment = await RequestModel.deleteAttachment(attachmentId);

    if (!attachment) {
      throw createError('Allegato non trovato', 404);
    }

    // Elimina file dal filesystem locale
    // Nota: il file verrà eliminato dal cleanup automatico o manualmente se necessario

    res.json({
      success: true,
      message: 'Allegato eliminato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Ottieni tutti gli allegati di una richiesta
 */
export async function getAttachments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { requestId } = req.params;

    const attachments = withPublicAttachmentUrls(
      await RequestModel.getAttachments(requestId),
      req
    );

    res.json({
      success: true,
      data: attachments
    });
  } catch (error) {
    next(error);
  }
}
