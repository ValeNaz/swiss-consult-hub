/**
 * Nuovo Data Service - Gestisce Requests e Clients tramite API REST
 * Con supporto per aggiornamenti in tempo reale
 */

import { realTimeService } from './realTimeService';

// Types
export type ServiceType = 'creditizia' | 'assicurativa' | 'immobiliare' | 'lavorativa' | 'legale' | 'medica' | 'fiscale';
export type RequestStatus = 'nuova' | 'in_lavorazione' | 'completata' | 'archiviata' | 'rifiutata';
export type RequestPriority = 'bassa' | 'media' | 'alta' | 'urgente';
export type ClientStatus = 'nuovo' | 'attivo' | 'inattivo';

// Interface per RequestWithDetails inclusi attachments
export interface RequestWithDetails extends Request {
  client_first_name?: string;
  client_last_name?: string;
  client_status?: ClientStatus;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by_name?: string;
  attachments_count?: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  request_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  document_type?: string;
  uploaded_at: string;
}

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
  // Dettagli extra dalla view
  client_first_name?: string;
  client_last_name?: string;
  client_status?: ClientStatus;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by_name?: string;
  attachments_count?: number;
  attachments?: Attachment[];
}

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

// Configurazione API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Circuit Breaker per evitare chiamate continue quando il server è offline
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5; // Aumentato da 3 a 5
  private readonly timeout = 10000; // Ridotto da 30 a 10 secondi
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  canAttempt(): boolean {
    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    return true; // HALF_OPEN
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

// Helper per le chiamate HTTP con retry logic e circuit breaker
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; pagination?: any }> {
  // Circuit breaker check
  if (!circuitBreaker.canAttempt()) {
    console.warn('Circuit breaker OPEN - troppe richieste fallite. Attendi 10 secondi prima di riprovare.');
    return {
      success: false,
      error: 'Server temporaneamente non disponibile. Attendi 10 secondi e ricarica la pagina.'
    };
  }

  try {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(10000) // 10 secondi timeout
    });

    const result = await response.json();

    if (!response.ok) {
      circuitBreaker.recordFailure();
      return {
        success: false,
        error: result.error || `HTTP error ${response.status}`
      };
    }

    circuitBreaker.recordSuccess();
    return result;
  } catch (error: any) {
    circuitBreaker.recordFailure();

    // Log solo in sviluppo e solo se non è un errore di connessione ripetuto
    if (import.meta.env.DEV && circuitBreaker.getState() !== 'OPEN') {
      console.error('Errore API:', {
        endpoint,
        error: error.message,
        circuitState: circuitBreaker.getState()
      });
    }

    return {
      success: false,
      error: error.name === 'TimeoutError'
        ? 'Richiesta timeout - server non risponde'
        : 'Server non disponibile'
    };
  }
}

// =====================================================
// REQUESTS SERVICE
// =====================================================

export const requestsService = {
  async create(data: Partial<Request>): Promise<string> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? '/requests' : '/public/requests';
    const result = await apiCall<Request>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore creazione richiesta');
    }

    // Notifica creazione in tempo reale
    realTimeService.notifyRequestCreated(result.data.id, result.data);

    return result.data.id;
  },

  async getAll(filters?: {
    status?: RequestStatus;
    service_type?: ServiceType;
    priority?: RequestPriority;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Request[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.service_type) params.append('service_type', filters.service_type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/requests?${queryString}` : '/requests';

    const result = await apiCall<Request[]>(endpoint);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore caricamento richieste');
    }

    return result.data;
  },

  async getById(id: string): Promise<RequestWithDetails | null> {
    const result = await apiCall<RequestWithDetails>(`/requests/${id}`);

    if (!result.success) {
      return null;
    }

    return result.data || null;
  },

  async update(id: string, data: Partial<Request>): Promise<void> {
    const result = await apiCall(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore aggiornamento richiesta');
    }

    // Notifica aggiornamento in tempo reale
    realTimeService.notifyRequestUpdate(id, data, result.data);
  },

  async delete(id: string): Promise<void> {
    const result = await apiCall(`/requests/${id}`, {
      method: 'DELETE'
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore eliminazione richiesta');
    }

    // Notifica eliminazione in tempo reale
    realTimeService.notifyRequestDeleted(id);
  },

  async getByStatus(status: RequestStatus): Promise<Request[]> {
    return await this.getAll({ status });
  },

  // Azioni bulk con notifiche real-time
  async bulkUpdate(ids: string[], data: Partial<Request>): Promise<void> {
    const promises = ids.map(id => this.update(id, data));
    await Promise.all(promises);
    
    // Notifica azione bulk completata
    realTimeService.notifyBulkActionCompleted('update', ids.length, ids);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const promises = ids.map(id => this.delete(id));
    await Promise.all(promises);
    
    // Notifica azione bulk completata
    realTimeService.notifyBulkActionCompleted('delete', ids.length, ids);
  },

  // Polling intelligente con backoff quando ci sono errori
  subscribe(
    callback: (requests: Request[]) => void,
    filters?: { status?: RequestStatus }
  ): () => void {
    let intervalId: NodeJS.Timeout;
    let consecutiveErrors = 0;
    let currentInterval = 10000; // Inizia con 10 secondi
    const maxInterval = 60000; // Max 60 secondi
    const minInterval = 10000; // Min 10 secondi

    const poll = async () => {
      try {
        // Non fare polling se il circuit breaker è aperto
        if (!circuitBreaker.canAttempt()) {
          consecutiveErrors++;
          currentInterval = Math.min(maxInterval, currentInterval * 1.5);
          scheduleNext();
          return;
        }

        const requests = await this.getAll(filters);
        callback(requests);

        // Reset errori e intervallo su successo
        consecutiveErrors = 0;
        currentInterval = minInterval;
      } catch (error) {
        consecutiveErrors++;

        // Errori silenziosi - nessun log per non disturbare l'utente

        // Aumenta intervallo con backoff esponenziale
        currentInterval = Math.min(maxInterval, currentInterval * 1.5);
      }

      scheduleNext();
    };

    const scheduleNext = () => {
      clearTimeout(intervalId);
      intervalId = setTimeout(poll, currentInterval);
    };

    // Avvia subito il primo poll
    poll();

    // Ritorna funzione per fermare il polling
    return () => clearTimeout(intervalId);
  }
};

// =====================================================
// CLIENTS SERVICE
// =====================================================

export const clientsService = {
  async create(data: Partial<Client>): Promise<string> {
    const result = await apiCall<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore creazione cliente');
    }

    return result.data.id;
  },

  async getAll(filters?: {
    status?: ClientStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Client[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/clients?${queryString}` : '/clients';

    const result = await apiCall<Client[]>(endpoint);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore caricamento clienti');
    }

    return result.data;
  },

  async getById(id: string): Promise<Client | null> {
    const result = await apiCall<Client>(`/clients/${id}`);

    if (!result.success) {
      return null;
    }

    return result.data || null;
  },

  async update(id: string, data: Partial<Client>): Promise<void> {
    const result = await apiCall(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore aggiornamento cliente');
    }
  },

  async delete(id: string): Promise<void> {
    const result = await apiCall(`/clients/${id}`, {
      method: 'DELETE'
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore eliminazione cliente');
    }
  },

  async findByEmail(email: string): Promise<Client | null> {
    const result = await apiCall<Client>(`/clients/search?email=${encodeURIComponent(email)}`);

    if (!result.success) {
      return null;
    }

    return result.data || null;
  },

  subscribe(
    callback: (clients: Client[]) => void,
    filters?: { status?: ClientStatus }
  ): () => void {
    let intervalId: NodeJS.Timeout;
    let consecutiveErrors = 0;
    let currentInterval = 15000; // Inizia con 15 secondi (meno critico dei requests)
    const maxInterval = 60000;
    const minInterval = 15000;

    const poll = async () => {
      try {
        if (!circuitBreaker.canAttempt()) {
          consecutiveErrors++;
          currentInterval = Math.min(maxInterval, currentInterval * 1.5);
          scheduleNext();
          return;
        }

        const clients = await this.getAll(filters);
        callback(clients);

        consecutiveErrors = 0;
        currentInterval = minInterval;
      } catch (error) {
        consecutiveErrors++;

        // Errori silenziosi - nessun log per non disturbare l'utente

        currentInterval = Math.min(maxInterval, currentInterval * 1.5);
      }

      scheduleNext();
    };

    const scheduleNext = () => {
      clearTimeout(intervalId);
      intervalId = setTimeout(poll, currentInterval);
    };

    poll();

    return () => clearTimeout(intervalId);
  }
};

// =====================================================
// DASHBOARD SERVICE
// =====================================================

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const result = await apiCall<DashboardStats>('/requests/stats');

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore caricamento statistiche');
    }

    return result.data;
  }
};

// =====================================================
// USERS SERVICE
// =====================================================

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'consultant' | 'viewer';
  department?: string;
  phone_number?: string;
  is_active: boolean;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'operator' | 'consultant' | 'viewer';
  department?: string;
  phone_number?: string;
  permissions?: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'operator' | 'consultant' | 'viewer';
  department?: string;
  phone_number?: string;
  is_active?: boolean;
  permissions?: string[];
}

export const usersService = {
  async getAll(filters?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserData[]> {
    const params = new URLSearchParams();

    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    const result = await apiCall<UserData[]>(endpoint);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore caricamento utenti');
    }

    return result.data;
  },

  async getById(id: string): Promise<UserData | null> {
    const result = await apiCall<UserData>(`/users/${id}`);

    if (!result.success) {
      return null;
    }

    return result.data || null;
  },

  async create(data: CreateUserData): Promise<UserData> {
    const result = await apiCall<UserData>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore creazione utente');
    }

    return result.data;
  },

  async update(id: string, data: UpdateUserData): Promise<UserData> {
    const result = await apiCall<UserData>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore aggiornamento utente');
    }

    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await apiCall(`/users/${id}`, {
      method: 'DELETE'
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore eliminazione utente');
    }
  },

  async activate(id: string): Promise<void> {
    const result = await apiCall(`/users/${id}/activate`, {
      method: 'POST'
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore attivazione utente');
    }
  },

  async deactivate(id: string): Promise<void> {
    const result = await apiCall(`/users/${id}/deactivate`, {
      method: 'POST'
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore disattivazione utente');
    }
  },

  async updatePermissions(id: string, permissions: string[]): Promise<void> {
    const result = await apiCall(`/users/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore aggiornamento permessi');
    }
  },

  async updateRole(id: string, role: string): Promise<void> {
    const result = await apiCall(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore aggiornamento ruolo');
    }
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const result = await apiCall(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword })
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore reset password');
    }
  }
};

// Esporta stato del circuit breaker per UI
export const getServerStatus = () => ({
  state: circuitBreaker.getState(),
  isAvailable: circuitBreaker.canAttempt()
});

// Resetta il circuit breaker manualmente
export const resetServerConnection = () => {
  circuitBreaker.reset();
  console.log('Circuit breaker resettato - connessione al server ripristinata');
};

export default {
  requests: requestsService,
  clients: clientsService,
  dashboard: dashboardService,
  users: usersService,
  getServerStatus
};
