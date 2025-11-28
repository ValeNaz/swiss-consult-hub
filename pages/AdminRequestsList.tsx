import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MoreVertical,
  Download,
  RefreshCw,
  Paperclip,
  CreditCard,
  Shield,
  Home,
  Briefcase,
  Scale,
  Heart,
  FileText,
  User,
  Mail
} from 'lucide-react';
import { requestsService, clientsService, Request } from '../services/dataService';
import { useRealTimeUpdates } from '../services/realTimeService';
import { getServiceColor, getServiceLabel, getServiceColorWithAlpha } from '../constants/serviceColors';
import '../styles/AdminRequestsList.css';
import '../styles/AdminAttachments.css';

type RequestStatus = 'nuova' | 'in_lavorazione' | 'completata' | 'rifiutata';
type ServiceType = 'creditizia' | 'assicurativa' | 'immobiliare' | 'lavorativa' | 'legale' | 'medica' | 'fiscale' | 'generale' | '';

const AdminRequestsList: React.FC = () => {
  const { t } = useTranslation('admin');  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [serviceFilter, setServiceFilter] = useState<ServiceType>('');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  
  // Hook per aggiornamenti real-time
  const realTime = useRealTimeUpdates();

  // Load requests in real-time
  useEffect(() => {
    const unsubscribe = requestsService.subscribe((data) => {
      setRequests(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listener per aggiornamenti real-time
  useEffect(() => {
    // Ascolta aggiornamenti singole richieste
    const unsubscribeUpdate = realTime.onRequestUpdate((data) => {
      setRequests(prev => prev.map(req => 
        req.id === data.requestId 
          ? { ...req, ...data.changes }
          : req
      ));
    });

    // Ascolta nuove richieste
    const unsubscribeCreated = realTime.onRequestCreated((data) => {
      setRequests(prev => [data.request, ...prev]);
    });

    // Ascolta eliminazioni
    const unsubscribeDeleted = realTime.onRequestDeleted((data) => {
      setRequests(prev => prev.filter(req => req.id !== data.requestId));
      setSelectedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.requestId);
        return newSet;
      });
    });

    // Ascolta azioni bulk
    const unsubscribeBulk = realTime.onBulkActionCompleted((data) => {
      // Rimuovi selezioni per le richieste processate
      setSelectedRequests(prev => {
        const newSet = new Set(prev);
        data.ids.forEach(id => newSet.delete(id));
        return newSet;
      });
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeCreated();
      unsubscribeDeleted();
      unsubscribeBulk();
    };
  }, [realTime]);

  // Apply filters
  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.client_name?.toLowerCase().includes(term) ||
          req.client_email?.toLowerCase().includes(term) ||
          req.description?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Service filter
    if (serviceFilter) {
      filtered = filtered.filter((req) => req.service_type === (serviceFilter as any));
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
      const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, serviceFilter]);

  // Prefiltro da query string (client email, status)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const client = params.get('client');
    const status = params.get('status');
    if (client) {
      setSearchTerm(client);
    }
    if (status) {
      setStatusFilter(status as RequestStatus | '');
    }
  }, [location.search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(filteredRequests.map((r) => r.id!)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRequests(newSelected);
  };

  const handleApprove = async (id: string) => {
    try {
      await requestsService.update(id, { status: 'in_lavorazione' });
      setActionMenuId(null);
      // Il real-time service notificherà automaticamente l'aggiornamento
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Errore nell\'approvazione della richiesta');
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Sei sicuro di voler rifiutare questa richiesta?')) {
      try {
        await requestsService.update(id, { status: 'rifiutata' });
        setActionMenuId(null);
        // Il real-time service notificherà automaticamente l'aggiornamento
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Errore nel rifiuto della richiesta');
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await requestsService.update(id, { status: 'completata' });
      setActionMenuId(null);
      // L'aggiornamento è automatico grazie al real-time service
    } catch (error) {
      console.error('Error completing request:', error);
      alert("Errore nel completamento della richiesta");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta? Questa azione è irreversibile.')) {
      try {
        await requestsService.delete(id);
        setActionMenuId(null);
        // Il real-time service notificherà automaticamente l'eliminazione
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Errore nell\'eliminazione della richiesta');
      }
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedRequests.size === 0) {
      alert('Seleziona almeno una richiesta');
      return;
    }

    const confirmMsg =
      action === 'delete'
        ? 'Eliminare le richieste selezionate?'
        : action === 'approve'
        ? 'Approvare le richieste selezionate?'
        : 'Rifiutare le richieste selezionate?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const ids = Array.from(selectedRequests) as string[];
      
      if (action === 'delete') {
        await requestsService.bulkDelete(ids);
      } else if (action === 'approve') {
        await requestsService.bulkUpdate(ids, { status: 'in_lavorazione' });
      } else {
        await requestsService.bulkUpdate(ids, { status: 'rifiutata' });
      }

      // Le selezioni verranno pulite automaticamente dal listener real-time
    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('Errore nell\'esecuzione dell\'azione');
    }
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      nuova: { label: 'Nuova', className: 'status-badge-warning' },
      in_lavorazione: { label: 'In lavorazione', className: 'status-badge-info' },
      completata: { label: 'Completata', className: 'status-badge-success' },
      rifiutata: { label: 'Rifiutata', className: 'status-badge-error' }
    };
    const badge = badges[status] || { label: status, className: 'status-badge-default' };
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const getServiceLabelLocal = (type: string): string => getServiceLabel(type);

  const getServiceIcon = (type: string) => {
    const color = getServiceColor(type);
    const bg = getServiceColorWithAlpha(type, 0.1);
    const map: Record<string, React.ReactNode> = {
      creditizia: <CreditCard size={18} />,
      assicurativa: <Shield size={18} />,
      immobiliare: <Home size={18} />,
      lavorativa: <Briefcase size={18} />,
      legale: <Scale size={18} />,
      medica: <Heart size={18} />,
      fiscale: <FileText size={18} />,
      generale: <FileText size={18} />
    };
    return { icon: map[type] || map['generale'], color, bg };
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{t('requests.loading', { defaultValue: 'Caricamento richieste...' })}</p>
      </div>
    );
  }

  return (
    <div className="requests-list-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('requests.title', { defaultValue: 'Richieste' })}</h1>
          <p className="page-subtitle">
            {t('requests.subtitle', { defaultValue: 'Gestisci tutte le richieste dei clienti' })}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('requests.searchPlaceholder', { defaultValue: 'Cerca per nome, email o descrizione...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
          >
            <option value="">{t('requests.filters.allStates', { defaultValue: 'Tutti gli stati' })}</option>
            <option value="nuova">{t('requests.status.nuova', { defaultValue: 'Nuove' })}</option>
            <option value="in_lavorazione">{t('requests.status.in_lavorazione', { defaultValue: 'In lavorazione' })}</option>
            <option value="completata">{t('requests.status.completata', { defaultValue: 'Completate' })}</option>
            <option value="rifiutata">{t('requests.status.rifiutata', { defaultValue: 'Rifiutate' })}</option>
          </select>

          <select
            className="filter-select"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceType)}
          >
            <option value="">{t('requests.filters.allServices', { defaultValue: 'Tutti i servizi' })}</option>
            <option value="creditizia">{t('services.creditizia.title', { defaultValue: 'Consulenza Creditizia' })}</option>
            <option value="assicurativa">{t('services.assicurativa.title', { defaultValue: 'Consulenza Assicurativa' })}</option>
            <option value="immobiliare">{t('services.immobiliare.title', { defaultValue: 'Intermediazione e Gestione immobiliare' })}</option>
            <option value="lavorativa">{t('services.lavorativa.title', { defaultValue: 'Consulenza Lavorativa e Professionale' })}</option>
            <option value="legale">{t('services.legale.title', { defaultValue: 'Consulenza Legale' })}</option>
            <option value="medica">{t('services.medica.title', { defaultValue: 'Consulenza Medica' })}</option>
            <option value="fiscale">{t('services.commerciale.title', { defaultValue: 'Consulenza Commerciale' })}</option>
            <option value="generale">{t('services.page.allServices', { defaultValue: 'Tutti i servizi' })}</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">{t('requests.bulkActions.selected', { count: selectedRequests.size, defaultValue: `${selectedRequests.size} selezionate` })}</span>
          <div className="bulk-actions">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleBulkAction('approve')}
            >
              <CheckCircle size={16} />
              {t('requests.actions.approve', { defaultValue: 'Approva' })}
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkAction('reject')}
            >
              <XCircle size={16} />
              {t('requests.actions.reject', { defaultValue: 'Rifiuta' })}
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 size={16} />
              {t('requests.actions.delete', { defaultValue: 'Elimina' })}
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="results-info">
        {t('requests.resultsInfo', { shown: filteredRequests.length, total: requests.length, defaultValue: `Visualizzate ${filteredRequests.length} di ${requests.length} richieste` })}
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state-large">
          <Filter size={48} strokeWidth={1.5} />
          <h3>{t('requests.empty', { defaultValue: 'Nessuna richiesta trovata' })}</h3>
          <p>
            {searchTerm || statusFilter || serviceFilter
              ? t('requests.tryAdjustFilters', { defaultValue: 'Prova a modificare i filtri di ricerca' })
              : t('requests.noRequests', { defaultValue: 'Non ci sono richieste al momento' })}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      selectedRequests.size === filteredRequests.length &&
                      filteredRequests.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>{t('requests.table.client', { defaultValue: 'Cliente' })}</th>
                <th>{t('requests.table.service', { defaultValue: 'Servizio' })}</th>
                <th>{t('requests.table.description', { defaultValue: 'Descrizione' })}</th>
                <th>{t('requests.table.date', { defaultValue: 'Data' })}</th>
                <th>{t('requests.table.status', { defaultValue: 'Stato' })}</th>
                <th className="th-center">{t('requests.table.attachments', { defaultValue: 'Allegati' })}</th>
                <th className="th-actions">{t('requests.table.actions', { defaultValue: 'Azioni' })}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className={`${selectedRequests.has(request.id!) ? 'row-selected ' : ''}row-clickable`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Apri richiesta ${request.id}`}
                  onClick={() => navigate(`/admin/requests/${request.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/admin/requests/${request.id}`);
                    }
                  }}
                  style={{ borderLeft: `4px solid ${getServiceColor(request.service_type)}` }}
                >
                  <td className="td-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedRequests.has(request.id!)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleSelectRequest(request.id!, e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <div className="client-cell-enhanced">
                      <div className="client-avatar-mini">
                        <User size={16} strokeWidth={2} />
                      </div>
                      <div className="client-info">
                        <div className="client-name-bold">{request.client_name || t('requests.table.client', { defaultValue: 'Cliente' })}</div>
                        <div className="client-email-small">
                          <Mail size={12} />
                          {request.client_email || 'N/D'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div 
                      className="service-badge-enhanced" 
                      style={{
                        backgroundColor: getServiceIcon(request.service_type).bg,
                        color: getServiceIcon(request.service_type).color
                      }}
                    >
                      <span className="service-icon">{getServiceIcon(request.service_type).icon}</span>
                      <span className="service-label">{getServiceLabelLocal(request.service_type)}</span>
                    </div>
                  </td>
                  <td className="td-description">
                    {request.description || '-'}
                  </td>
                  <td className="td-date">{formatDate(request.created_at)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td className="td-center">
                    {request.attachments && request.attachments.length > 0 ? (
                      <span className="attachments-badge" title={t('requests.attachments.count', { count: request.attachments.length, defaultValue: `${request.attachments.length} allegati` })}>
                        <Paperclip size={14} />
                        {request.attachments.length}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="actions-cell">
                      <button
                        className="btn-icon"
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/requests/${request.id}`); }}
                        title={t('requests.actions.view', { defaultValue: 'Visualizza dettagli' })}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon btn-success"
                        onClick={(e) => { e.stopPropagation(); handleApprove(request.id!); }}
                        title={t('requests.actions.approve', { defaultValue: 'Approva' })}
                        disabled={request.status !== 'nuova'}
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (request.client_id) {
                            navigate(`/admin/clients/${request.client_id}`);
                            return;
                          }
                          if (request.client_email) {
                            const client = await clientsService.findByEmail(request.client_email);
                            if (client?.id) {
                              navigate(`/admin/clients/${client.id}`);
                            } else {
                              alert('Cliente non trovato per questa richiesta');
                            }
                          }
                        }}
                        title={t('requests.actions.viewProfile', { defaultValue: 'Visualizza profilo cliente' })}
                      >
                        <User size={18} />
                      </button>
                      <button
                        className="btn-icon btn-success"
                        onClick={(e) => { e.stopPropagation(); handleComplete(request.id!); }}
                        title={t('requests.actions.complete', { defaultValue: 'Segna completata' })}
                        disabled={request.status !== 'in_lavorazione'}
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        className="btn-icon btn-warning"
                        onClick={(e) => { e.stopPropagation(); handleReject(request.id!); }}
                        title={t('requests.actions.reject', { defaultValue: 'Rifiuta' })}
                        disabled={request.status === 'rifiutata'}
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={(e) => { e.stopPropagation(); handleDelete(request.id!); }}
                        title={t('requests.actions.delete', { defaultValue: 'Elimina' })}
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
    </div>
  );
};

export default AdminRequestsList;
