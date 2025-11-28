import { Request, Response, NextFunction } from 'express';
import { ClientModel } from '../models/Client.js';
import { CreateClientDTO, UpdateClientDTO } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Ottieni tutti i clienti
 */
export async function getAllClients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      status: status as string,
      search: search as string,
      limit: limitNum,
      offset
    };

    const [clients, total] = await Promise.all([
      ClientModel.findAll(filters),
      ClientModel.count({ status: status as string, search: search as string })
    ]);

    res.json({
      success: true,
      data: clients,
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
 * Ottieni cliente per ID
 */
export async function getClientById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const client = await ClientModel.findById(id);

    if (!client) {
      throw createError('Cliente non trovato', 404);
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea nuovo cliente
 */
export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: CreateClientDTO = req.body;

    // Verifica se email già esiste
    const existingClient = await ClientModel.findByEmail(data.email);

    if (existingClient) {
      throw createError('Cliente con questa email già esistente', 400);
    }

    const clientId = await ClientModel.create(data);
    const client = await ClientModel.findById(clientId);

    res.status(201).json({
      success: true,
      data: client,
      message: 'Cliente creato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aggiorna cliente
 */
export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data: UpdateClientDTO = req.body;

    // Verifica se cliente esiste
    const existingClient = await ClientModel.findById(id);

    if (!existingClient) {
      throw createError('Cliente non trovato', 404);
    }

    // Se si sta aggiornando l'email, verifica che non sia già in uso
    if (data.email && data.email !== existingClient.email) {
      const emailExists = await ClientModel.findByEmail(data.email);
      if (emailExists) {
        throw createError('Email già in uso da un altro cliente', 400);
      }
    }

    const updated = await ClientModel.update(id, data);

    if (!updated) {
      throw createError('Nessuna modifica effettuata', 400);
    }

    const client = await ClientModel.findById(id);

    res.json({
      success: true,
      data: client,
      message: 'Cliente aggiornato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina cliente
 */
export async function deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const client = await ClientModel.findById(id);

    if (!client) {
      throw createError('Cliente non trovato', 404);
    }

    const deleted = await ClientModel.delete(id);

    if (!deleted) {
      throw createError('Errore durante eliminazione cliente', 500);
    }

    res.json({
      success: true,
      message: 'Cliente eliminato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cerca cliente per email
 */
export async function findByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.query;

    if (!email) {
      throw createError('Email richiesta', 400);
    }

    const client = await ClientModel.findByEmail(email as string);

    if (!client) {
      res.json({
        success: true,
        data: null
      });
      return;
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Statistiche clienti
 */
export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [total, nuovi, attivi, inattivi] = await Promise.all([
      ClientModel.count(),
      ClientModel.countByStatus('nuovo'),
      ClientModel.countByStatus('attivo'),
      ClientModel.countByStatus('inattivo')
    ]);

    res.json({
      success: true,
      data: {
        total,
        nuovi,
        attivi,
        inattivi
      }
    });
  } catch (error) {
    next(error);
  }
}
