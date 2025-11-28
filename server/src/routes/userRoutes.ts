import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Ottieni tutti gli utenti (con filtri opzionali)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Ottieni dettagli utente specifico
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Crea nuovo utente
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Aggiorna utente
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Elimina utente
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

/**
 * @route   POST /api/users/:id/activate
 * @desc    Attiva utente
 * @access  Private (Admin)
 */
router.post('/:id/activate', authenticate, authorize('admin'), userController.activateUser);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Disattiva utente
 * @access  Private (Admin)
 */
router.post('/:id/deactivate', authenticate, authorize('admin'), userController.deactivateUser);

/**
 * @route   PUT /api/users/:id/permissions
 * @desc    Aggiorna permessi utente
 * @access  Private (Admin)
 */
router.put('/:id/permissions', authenticate, authorize('admin'), userController.updatePermissions);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Aggiorna ruolo utente
 * @access  Private (Admin)
 */
router.put('/:id/role', authenticate, authorize('admin'), userController.updateRole);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset password utente (invia email)
 * @access  Private (Admin)
 */
router.post('/:id/reset-password', authenticate, authorize('admin'), userController.resetUserPassword);

export default router;
