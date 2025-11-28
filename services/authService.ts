/**
 * Nuovo Auth Service - Chiama API REST backend invece di Firebase
 */

// Types
export type UserRole = 'admin' | 'operator' | 'consultant' | 'viewer';

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageRequests: boolean;
  canManageClients: boolean;
  canManageDocuments: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canExportData: boolean;
  canDeleteData: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  department?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Configurazione API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper per le chiamate HTTP
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error ${response.status}`
      };
    }

    return result;
  } catch (error: any) {
    console.error('API call error:', error);
    return {
      success: false,
      error: error.message || 'Errore di connessione'
    };
  }
}

// Mappa permessi da array a oggetto
function mapPermissions(permissions: string[]): UserPermissions {
  const permissionSet = new Set(permissions);

  return {
    canViewDashboard: permissionSet.has('viewdashboard'),
    canManageRequests: permissionSet.has('managerequests'),
    canManageClients: permissionSet.has('manageclients'),
    canManageDocuments: permissionSet.has('managedocuments'),
    canViewReports: permissionSet.has('viewreports'),
    canManageUsers: permissionSet.has('manageusers'),
    canManageSettings: permissionSet.has('managesettings'),
    canExportData: permissionSet.has('exportdata'),
    canDeleteData: permissionSet.has('deletedata')
  };
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {
    // Carica dati da localStorage se disponibili
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      this.token = storedToken;
      this.currentUser = JSON.parse(storedUser);
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Login fallito');
    }

    // Salva token e user
    this.token = result.data.token;
    this.currentUser = result.data.user;

    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('auth_user', JSON.stringify(this.currentUser));

    return result.data;
  }

  async logout(): Promise<void> {
    await apiCall('/auth/logout', {
      method: 'POST'
    });

    this.currentUser = null;
    this.token = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'viewer'
  ): Promise<AuthResponse> {
    const result = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name: displayName,
        role
      })
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Registrazione fallita');
    }

    return result.data;
  }

  async resetPassword(email: string): Promise<void> {
    // TODO: Implementare reset password nel backend
    throw new Error('Reset password non ancora implementato');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const result = await apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!result.success) {
      throw new Error(result.error || 'Errore cambio password');
    }
  }

  async getProfile(): Promise<User> {
    const result = await apiCall<User>('/auth/profile');

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore caricamento profilo');
    }

    this.currentUser = result.data;
    localStorage.setItem('auth_user', JSON.stringify(this.currentUser));

    return result.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const result = await apiCall<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Errore aggiornamento profilo');
    }

    this.currentUser = result.data;
    localStorage.setItem('auth_user', JSON.stringify(this.currentUser));

    return result.data;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return this.currentUser.permissions.includes(permission.toLowerCase());
  }

  hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  getUserPermissions(): UserPermissions {
    if (!this.currentUser) {
      return {
        canViewDashboard: false,
        canManageRequests: false,
        canManageClients: false,
        canManageDocuments: false,
        canViewReports: false,
        canManageUsers: false,
        canManageSettings: false,
        canExportData: false,
        canDeleteData: false
      };
    }

    return mapPermissions(this.currentUser.permissions);
  }
}

export const authService = AuthService.getInstance();
