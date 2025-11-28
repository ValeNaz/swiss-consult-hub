import { query, queryOne, insert, execute } from '../config/database.js';
import { User, UserWithPermissions, CreateUserDTO, UpdateUserDTO, UserRole } from '../types/index.js';
import bcrypt from 'bcryptjs';

// Permessi per ruolo
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'viewdashboard',
    'managerequests',
    'manageclients',
    'managedocuments',
    'viewreports',
    'manageusers',
    'managesettings',
    'exportdata',
    'deletedata'
  ],
  operator: [
    'viewdashboard',
    'managerequests',
    'manageclients',
    'managedocuments',
    'viewreports',
    'exportdata'
  ],
  consultant: [
    'viewdashboard',
    'managerequests',
    'manageclients',
    'viewreports',
    'exportdata'
  ],
  viewer: [
    'viewdashboard',
    'viewreports'
  ]
};

export class UserModel {
  /**
   * Trova utente per email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await queryOne<User>(sql, [email]);
  }

  /**
   * Trova utente per ID
   */
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await queryOne<User>(sql, [id]);
  }

  /**
   * Trova utente con permessi
   */
  static async findByIdWithPermissions(id: string): Promise<UserWithPermissions | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const permissions = await this.getUserPermissions(id);

    // Rimuovi password_hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      permissions
    } as UserWithPermissions;
  }

  /**
   * Ottieni permessi utente
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    const sql = 'SELECT permission FROM user_permissions WHERE user_id = ?';
    const rows = await query<{ permission: string }>(sql, [userId]);
    return rows.map(row => row.permission);
  }

  /**
   * Crea nuovo utente
   */
  static async create(data: CreateUserDTO): Promise<string> {
    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    const sql = `
      INSERT INTO users (email, password_hash, name, role, department, phone_number, is_active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `;

    await insert(sql, [
      data.email,
      password_hash,
      data.name,
      data.role || 'viewer',
      data.department || null,
      data.phone_number || null
    ]);

    // Recupera l'UUID generato dal database
    const user = await this.findByEmail(data.email);
    if (!user) {
      throw new Error('Errore creazione utente');
    }

    // Aggiungi permessi basati sul ruolo
    await this.setUserPermissions(user.id, data.role || 'viewer');

    return user.id;
  }

  /**
   * Imposta permessi utente basati sul ruolo
   */
  static async setUserPermissions(userId: string, role: UserRole): Promise<void> {
    // Rimuovi vecchi permessi
    await execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

    // Aggiungi nuovi permessi
    const permissions = ROLE_PERMISSIONS[role];
    const sql = 'INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)';

    for (const permission of permissions) {
      await execute(sql, [userId, permission]);
    }
  }

  /**
   * Aggiorna utente
   */
  static async update(id: string, data: UpdateUserDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (data.role !== undefined) {
      fields.push('role = ?');
      values.push(data.role);
      // Aggiorna anche i permessi
      await this.setUserPermissions(id, data.role);
    }

    if (data.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }

    if (data.department !== undefined) {
      fields.push('department = ?');
      values.push(data.department);
    }

    if (data.phone_number !== undefined) {
      fields.push('phone_number = ?');
      values.push(data.phone_number);
    }

    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const affectedRows = await execute(sql, values);

    return affectedRows > 0;
  }

  /**
   * Aggiorna password
   */
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const affectedRows = await execute(sql, [password_hash, id]);
    return affectedRows > 0;
  }

  /**
   * Verifica password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Aggiorna last_login
   */
  static async updateLastLogin(id: string): Promise<void> {
    const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await execute(sql, [id]);
  }

  /**
   * Ottieni tutti gli utenti
   */
  static async findAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    return await query<User>(sql);
  }

  /**
   * Elimina utente
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const affectedRows = await execute(sql, [id]);
    return affectedRows > 0;
  }

  /**
   * Conta utenti per ruolo
   */
  static async countByRole(role: UserRole): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE role = ?';
    const result = await queryOne<{ count: number }>(sql, [role]);
    return result?.count || 0;
  }
}
