/**
 * ============================================
 * ADMIN USERS MANAGEMENT - Gestione Completa Utenti
 * ============================================
 * Pannello completo per CRUD utenti con permessi granulari
 */

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  X,
  Save,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Check,
  AlertCircle,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { usersService, type UserData, type CreateUserData, type UpdateUserData } from '../services/dataService';
import { authService } from '../services/authService';
import '../styles/AdminUsersManagement.css';

// Permission options
const AVAILABLE_PERMISSIONS = [
  { value: 'viewdashboard', label: 'Visualizza Dashboard' },
  { value: 'managerequests', label: 'Gestisci Richieste' },
  { value: 'manageclients', label: 'Gestisci Clienti' },
  { value: 'managedocuments', label: 'Gestisci Documenti' },
  { value: 'viewreports', label: 'Visualizza Report' },
  { value: 'manageusers', label: 'Gestisci Utenti' },
  { value: 'managesettings', label: 'Gestisci Impostazioni' },
  { value: 'exportdata', label: 'Esporta Dati' },
  { value: 'deletedata', label: 'Elimina Dati' }
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Amministratore', color: '#dc143c' },
  { value: 'operator', label: 'Operatore', color: '#4f46e5' },
  { value: 'consultant', label: 'Consulente', color: '#059669' },
  { value: 'viewer', label: 'Visualizzatore', color: '#7c8799' }
];

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'operator' | 'consultant' | 'viewer';
  department: string;
  phone_number: string;
  permissions: string[];
}

const AdminUsersManagement: React.FC = () => {
  const { t } = useTranslation('admin');  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Current user being edited/deleted
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeleteingUser] = useState<UserData | null>(null);

  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    department: '',
    phone_number: '',
    permissions: []
  });

  // Password management
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUserId = authService.getCurrentUser()?.id;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error: any) {
      showMessage('error', error.message || 'Errore caricamento utenti');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.is_active === (statusFilter === 'active'));
    }

    setFilteredUsers(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'viewer',
      department: '',
      phone_number: '',
      permissions: []
    });
    setShowUserModal(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      phone_number: user.phone_number || '',
      permissions: user.permissions || []
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      showMessage('error', 'Nome ed email sono obbligatori');
      return;
    }

    if (!editingUser && !formData.password) {
      showMessage('error', 'Password è obbligatoria per nuovi utenti');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showMessage('error', 'Password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department || undefined,
          phone_number: formData.phone_number || undefined,
          permissions: formData.permissions
        };

        await usersService.update(editingUser.id, updateData);
        showMessage('success', 'Utente aggiornato con successo');
      } else {
        // Create new user
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password!,
          role: formData.role,
          department: formData.department || undefined,
          phone_number: formData.phone_number || undefined,
          permissions: formData.permissions
        };

        await usersService.create(createData);
        showMessage('success', 'Utente creato con successo');
      }

      setShowUserModal(false);
      loadUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore salvataggio utente');
    }
  };

  const handleToggleActive = async (user: UserData) => {
    if (user.id === currentUserId) {
      showMessage('error', 'Non puoi disattivare il tuo account');
      return;
    }

    try {
      if (user.is_active) {
        await usersService.deactivate(user.id);
        showMessage('success', 'Utente disattivato');
      } else {
        await usersService.activate(user.id);
        showMessage('success', 'Utente attivato');
      }
      loadUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore modifica stato');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (deletingUser.id === currentUserId) {
      showMessage('error', 'Non puoi eliminare il tuo account');
      return;
    }

    try {
      await usersService.delete(deletingUser.id);
      showMessage('success', 'Utente eliminato con successo');
      setShowDeleteModal(false);
      setDeleteingUser(null);
      loadUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore eliminazione utente');
    }
  };

  const openPermissionsModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      ...formData,
      permissions: user.permissions || []
    });
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;

    try {
      await usersService.updatePermissions(editingUser.id, formData.permissions);
      showMessage('success', 'Permessi aggiornati con successo');
      setShowPermissionsModal(false);
      loadUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore aggiornamento permessi');
    }
  };

  const openPasswordModal = (user: UserData) => {
    setEditingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!editingUser) return;

    if (!newPassword || newPassword.length < 6) {
      showMessage('error', 'Password deve essere di almeno 6 caratteri');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Le password non coincidono');
      return;
    }

    try {
      await usersService.resetPassword(editingUser.id, newPassword);
      showMessage('success', 'Password resettata con successo');
      setShowPasswordModal(false);
      setEditingUser(null);
    } catch (error: any) {
      showMessage('error', error.message || 'Errore reset password');
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    return ROLE_OPTIONS.find(r => r.value === role)?.color || '#7c8799';
  };

  return (
    <div className="admin-users-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>{t('users.title', { defaultValue: 'Gestione Utenti' })}</h1>
            <p>{t('users.subtitle', { defaultValue: 'Crea, modifica ed elimina utenti del sistema' })}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <UserPlus size={20} />
          {t('users.actions.newUser', { defaultValue: 'Nuovo Utente' })}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder', { defaultValue: 'Cerca per nome, email o reparto...' })}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">{t('users.filters.allRoles', { defaultValue: 'Tutti i ruoli' })}</option>
            {ROLE_OPTIONS.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">{t('users.filters.allStates', { defaultValue: 'Tutti gli stati' })}</option>
            <option value="active">{t('users.status.active', { defaultValue: 'Attivi' })}</option>
            <option value="inactive">{t('users.status.inactive', { defaultValue: 'Disattivi' })}</option>
          </select>

          <button className="btn-icon" onClick={loadUsers} title={t('common.buttons.refresh', { defaultValue: 'Ricarica' })}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={40} />
          <p>{t('users.loading', { defaultValue: 'Caricamento utenti...' })}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>{t('users.empty', { defaultValue: 'Nessun utente trovato' })}</h3>
          <p>{t('users.tryAdjustFilters', { defaultValue: 'Prova a modificare i filtri o crea un nuovo utente' })}</p>
          <button className="btn-primary" onClick={openCreateModal}>
            <UserPlus size={20} />
            {t('users.createFirst', { defaultValue: 'Crea Primo Utente' })}
          </button>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('users.table.user', { defaultValue: 'Utente' })}</th>
                <th>{t('users.table.role', { defaultValue: 'Ruolo' })}</th>
                <th>{t('users.table.department', { defaultValue: 'Reparto' })}</th>
                <th>{t('users.table.contacts', { defaultValue: 'Contatti' })}</th>
                <th>{t('users.table.permissions', { defaultValue: 'Permessi' })}</th>
                <th>{t('users.table.status', { defaultValue: 'Stato' })}</th>
                <th>{t('users.table.actions', { defaultValue: 'Azioni' })}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <strong>{user.name}</strong>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                    >
                      {ROLE_OPTIONS.find(r => r.value === user.role)?.label}
                    </span>
                  </td>
                  <td>{user.department || '—'}</td>
                  <td>
                    <div className="contacts">
                      {user.phone_number && (
                        <span>
                          <Phone size={14} /> {user.phone_number}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => openPermissionsModal(user)}
                      title={t('users.actions.managePermissions', { defaultValue: 'Gestisci permessi' })}
                    >
                      <Shield size={16} />
                      {user.permissions?.length || 0} {t('users.permissions.label', { defaultValue: 'permessi' })}
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? t('users.status.activeOne', { defaultValue: 'Attivo' }) : t('users.status.inactiveOne', { defaultValue: 'Disattivo' })}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(user)}
                        title={t('users.actions.edit', { defaultValue: 'Modifica' })}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleToggleActive(user)}
                        title={user.is_active ? t('users.actions.deactivate', { defaultValue: 'Disattiva' }) : t('users.actions.activate', { defaultValue: 'Attiva' })}
                        disabled={user.id === currentUserId}
                      >
                        {user.is_active ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openPasswordModal(user)}
                        title={t('users.actions.resetPassword', { defaultValue: 'Reset Password' })}
                      >
                        <Lock size={18} />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => {
                          setDeleteingUser(user);
                          setShowDeleteModal(true);
                        }}
                        title={t('users.actions.delete', { defaultValue: 'Elimina' })}
                        disabled={user.id === currentUserId}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? t('users.modal.editUser', { defaultValue: 'Modifica Utente' }) : t('users.modal.newUser', { defaultValue: 'Nuovo Utente' })}</h2>
              <button className="btn-icon" onClick={() => setShowUserModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('users.form.fullName', { defaultValue: 'Nome Completo *' })}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mario Rossi"
                  />
                </div>

                <div className="form-group">
                  <label>{t('users.form.email', { defaultValue: 'Email *' })}</label>
                  <div className="input-icon">
                    <Mail size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="mario.rossi@example.com"
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>{t('users.form.password', { defaultValue: 'Password *' })}</label>
                    <div className="input-icon">
                      <Lock size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t('users.password.minChars', { defaultValue: 'Minimo 6 caratteri' })}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>{t('users.form.role', { defaultValue: 'Ruolo *' })}</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('users.form.department', { defaultValue: 'Reparto' })}</label>
                  <div className="input-icon">
                    <Briefcase size={20} />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Es: IT, Vendite, Amministrazione"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('users.form.phone', { defaultValue: 'Telefono' })}</label>
                  <div className="input-icon">
                    <Phone size={20} />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={e =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                      placeholder="+41 123 456 789"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Permessi</label>
                <div className="permissions-grid">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <label key={perm.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.value)}
                        onChange={() => togglePermission(perm.value)}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUserModal(false)}>
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button className="btn-primary" onClick={handleSaveUser}>
                <Save size={20} />
                {editingUser ? t('users.actions.saveChanges', { defaultValue: 'Salva Modifiche' }) : t('users.actions.create', { defaultValue: 'Crea Utente' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('users.modal.deleteTitle', { defaultValue: 'Conferma Eliminazione' })}</h2>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="alert alert-danger">
                <AlertCircle size={24} />
                <div>
                  <strong>{t('users.modal.deleteConfirm', { defaultValue: 'Sei sicuro di voler eliminare questo utente?' })}</strong>
                  <p>
                    {t('users.modal.deleteWarningStart', { defaultValue: "L'utente" })} <strong>{deletingUser.name}</strong> ({deletingUser.email}) {t('users.modal.deleteWarningEnd', { defaultValue: 'verrà eliminato permanentemente. Questa azione non può essere annullata.' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button className="btn-danger" onClick={handleDeleteUser}>
                <Trash2 size={20} />
                {t('users.actions.deleteUser', { defaultValue: 'Elimina Utente' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Shield size={24} />
                {t('users.permissions.title', { defaultValue: 'Permessi:' })} {editingUser.name}
              </h2>
              <button className="btn-icon" onClick={() => setShowPermissionsModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="permissions-grid">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <label key={perm.value} className="checkbox-label permission-item">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.value)}
                      onChange={() => togglePermission(perm.value)}
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowPermissionsModal(false)}
              >
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button className="btn-primary" onClick={handleSavePermissions}>
                <Save size={20} />
                {t('users.actions.savePermissions', { defaultValue: 'Salva Permessi' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Lock size={24} />
                {t('users.password.title', { defaultValue: 'Reset Password:' })} {editingUser.name}
              </h2>
              <button className="btn-icon" onClick={() => setShowPasswordModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>{t('users.password.new', { defaultValue: 'Nuova Password' })}</label>
                <div className="input-icon">
                  <Lock size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('users.password.confirm', { defaultValue: 'Conferma Password' })}</label>
                <div className="input-icon">
                  <Lock size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t('users.password.confirmPlaceholder', { defaultValue: 'Conferma la password' })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button className="btn-primary" onClick={handleResetPassword}>
                <Lock size={20} />
                {t('users.actions.resetPassword', { defaultValue: 'Reset Password' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
