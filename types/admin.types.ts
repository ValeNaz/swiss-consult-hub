/**
 * Tipi per il pannello amministrativo
 * Esporta i tipi da dataService per retrocompatibilità
 */

// Re-export tutti i tipi da dataService
export type {
  ServiceType,
  RequestStatus,
  RequestPriority,
  ClientStatus,
  Request,
  Client,
  Attachment,
  DashboardStats
} from '../services/dataService';

// Re-export User types da authService
export type {
  User,
  UserRole,
  UserPermissions
} from '../services/authService';

// Tipo per lo stato dell'utente
export type UserStatus = 'active' | 'inactive' | 'suspended';

// Tipi aggiuntivi per l'admin
export interface AdminStats extends DashboardStats {
  // Eredita tutti i campi da DashboardStats
}

export interface RequestFilters {
  status?: RequestStatus;
  service_type?: ServiceType;
  priority?: RequestPriority;
  assigned_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientFilters {
  status?: ClientStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Import per uso interno
import type { DashboardStats } from '../services/dataService';
import type { RequestStatus, RequestPriority, ServiceType, ClientStatus } from '../services/dataService';
