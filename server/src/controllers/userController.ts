import { Request, Response } from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRole = (role: string): boolean => {
  return ['admin', 'operator', 'consultant', 'viewer'].includes(role);
};

/**
 * @desc    Ottieni tutti gli utenti
 * @route   GET /api/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, is_active, search, page = '1', limit = '50' } = req.query;

    let query = `
      SELECT 
        id, email, name, role, department, phone_number, 
        is_active, created_at, updated_at, last_login,
        (SELECT JSON_ARRAYAGG(permission_name) 
         FROM user_permissions 
         WHERE user_id = users.id) as permissions
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filtri
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    // Paginazione
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [users] = await pool.query(query, params);

    // Parse permissions JSON
    const usersWithPermissions = (users as any[]).map(user => ({
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
      is_active: Boolean(user.is_active)
    }));

    res.json({
      success: true,
      data: usersWithPermissions
    });
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Errore caricamento utenti'
    });
  }
};

/**
 * @desc    Ottieni utente per ID
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT 
        id, email, name, role, department, phone_number, 
        is_active, created_at, updated_at, last_login,
        (SELECT JSON_ARRAYAGG(permission_name) 
         FROM user_permissions 
         WHERE user_id = users.id) as permissions
       FROM users 
       WHERE id = ?`,
      [id]
    );

    if ((users as any[]).length === 0) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
      return;
    }

    const user = (users as any[])[0];
    user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
    user.is_active = Boolean(user.is_active);

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore caricamento utente'
    });
  }
};

/**
 * @desc    Crea nuovo utente
 * @route   POST /api/users
 * @access  Private (Admin)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, department, phone_number, permissions } = req.body;

    // Validazione manuale
    if (!email || !validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Email non valida'
      });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password deve essere di almeno 6 caratteri'
      });
      return;
    }

    if (!name || name.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Nome richiesto'
      });
      return;
    }

    if (!role || !validateRole(role)) {
      res.status(400).json({
        success: false,
        error: 'Ruolo non valido'
      });
      return;
    }

    // Verifica email unica
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existing as any[]).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email già registrata'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserisci utente
    const [result] = await pool.query(
      `INSERT INTO users (email, password, name, role, department, phone_number, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        email,
        hashedPassword,
        name,
        role,
        department || null,
        phone_number || null
      ]
    );

    const userId = (result as any).insertId;

    // Inserisci permessi se forniti
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const permissionValues = permissions.map((perm: string) => [userId, perm]);
      await pool.query(
        'INSERT INTO user_permissions (user_id, permission_name) VALUES ?',
        [permissionValues]
      );
    }

    // Recupera utente creato
    const [newUser] = await pool.query(
      `SELECT 
        id, email, name, role, department, phone_number, 
        is_active, created_at, updated_at,
        (SELECT JSON_ARRAYAGG(permission_name) 
         FROM user_permissions 
         WHERE user_id = users.id) as permissions
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    const user = (newUser as any[])[0];
    user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
    user.is_active = Boolean(user.is_active);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Utente creato con successo'
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore creazione utente'
    });
  }
};

/**
 * @desc    Aggiorna utente
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone_number, is_active, permissions } = req.body;

    // Validazione
    if (email && !validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Email non valida'
      });
      return;
    }

    if (role && !validateRole(role)) {
      res.status(400).json({
        success: false,
        error: 'Ruolo non valido'
      });
      return;
    }

    // Verifica esistenza utente
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if ((existing as any[]).length === 0) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
      return;
    }

    // Verifica email unica se viene modificata
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if ((emailCheck as any[]).length > 0) {
        res.status(400).json({
          success: false,
          error: 'Email già utilizzata'
        });
        return;
      }
    }

    // Prepara update
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (phone_number !== undefined) {
      updates.push('phone_number = ?');
      values.push(phone_number);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    // Esegui update
    if (updates.length > 0) {
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Aggiorna permessi se forniti
    if (permissions !== undefined) {
      await pool.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);
      
      if (Array.isArray(permissions) && permissions.length > 0) {
        const permissionValues = permissions.map((perm: string) => [id, perm]);
        await pool.query(
          'INSERT INTO user_permissions (user_id, permission_name) VALUES ?',
          [permissionValues]
        );
      }
    }

    // Recupera utente aggiornato
    const [updatedUser] = await pool.query(
      `SELECT 
        id, email, name, role, department, phone_number, 
        is_active, created_at, updated_at, last_login,
        (SELECT JSON_ARRAYAGG(permission_name) 
         FROM user_permissions 
         WHERE user_id = users.id) as permissions
       FROM users 
       WHERE id = ?`,
      [id]
    );

    const user = (updatedUser as any[])[0];
    user.permissions = user.permissions ? JSON.parse(user.permissions) : [];
    user.is_active = Boolean(user.is_active);

    res.json({
      success: true,
      data: user,
      message: 'Utente aggiornato con successo'
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento utente'
    });
  }
};

/**
 * @desc    Elimina utente
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user.id;

    // Non permettere self-delete
    if (id === currentUserId) {
      res.status(400).json({
        success: false,
        error: 'Non puoi eliminare il tuo account'
      });
      return;
    }

    // Verifica esistenza
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if ((existing as any[]).length === 0) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
      return;
    }

    // Elimina permessi
    await pool.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);

    // Elimina utente
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Utente eliminato con successo'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore eliminazione utente'
    });
  }
};

/**
 * @desc    Attiva utente
 * @route   POST /api/users/:id/activate
 * @access  Private (Admin)
 */
export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Utente attivato con successo'
    });
  } catch (error: any) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore attivazione utente'
    });
  }
};

/**
 * @desc    Disattiva utente
 * @route   POST /api/users/:id/deactivate
 * @access  Private (Admin)
 */
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user.id;

    // Non permettere self-deactivate
    if (id === currentUserId) {
      res.status(400).json({
        success: false,
        error: 'Non puoi disattivare il tuo account'
      });
      return;
    }

    await pool.query(
      'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Utente disattivato con successo'
    });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      error: 'Errore disattivazione utente'
    });
  }
};

/**
 * @desc    Aggiorna permessi utente
 * @route   PUT /api/users/:id/permissions
 * @access  Private (Admin)
 */
export const updatePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      res.status(400).json({
        success: false,
        error: 'Permessi devono essere un array'
      });
      return;
    }

    // Verifica esistenza utente
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if ((existing as any[]).length === 0) {
      res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
      return;
    }

    // Elimina permessi esistenti
    await pool.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);

    // Inserisci nuovi permessi
    if (permissions.length > 0) {
      const permissionValues = permissions.map(perm => [id, perm]);
      await pool.query(
        'INSERT INTO user_permissions (user_id, permission_name) VALUES ?',
        [permissionValues]
      );
    }

    res.json({
      success: true,
      message: 'Permessi aggiornati con successo'
    });
  } catch (error: any) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento permessi'
    });
  }
};

/**
 * @desc    Aggiorna ruolo utente
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin)
 */
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'operator', 'consultant', 'viewer'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Ruolo non valido'
      });
      return;
    }

    await pool.query(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role, id]
    );

    res.json({
      success: true,
      message: 'Ruolo aggiornato con successo'
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento ruolo'
    });
  }
};

/**
 * @desc    Reset password utente (admin)
 * @route   POST /api/users/:id/reset-password
 * @access  Private (Admin)
 */
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password deve essere di almeno 6 caratteri'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password resettata con successo'
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Errore reset password'
    });
  }
};
