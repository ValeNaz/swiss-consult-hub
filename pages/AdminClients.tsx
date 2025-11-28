/**
 * ============================================
 * ADMIN CLIENTS - GESTIONE COMPLETA MIGLIORATA
 * ============================================
 * Gestione clienti avanzata con CRUD completo, export e bulk actions
 */

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Grid,
  List,
  Download,
  Upload,
  CheckSquare,
  Square,
  MoreHorizontal,
  Save,
  AlertCircle,
  Check,
  Building2,
  CreditCard,
  User
} from 'lucide-react';
import { clientsService, requestsService } from '../services/dataService';
import type { Client, ClientStatus } from '../types/admin.types';
import '../styles/AdminClients.css';
import '../styles/AdminClientsModal.css';

interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  fiscal_code: string;
  address: string;
  city: string;
  canton: string;
  postal_code: string;
  status: ClientStatus;
}

const AdminClientsImproved: React.FC = () => {
  const { t } = useTranslation('admin');  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // CRUD Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Bulk Actions
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Data
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    fiscal_code: '',
    address: '',
    city: '',
    canton: '',
    postal_code: '',
    status: 'nuovo'
  });

  // Load clients in real-time
  useEffect(() => {
    const unsubscribe = clientsService.subscribe((data) => {
      setClients(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate requests per client
  const [clientRequests, setClientRequests] = useState<Record<string, number>>({});
  useEffect(() => {
    const unsubscribe = requestsService.subscribe((requests) => {
      const counts: Record<string, number> = {};
      requests.forEach((req) => {
        const email = req.client_email;
        if (email) {
          counts[email] = (counts[email] || 0) + 1;
        }
      });
      setClientRequests(counts);
    });
    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...clients];

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.first_name.toLowerCase().includes(term) ||
          c.last_name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.phone?.toLowerCase?.().includes(term) ?? false) ||
          (c.fiscal_code?.toLowerCase?.().includes(term) ?? false)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
      const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredClients(filtered);
  }, [clients, searchQuery, filterStatus]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      fiscal_code: '',
      address: '',
      city: '',
      canton: '',
      postal_code: '',
      status: 'nuovo'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone || '',
      fiscal_code: client.fiscal_code || '',
      address: client.address || '',
      city: client.city || '',
      canton: client.canton || '',
      postal_code: client.postal_code || '',
      status: client.status
    });
    setShowEditModal(true);
  };

  const handleCreateClient = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      showMessage('error', 'Nome, cognome ed email sono obbligatori');
      return;
    }

    try {
      await clientsService.create(formData);
      showMessage('success', 'Cliente creato con successo');
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore creazione cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    if (!formData.first_name || !formData.last_name || !formData.email) {
      showMessage('error', 'Nome, cognome ed email sono obbligatori');
      return;
    }

    try {
      await clientsService.update(editingClient.id, formData);
      showMessage('success', 'Cliente aggiornato con successo');
      setShowEditModal(false);
      setEditingClient(null);
      resetForm();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore aggiornamento cliente');
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;

    try {
      await clientsService.delete(deletingClient.id);
      showMessage('success', 'Cliente eliminato con successo');
      setShowDeleteModal(false);
      setDeletingClient(null);
    } catch (error: any) {
      showMessage('error', error.message || 'Errore eliminazione cliente');
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAllClients = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Eliminare ${selectedClients.size} clienti selezionati?`)) return;

    try {
      await Promise.all(Array.from(selectedClients).map((id: string) => clientsService.delete(id)));
      showMessage('success', `${selectedClients.size} clienti eliminati`);
      setSelectedClients(new Set());
      setShowBulkActions(false);
    } catch (error: any) {
      showMessage('error', 'Errore eliminazione multipla');
    }
  };

  const handleBulkStatusChange = async (newStatus: ClientStatus) => {
    try {
      await Promise.all(
        Array.from(selectedClients).map((id: string) => 
          clientsService.update(id, { status: newStatus })
        )
      );
      showMessage('success', `${selectedClients.size} clienti aggiornati`);
      setSelectedClients(new Set());
      setShowBulkActions(false);
    } catch (error: any) {
      showMessage('error', 'Errore aggiornamento multiplo');
    }
  };

  const exportClientsCSV = () => {
    const headers = ['Nome', 'Cognome', 'Email', 'Telefono', 'Città', 'Cantone', 'Stato', 'Richieste'];
    const rows = filteredClients.map(c => [
      c.first_name,
      c.last_name,
      c.email,
      c.phone || '',
      c.city || '',
      c.canton || '',
      c.status,
      clientRequests[c.email] || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clienti_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('success', 'Export completato');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuovo':
        return 'status-new';
      case 'attivo':
        return 'status-active';
      case 'inattivo':
        return 'status-inactive';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nuovo':
        return 'Nuovo';
      case 'attivo':
        return 'Attivo';
      case 'inattivo':
        return 'Inattivo';
      default:
        return status;
    }
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <RefreshCw className="spin" size={40} />
        <p>{t('clients.loading', { defaultValue: 'Caricamento clienti...' })}</p>
      </div>
    );
  }

  return (
    <div className="admin-clients">
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

      {/* Page Header */}
      <div className="clients-header">
        <div>
          <h1 className="page-title">{t('clients.title', { defaultValue: 'Gestione Clienti' })}</h1>
          <p className="page-subtitle">
            {t('clients.count', { count: filteredClients.length, defaultValue: `${filteredClients.length} ${filteredClients.length === 1 ? 'cliente' : 'clienti'}` })}
            {selectedClients.size > 0 && ` (${selectedClients.size} ${t('clients.selected', { defaultValue: 'selezionati' })})`}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={exportClientsCSV}>
            <Download size={18} />
            {t('clients.exportCsv', { defaultValue: 'Esporta CSV' })}
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            {t('clients.addClient', { defaultValue: 'Nuovo Cliente' })}
          </button>
          <button
            className="btn-icon-view"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title={viewMode === 'grid' ? t('clients.view.list', { defaultValue: 'Vista Lista' }) : t('clients.view.grid', { defaultValue: 'Vista Griglia' })}
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bulk-actions-bar">
          <span>{t('clients.selectedCount', { count: selectedClients.size, defaultValue: `${selectedClients.size} selezionati` })}</span>
          <div className="bulk-actions">
            <button onClick={() => handleBulkStatusChange('attivo')}>
              {t('clients.bulk.markActive', { defaultValue: 'Segna come Attivi' })}
            </button>
            <button onClick={() => handleBulkStatusChange('inattivo')}>
              {t('clients.bulk.markInactive', { defaultValue: 'Segna come Inattivi' })}
            </button>
            <button onClick={handleBulkDelete} className="btn-danger">
              <Trash2 size={16} />
              {t('clients.bulk.deleteSelected', { defaultValue: 'Elimina Selezionati' })}
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="clients-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder', { defaultValue: 'Cerca clienti per nome, email, telefono o codice fiscale...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t('clients.filters.all', { defaultValue: 'Tutti gli stati' })}</option>
          <option value="nuovo">{t('clients.status.new', { defaultValue: 'Nuovo' })}</option>
          <option value="attivo">{t('clients.status.active', { defaultValue: 'Attivo' })}</option>
          <option value="inattivo">{t('clients.status.inactive', { defaultValue: 'Inattivo' })}</option>
        </select>

        {filteredClients.length > 0 && (
          <button className="btn-secondary" onClick={selectAllClients}>
            {selectedClients.size === filteredClients.length ? (
              <><CheckSquare size={18} /> {t('clients.deselectAll', { defaultValue: 'Deseleziona Tutti' })}</>
            ) : (
              <><Square size={18} /> {t('clients.selectAll', { defaultValue: 'Seleziona Tutti' })}</>
            )}
          </button>
        )}
      </div>

      {/* Clients Grid/List */}
      {filteredClients.length === 0 ? (
        <div className="empty-state-large">
          <Users size={48} />
          <h3>{t('clients.empty', { defaultValue: 'Nessun cliente trovato' })}</h3>
          <p>
            {searchQuery || filterStatus
              ? t('clients.tryAdjustFilters', { defaultValue: 'Prova a modificare i filtri di ricerca' })
              : t('clients.noClients', { defaultValue: 'Crea il primo cliente o attendi che vengano creati dalle richieste' })}
          </p>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            {t('clients.createFirst', { defaultValue: 'Crea Primo Cliente' })}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="clients-grid">
          {filteredClients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-card-selection">
                <input
                  type="checkbox"
                  checked={selectedClients.has(client.id)}
                  onChange={() => toggleClientSelection(client.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div
                className="client-card-content"
                onClick={() => navigate(`/admin/clients/${client.id}`)}
              >
                <div className="client-card-header">
                  <div className="client-avatar">
                    {client.first_name[0]}
                    {client.last_name[0]}
                  </div>
                  <span className={`client-status ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>

                <div className="client-card-body">
                  <h3 className="client-name">
                    {client.first_name} {client.last_name}
                  </h3>

                  <div className="client-info-list">
                    <div className="client-info-item">
                      <Mail size={14} />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="client-info-item">
                        <Phone size={14} />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {(client.city || client.canton) && (
                      <div className="client-info-item">
                        <MapPin size={14} />
                        <span>
                          {client.city || ''}{client.city && client.canton ? ', ' : ''}
                          {client.canton || ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="client-stats">
                    <div className="client-stat">
                      <FileText size={16} />
                      <div>
                        <span className="stat-value">{clientRequests[client.email] || 0}</span>
                        <span className="stat-label">{t('clients.table.requests', { defaultValue: 'Richieste' })}</span>
                      </div>
                    </div>
                    <div className="client-stat">
                      <Calendar size={16} />
                      <div>
                        <span className="stat-value">{formatDate(client.created_at)}</span>
                        <span className="stat-label">{t('clients.table.lastContact', { defaultValue: 'Cliente dal' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="client-card-footer">
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(client);
                    }}
                    title="Modifica"
                  >
                    <Edit size={18} />
                    Modifica
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingClient(client);
                      setShowDeleteModal(true);
                    }}
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedClients.size === filteredClients.length}
                    onChange={selectAllClients}
                  />
                </th>
                <th>Cliente</th>
                <th>Contatti</th>
                <th>Ubicazione</th>
                <th>Richieste</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedClients.has(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                    />
                  </td>
                  <td>
                    <div className="table-client-info">
                      <div className="client-avatar-small">
                        {client.first_name[0]}{client.last_name[0]}
                      </div>
                      <div>
                        <strong>{client.first_name} {client.last_name}</strong>
                        <span className="client-email-small">{client.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {client.phone && (
                      <div className="table-contact-item">
                        <Phone size={14} />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {(client.city || client.canton) && (
                      <span>{client.city}{client.city && client.canton ? ', ' : ''}{client.canton}</span>
                    )}
                  </td>
                  <td>
                    <span className="table-badge">{clientRequests[client.email] || 0}</span>
                  </td>
                  <td>
                    <span className={`client-status-small ${getStatusColor(client.status)}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                        title={t('clients.actions.viewProfile', { defaultValue: 'Visualizza profilo' })}
                      >
                        <User size={18} />
                        {t('clients.actions.viewProfile', { defaultValue: 'Visualizza profilo' })}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(client)}
                        title={t('clients.actions.edit', { defaultValue: 'Modifica' })}
                      >
                        <Edit size={18} />
                        {t('clients.actions.edit', { defaultValue: 'Modifica' })}
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => {
                          setDeletingClient(client);
                          setShowDeleteModal(true);
                        }}
                        title={t('clients.actions.delete', { defaultValue: 'Elimina' })}
                      >
                        <Trash2 size={18} />
                        {t('clients.actions.delete', { defaultValue: 'Elimina' })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Client Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showCreateModal ? t('clients.modal.newClient', { defaultValue: 'Nuovo Cliente' }) : t('clients.modal.editClient', { defaultValue: 'Modifica Cliente' })}</h2>
              <button
                className="btn-icon"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('clients.form.firstName', { defaultValue: 'Nome *' })}</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Mario"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.lastName', { defaultValue: 'Cognome *' })}</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Rossi"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.email', { defaultValue: 'Email *' })}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mario.rossi@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.phone', { defaultValue: 'Telefono' })}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+41 123 456 789"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.fiscalCode', { defaultValue: 'Codice Fiscale' })}</label>
                  <input
                    type="text"
                    value={formData.fiscal_code}
                    onChange={e => setFormData({ ...formData, fiscal_code: e.target.value })}
                    placeholder="CHE-123.456.789"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.status', { defaultValue: 'Stato' })}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                  >
                    <option value="nuovo">{t('clients.status.new', { defaultValue: 'Nuovo' })}</option>
                    <option value="attivo">{t('clients.status.active', { defaultValue: 'Attivo' })}</option>
                    <option value="inattivo">{t('clients.status.inactive', { defaultValue: 'Inattivo' })}</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label>{t('clients.form.address', { defaultValue: 'Indirizzo' })}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Via Roma, 123"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.city', { defaultValue: 'Città' })}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Zurigo"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.canton', { defaultValue: 'Cantone' })}</label>
                  <input
                    type="text"
                    value={formData.canton}
                    onChange={e => setFormData({ ...formData, canton: e.target.value })}
                    placeholder="ZH"
                  />
                </div>

                <div className="form-group">
                  <label>{t('clients.form.postalCode', { defaultValue: 'CAP' })}</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="8000"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button
                className="btn-primary"
                onClick={showCreateModal ? handleCreateClient : handleUpdateClient}
              >
                <Save size={20} />
                {showCreateModal ? t('clients.actions.create', { defaultValue: 'Crea Cliente' }) : t('clients.actions.saveChanges', { defaultValue: 'Salva Modifiche' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClient && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('clients.modal.deleteTitle', { defaultValue: 'Conferma Eliminazione' })}</h2>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="alert alert-danger">
                <AlertCircle size={24} />
                <div>
                  <strong>{t('clients.modal.deleteConfirm', { defaultValue: 'Sei sicuro di voler eliminare questo cliente?' })}</strong>
                  <p>
                    {t('clients.modal.deleteWarning', { defaultValue: 'Il cliente' })} <strong>{deletingClient.first_name} {deletingClient.last_name}</strong> ({deletingClient.email}) {t('clients.modal.deleteWarning2', { defaultValue: 'verrà eliminato permanentemente.' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.buttons.cancel', { defaultValue: 'Annulla' })}
              </button>
              <button className="btn-danger" onClick={handleDeleteClient}>
                <Trash2 size={20} />
                {t('clients.actions.deleteClient', { defaultValue: 'Elimina Cliente' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientsImproved;
