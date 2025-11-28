import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCreateClient,
  validateUpdateClient,
  validateUUID,
  validatePagination
} from '../middleware/validation.js';

const router = Router();

// Tutte le routes richiedono autenticazione
router.use(authenticate);

/**
 * @route   GET /api/clients
 * @desc    Ottieni tutti i clienti (con filtri e paginazione)
 * @access  Private
 */
router.get('/', validatePagination, clientController.getAllClients);

/**
 * @route   GET /api/clients/stats
 * @desc    Ottieni statistiche clienti
 * @access  Private
 */
router.get('/stats', clientController.getStats);

/**
 * @route   GET /api/clients/search
 * @desc    Cerca cliente per email
 * @access  Private
 */
router.get('/search', clientController.findByEmail);

/**
 * @route   GET /api/clients/:id
 * @desc    Ottieni cliente per ID
 * @access  Private
 */
router.get('/:id', validateUUID, clientController.getClientById);

/**
 * @route   POST /api/clients
 * @desc    Crea nuovo cliente
 * @access  Private (Admin, Operator)
 */
router.post(
  '/',
  authorize('admin', 'operator'),
  validateCreateClient,
  clientController.createClient
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Aggiorna cliente
 * @access  Private (Admin, Operator)
 */
router.put(
  '/:id',
  authorize('admin', 'operator'),
  validateUUID,
  validateUpdateClient,
  clientController.updateClient
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Elimina cliente
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), validateUUID, clientController.deleteClient);

export default router;
