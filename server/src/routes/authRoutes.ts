import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login utente
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Registra nuovo utente (solo admin)
 * @access  Private (Admin)
 */
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  validateRegister,
  authController.register
);

/**
 * @route   GET /api/auth/profile
 * @desc    Ottieni profilo utente corrente
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Aggiorna profilo utente
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambia password
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout utente
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;
