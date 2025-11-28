import { query, queryOne, insert, execute } from '../config/database.js';
import { randomUUID } from 'crypto';
import { Client, CreateClientDTO, UpdateClientDTO } from '../types/index.js';

export class ClientModel {
  /**
   * Trova cliente per ID
   */
  static async findById(id: string): Promise<Client | null> {
    const sql = 'SELECT * FROM clients WHERE id = ?';
    return await queryOne<Client>(sql, [id]);
  }

  /**
   * Trova cliente per email
   */
  static async findByEmail(email: string): Promise<Client | null> {
    const sql = 'SELECT * FROM clients WHERE email = ?';
    return await queryOne<Client>(sql, [email]);
  }

  /**
   * Ottieni tutti i clienti
   */
  static async findAll(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Client[]> {
    let sql = 'SELECT * FROM clients WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
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

    return await query<Client>(sql, params);
  }

  /**
   * Conta tutti i clienti
   */
  static async count(filters?: { status?: string; search?: string }): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM clients WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const result = await queryOne<{ count: number }>(sql, params);
    return result?.count || 0;
  }

  /**
   * Crea nuovo cliente
   */
  static async create(data: CreateClientDTO): Promise<string> {
    const id = randomUUID();
    const sql = `
      INSERT INTO clients (
        id, first_name, last_name, email, phone, fiscal_code,
        address, city, canton, postal_code, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await insert(sql, [
      id,
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      data.fiscal_code || null,
      data.address || null,
      data.city || null,
      data.canton || null,
      data.postal_code || null,
      data.status || 'nuovo'
    ]);

    return id;
  }

  /**
   * Aggiorna cliente
   */
  static async update(id: string, data: UpdateClientDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(data.first_name);
    }

    if (data.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(data.last_name);
    }

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }

    if (data.fiscal_code !== undefined) {
      fields.push('fiscal_code = ?');
      values.push(data.fiscal_code);
    }

    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }

    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }

    if (data.canton !== undefined) {
      fields.push('canton = ?');
      values.push(data.canton);
    }

    if (data.postal_code !== undefined) {
      fields.push('postal_code = ?');
      values.push(data.postal_code);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`;
    const affectedRows = await execute(sql, values);

    return affectedRows > 0;
  }

  /**
   * Elimina cliente
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM clients WHERE id = ?';
    const affectedRows = await execute(sql, [id]);
    return affectedRows > 0;
  }

  /**
   * Conta clienti per status
   */
  static async countByStatus(status: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM clients WHERE status = ?';
    const result = await queryOne<{ count: number }>(sql, [status]);
    return result?.count || 0;
  }

  /**
   * Incrementa contatore richieste
   */
  static async incrementRequestCount(id: string): Promise<void> {
    const sql = 'UPDATE clients SET total_requests = total_requests + 1 WHERE id = ?';
    await execute(sql, [id]);
  }

  /**
   * Decrementa contatore richieste
   */
  static async decrementRequestCount(id: string): Promise<void> {
    const sql = 'UPDATE clients SET total_requests = GREATEST(total_requests - 1, 0) WHERE id = ?';
    await execute(sql, [id]);
  }
}
