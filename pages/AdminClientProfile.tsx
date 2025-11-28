import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  TrendingUp,
  Eye,
  CreditCard,
  Shield,
  Home,
  Briefcase,
  Scale,
  Heart
} from 'lucide-react';
import { clientsService, requestsService, Client, Request } from '../services/dataService';
import { useRealTimeUpdates } from '../services/realTimeService';
import '../styles/AdminClientProfile.css';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  creditizia: <CreditCard size={18} />,
  assicurativa: <Shield size={18} />,
  immobiliare: <Home size={18} />,
  lavorativa: <Briefcase size={18} />,
  legale: <Scale size={18} />,
  medica: <Heart size={18} />,
  fiscale: <FileText size={18} />,
  generale: <FileText size={18} />
};

const SERVICE_COLORS: Record<string, string> = {
  creditizia: '#4f46e5',
  assicurativa: '#2563eb',
  immobiliare: '#059669',
  lavorativa: '#ea580c',
  legale: '#7c3aed',
  medica: '#0891b2',
  fiscale: '#db2777',
  generale: '#6b7886'
};

const AdminClientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Hook per aggiornamenti real-time silenziosi
  const realTime = useRealTimeUpdates();

  useEffect(() => {
    loadClientData();
  }, [id]);

  // Listener per aggiornamenti real-time SILENZIOSI
  useEffect(() => {
    if (!client?.email) return;

    // Ascolta aggiornamenti delle richieste del cliente
    const unsubscribeRequestUpdate = realTime.onRequestUpdate((data) => {
      setRequests(prev => prev.map(req => 
        req.id === data.requestId 
          ? { ...req, ...data.changes }
          : req
      ));
    });

    // Ascolta nuove richieste
    const unsubscribeRequestCreated = realTime.onRequestCreated((data) => {
      if (data.request.client_email === client.email) {
        setRequests(prev => [data.request, ...prev]);
      }
    });

    // Ascolta eliminazioni richieste
    const unsubscribeRequestDeleted = realTime.onRequestDeleted((data) => {
      setRequests(prev => prev.filter(req => req.id !== data.requestId));
    });

    return () => {
      unsubscribeRequestUpdate();
      unsubscribeRequestCreated();
      unsubscribeRequestDeleted();
    };
  }, [client?.email, realTime]);

  const loadClientData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      
      // Carica cliente
      const clientData = await clientsService.getById(id);
      setClient(clientData);

      // Carica tutte le richieste e filtra per email cliente
      if (clientData?.email) {
        const allRequests = await requestsService.getAll();
        const clientRequests = allRequests.filter(
          req => req.client_email === clientData.email
        );
        setRequests(clientRequests);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async (requestId: string) => {
    try {
      await requestsService.update(requestId, { status: 'completata' });
      // Ricarica i dati
      loadClientData();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Errore nell\'aggiornamento della richiesta');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      nuova: { label: 'Nuova', className: 'status-badge-warning', icon: <AlertCircle size={14} /> },
      in_lavorazione: { label: 'In Lavorazione', className: 'status-badge-info', icon: <Clock size={14} /> },
      completata: { label: 'Completata', className: 'status-badge-success', icon: <CheckCircle size={14} /> },
      rifiutata: { label: 'Rifiutata', className: 'status-badge-error', icon: <XCircle size={14} /> }
    };
    const badge = badges[status] || { label: status, className: 'status-badge-default', icon: null };
    return (
      <span className={`status-badge-new ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getServiceLabel = (type: string): string => {
    const labels: Record<string, string> = {
      creditizia: 'Credito',
      assicurativa: 'Assicurazione',
      immobiliare: 'Immobiliare',
      lavorativa: 'Lavoro',
      legale: 'Legale',
      medica: 'Medica',
      fiscale: 'Fiscale',
      generale: 'Generale'
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(req => req.status === statusFilter);

  const stats = {
    total: requests.length,
    nuove: requests.filter(r => r.status === 'nuova').length,
    inProgress: requests.filter(r => r.status === 'in_lavorazione').length,
    completate: requests.filter(r => r.status === 'completata').length,
    rifiutate: requests.filter(r => r.status === 'rifiutata').length
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento profilo cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="profile-error">
        <AlertCircle size={48} />
        <h2>Cliente non trovato</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/clienti')}>
          <ArrowLeft size={16} />
          Torna ai Clienti
        </button>
      </div>
    );
  }

  return (
    <div className="client-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin/clienti')}>
          <ArrowLeft size={18} />
          Torna ai Clienti
        </button>
      </div>

      {/* Client Hero */}
      <div className="client-hero">
        <div className="client-hero-avatar">
          <User size={32} strokeWidth={2} />
        </div>
        <div className="client-hero-info">
          <h1 className="client-hero-name">
            {client.first_name} {client.last_name}
          </h1>
          <div className="client-hero-meta">
            <span className="client-hero-email">
              <Mail size={16} />
              {client.email}
            </span>
            {client.phone && (
              <span className="client-hero-phone">
                <Phone size={16} />
                {client.phone}
              </span>
            )}
            <span className="client-hero-date">
              <Calendar size={16} />
              Cliente dal {formatDate(client.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-profile">
        <div className="stat-card-profile stat-primary">
          <FileText size={24} />
          <div className="stat-content-profile">
            <span className="stat-value-profile">{stats.total}</span>
            <span className="stat-label-profile">Richieste Totali</span>
          </div>
        </div>
        <div className="stat-card-profile stat-warning">
          <AlertCircle size={24} />
          <div className="stat-content-profile">
            <span className="stat-value-profile">{stats.nuove}</span>
            <span className="stat-label-profile">Nuove</span>
          </div>
        </div>
        <div className="stat-card-profile stat-info">
          <Clock size={24} />
          <div className="stat-content-profile">
            <span className="stat-value-profile">{stats.inProgress}</span>
            <span className="stat-label-profile">In Lavorazione</span>
          </div>
        </div>
        <div className="stat-card-profile stat-success">
          <CheckCircle size={24} />
          <div className="stat-content-profile">
            <span className="stat-value-profile">{stats.completate}</span>
            <span className="stat-label-profile">Completate</span>
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div className="requests-section">
        <div className="section-header-profile">
          <h2 className="section-title-profile">Richieste del Cliente</h2>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Tutte ({stats.total})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'nuova' ? 'active' : ''}`}
              onClick={() => setStatusFilter('nuova')}
            >
              Nuove ({stats.nuove})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'in_lavorazione' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_lavorazione')}
            >
              In Corso ({stats.inProgress})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'completata' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completata')}
            >
              Completate ({stats.completate})
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <FileText size={48} strokeWidth={1} />
            <p>Nessuna richiesta trovata</p>
          </div>
        ) : (
          <div className="requests-list-profile">
            {filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className="request-card-profile"
                style={{ borderLeftColor: SERVICE_COLORS[request.service_type] || '#6b7886' }}
              >
                <div className="request-card-header">
                  <div 
                    className="service-badge-profile"
                    style={{ 
                      backgroundColor: `${SERVICE_COLORS[request.service_type]}15`,
                      color: SERVICE_COLORS[request.service_type]
                    }}
                  >
                    {SERVICE_ICONS[request.service_type]}
                    {getServiceLabel(request.service_type)}
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="request-card-body">
                  <h3 className="request-card-title">
                    Richiesta {getServiceLabel(request.service_type)}
                  </h3>
                  {request.description && (
                    <p className="request-card-description">{request.description}</p>
                  )}
                  <div className="request-card-meta">
                    <span className="request-meta-item">
                      <Calendar size={14} />
                      {formatDate(request.created_at)}
                    </span>
                    {request.priority && (
                      <span className="request-meta-item">
                        <TrendingUp size={14} />
                        Priorità: {request.priority}
                      </span>
                    )}
                  </div>
                </div>

                <div className="request-card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/admin/requests/${request.id}`)}
                  >
                    <Eye size={16} />
                    Visualizza
                  </button>
                  {request.status !== 'completata' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleMarkAsCompleted(request.id!)}
                    >
                      <CheckCircle size={16} />
                      Completata
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClientProfile;
