// =====================================================
// TYPES & INTERFACES
// =====================================================

export type UserRole = 'admin' | 'operator' | 'consultant' | 'viewer';
export type ClientStatus = 'nuovo' | 'attivo' | 'inattivo';
export type RequestStatus = 'nuova' | 'in_lavorazione' | 'completata' | 'archiviata' | 'rifiutata';
export type RequestPriority = 'bassa' | 'media' | 'alta' | 'urgente';
export type ServiceType = 'creditizia' | 'assicurativa' | 'immobiliare' | 'lavorativa' | 'legale' | 'medica' | 'fiscale';

// User
export interface User {
  id: string;
  email: string;
  password_hash?: string; // Non inviare mai al frontend
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface UserWithPermissions extends Omit<User, 'password_hash'> {
  permissions: string[];
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: string;
  phone_number?: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  avatar?: string;
  department?: string;
  phone_number?: string;
  is_active?: boolean;
}

// Client
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  fiscal_code?: string;
  address?: string;
  city?: string;
  canton?: string;
  postal_code?: string;
  status: ClientStatus;
  total_requests: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientDTO {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  fiscal_code?: string;
  address?: string;
  city?: string;
  canton?: string;
  postal_code?: string;
  status?: ClientStatus;
}

export interface UpdateClientDTO {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  fiscal_code?: string;
  address?: string;
  city?: string;
  canton?: string;
  postal_code?: string;
  status?: ClientStatus;
}

// Request
export interface Request {
  id: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: ServiceType;
  status: RequestStatus;
  priority: RequestPriority;
  description?: string;
  notes?: string;
  amount?: number;
  assigned_to?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RequestWithDetails extends Request {
  client_first_name?: string;
  client_last_name?: string;
  client_status?: ClientStatus;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by_name?: string;
  attachments_count: number;
  attachments?: Attachment[];
}

export interface CreateRequestDTO {
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: ServiceType;
  status?: RequestStatus;
  priority?: RequestPriority;
  description?: string;
  notes?: string;
  amount?: number;
  assigned_to?: string;
  created_by?: string;
}

export interface UpdateRequestDTO {
  status?: RequestStatus;
  priority?: RequestPriority;
  description?: string;
  notes?: string;
  amount?: number;
  assigned_to?: string;
}

// Attachment
export interface Attachment {
  id: string;
  request_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  document_type?: string;
  uploaded_at: Date;
}

export interface CreateAttachmentDTO {
  request_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  document_type?: string;
}

// Auth
export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserWithPermissions;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Dashboard Stats
export interface DashboardStats {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  requestsByService: Record<ServiceType, number>;
  activeClients: number;
  totalClients: number;
  recentRequestsCount: number;
  conversionRate: number;
}

// Activity Log
export interface ActivityLog {
  id: number;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: Date;
}

export interface CreateActivityLogDTO {
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
}
