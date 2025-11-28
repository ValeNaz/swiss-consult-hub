import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { LoginDTO, CreateUserDTO, AuthResponse, JWTPayload } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Login utente
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password }: LoginDTO = req.body;

    // Trova utente
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw createError('Email o password errati', 401);
    }

    // Verifica se l'utente è attivo
    if (!user.is_active) {
      throw createError('Account disattivato', 403);
    }

    // Verifica password
    const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash!);

    if (!isPasswordValid) {
      throw createError('Email o password errati', 401);
    }

    // Aggiorna last_login
    await UserModel.updateLastLogin(user.id);

    // Carica permessi
    const userWithPermissions = await UserModel.findByIdWithPermissions(user.id);

    if (!userWithPermissions) {
      throw createError('Errore caricamento profilo utente', 500);
    }

    // Genera token JWT
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    const response: AuthResponse = {
      user: userWithPermissions,
      token
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registrazione nuovo utente (solo admin)
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: CreateUserDTO = req.body;

    // Verifica se email già esiste
    const existingUser = await UserModel.findByEmail(data.email);

    if (existingUser) {
      throw createError('Email già registrata', 400);
    }

    // Crea utente
    const userId = await UserModel.create(data);

    // Carica utente con permessi
    const user = await UserModel.findByIdWithPermissions(userId);

    if (!user) {
      throw createError('Errore creazione utente', 500);
    }

    // Genera token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    const response: AuthResponse = {
      user,
      token
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'Utente registrato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Ottieni profilo utente corrente
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Utente non autenticato', 401);
    }

    const user = await UserModel.findByIdWithPermissions(req.user.userId);

    if (!user) {
      throw createError('Utente non trovato', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aggiorna profilo utente
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Utente non autenticato', 401);
    }

    const updated = await UserModel.update(req.user.userId, req.body);

    if (!updated) {
      throw createError('Nessuna modifica effettuata', 400);
    }

    const user = await UserModel.findByIdWithPermissions(req.user.userId);

    res.json({
      success: true,
      data: user,
      message: 'Profilo aggiornato con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cambia password
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Utente non autenticato', 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Verifica password attuale
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw createError('Utente non trovato', 404);
    }

    const isPasswordValid = await UserModel.verifyPassword(currentPassword, user.password_hash!);

    if (!isPasswordValid) {
      throw createError('Password attuale errata', 401);
    }

    // Aggiorna password
    await UserModel.updatePassword(req.user.userId, newPassword);

    res.json({
      success: true,
      message: 'Password modificata con successo'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout (lato client - qui solo per completezza)
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    message: 'Logout effettuato'
  });
}
