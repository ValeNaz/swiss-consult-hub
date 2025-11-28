import { query, queryOne, insert, execute } from '../config/database.js';
import { randomUUID } from 'crypto';
import {
  Request,
  RequestWithDetails,
  CreateRequestDTO,
  UpdateRequestDTO,
  Attachment,
  CreateAttachmentDTO
} from '../types/index.js';

export class RequestModel {
  /**
   * Trova richiesta per ID
   */
  static async findById(id: string): Promise<Request | null> {
    const sql = 'SELECT * FROM requests WHERE id = ?';
    return await queryOne<Request>(sql, [id]);
  }

  /**
   * Trova richiesta per ID con dettagli
   */
  static async findByIdWithDetails(id: string): Promise<RequestWithDetails | null> {
    const sql = 'SELECT * FROM vw_requests_detail WHERE id = ?';
    const request = await queryOne<RequestWithDetails>(sql, [id]);

    if (!request) return null;

    // Carica allegati
    request.attachments = await this.getAttachments(id);

    return request;
  }

  /**
   * Ottieni tutte le richieste
   */
  static async findAll(filters?: {
    status?: string;
    service_type?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<RequestWithDetails[]> {
    let sql = 'SELECT * FROM vw_requests_detail WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.service_type) {
      sql += ' AND service_type = ?';
      params.push(filters.service_type);
    }

    if (filters?.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters?.assigned_to) {
      sql += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }

    if (filters?.search) {
      sql += ' AND (client_name LIKE ? OR client_email LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC';

    // Aggiungi LIMIT e OFFSET direttamente nella query (non come parametri preparati)
    // MySQL ha problemi con LIMIT ? in alcune versioni/configurazioni
    if (filters?.limit) {
      const limitValue = parseInt(String(filters.limit), 10);
      sql += ` LIMIT ${limitValue}`;

      if (filters?.offset) {
        const offsetValue = parseInt(String(filters.offset), 10);
        sql += ` OFFSET ${offsetValue}`;
      }
    }

    return await query<RequestWithDetails>(sql, params);
  }

  /**
   * Conta tutte le richieste
   */
  static async count(filters?: {
    status?: string;
    service_type?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
  }): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM requests WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.service_type) {
      sql += ' AND service_type = ?';
      params.push(filters.service_type);
    }

    if (filters?.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters?.assigned_to) {
      sql += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }

    if (filters?.search) {
      sql += ' AND (client_name LIKE ? OR client_email LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const result = await queryOne<{ count: number }>(sql, params);
    return result?.count || 0;
  }

  /**
   * Crea nuova richiesta
   */
  static async create(data: CreateRequestDTO): Promise<string> {
    const id = randomUUID();
    const sql = `
      INSERT INTO requests (
        id, client_id, client_name, client_email, client_phone,
        service_type, status, priority, description, notes,
        amount, assigned_to, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const clientSql = 'SELECT id FROM clients WHERE email = ?';
    const client = await queryOne<{ id: string }>(clientSql, [data.client_email]);

    await insert(sql, [
      id,
      client?.id || null,
      data.client_name,
      data.client_email,
      data.client_phone || null,
      data.service_type,
      data.status || 'nuova',
      data.priority || 'media',
      data.description || null,
      data.notes || null,
      data.amount || null,
      data.assigned_to || null,
      data.created_by || null
    ]);

    return id;
  }

  /**
   * Aggiorna richiesta
   */
  static async update(id: string, data: UpdateRequestDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Consenti aggiornamento client_id quando necessario
    if ((data as any).client_id !== undefined) {
      fields.push('client_id = ?');
      values.push((data as any).client_id);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (data.priority !== undefined) {
      fields.push('priority = ?');
      values.push(data.priority);
    }

    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }

    if (data.assigned_to !== undefined) {
      fields.push('assigned_to = ?');
      values.push(data.assigned_to);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE requests SET ${fields.join(', ')} WHERE id = ?`;
    const affectedRows = await execute(sql, values);

    return affectedRows > 0;
  }

  /**
   * Elimina richiesta
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM requests WHERE id = ?';
    const affectedRows = await execute(sql, [id]);
    return affectedRows > 0;
  }

  /**
   * Conta richieste per status
   */
  static async countByStatus(status: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM requests WHERE status = ?';
    const result = await queryOne<{ count: number }>(sql, [status]);
    return result?.count || 0;
  }

  /**
   * Conta richieste per service_type
   */
  static async countByServiceType(serviceType: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM requests WHERE service_type = ?';
    const result = await queryOne<{ count: number }>(sql, [serviceType]);
    return result?.count || 0;
  }

  /**
   * Ottieni richieste recenti (ultimi 30 giorni)
   */
  static async getRecent(days: number = 30): Promise<Request[]> {
    const sql = `
      SELECT * FROM requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY created_at DESC
    `;
    return await query<Request>(sql, [days]);
  }

  // =====================================================
  // ATTACHMENTS
  // =====================================================

  /**
   * Ottieni allegati di una richiesta
   */
  static async getAttachments(requestId: string): Promise<Attachment[]> {
    const sql = 'SELECT * FROM attachments WHERE request_id = ? ORDER BY uploaded_at DESC';
    const results = await query<Attachment>(sql, [requestId]);
    return results;
  }

  /**
   * Ottieni un allegato per ID
   */
  static async getAttachmentById(id: string): Promise<Attachment | null> {
    const sql = 'SELECT * FROM attachments WHERE id = ?';
    return await queryOne<Attachment>(sql, [id]);
  }

  /**
   * Aggiungi allegato
   */
  static async addAttachment(data: CreateAttachmentDTO): Promise<string> {
    const id = randomUUID();
    const sql = `
      INSERT INTO attachments (
        id, request_id, name, type, size, url, path, document_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await insert(sql, [
      id,
      data.request_id,
      data.name,
      data.type,
      data.size,
      data.url,
      data.path,
      data.document_type || null
    ]);

    return id;
  }

  /**
   * Elimina allegato
   */
  static async deleteAttachment(id: string): Promise<Attachment | null> {
    // Prima recupera l'allegato per avere le info del file
    const attachment = await queryOne<Attachment>(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );

    if (!attachment) return null;

    // Poi elimina dal database
    await execute('DELETE FROM attachments WHERE id = ?', [id]);

    return attachment;
  }

  /**
   * Elimina tutti gli allegati di una richiesta
   */
  static async deleteAllAttachments(requestId: string): Promise<Attachment[]> {
    // Prima recupera tutti gli allegati
    const attachments = await this.getAttachments(requestId);

    // Poi elimina tutti
    await execute('DELETE FROM attachments WHERE request_id = ?', [requestId]);

    return attachments;
  }
}
