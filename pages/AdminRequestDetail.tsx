import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  User,
  Tag,
  Paperclip,
  Download,
  File,
  X,
  Image as ImageIcon,
  FileImage,
  Upload,
  Trash
} from 'lucide-react';
import { requestsService, clientsService, RequestWithDetails, RequestStatus, Client, Attachment } from '../services/dataService';
import { useRealTimeUpdates } from '../services/realTimeService';
import { fileUploadService } from '../services/fileUploadService';
import '../styles/AdminRequestDetail.css';
import '../styles/AdminAttachments.css';

const AdminRequestDetail: React.FC = () => {
  const { t } = useTranslation('admin');  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestWithDetails | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Hook per aggiornamenti real-time silenziosi
  const realTime = useRealTimeUpdates();

  useEffect(() => {
    loadRequestData();
  }, [id]);

  // Listener per aggiornamenti real-time SILENZIOSI
  useEffect(() => {
    if (!id) return;

    // Ascolta aggiornamenti della richiesta specifica
    const unsubscribeUpdate = realTime.onRequestUpdate((data) => {
      if (data.requestId === id && request) {
        // Aggiornamento silenzioso - nessun loading
        setRequest(prev => prev ? { ...prev, ...data.changes } : prev);
      }
    });

    return () => {
      unsubscribeUpdate();
    };
  }, [id, request, realTime]);

  const loadRequestData = async () => {
    if (!id) return;

    try {
      const requestData = await requestsService.getById(id);
      if (requestData) {
        setRequest(requestData);

        // Load client data
        if (requestData.client_email) {
          const clientData = await clientsService.findByEmail(requestData.client_email);
          setClient(clientData);
        }
      }
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!id || !request) return;

    setIsUpdating(true);
    try {
      await requestsService.update(id, { status: newStatus });
      setRequest({ ...request, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Errore nell\'aggiornamento dello stato');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Sei sicuro di voler eliminare questa richiesta? Questa azione è irreversibile.')) {
      try {
        await requestsService.delete(id);
        navigate('/admin/requests');
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Errore nell\'eliminazione della richiesta');
      }
    }
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; className: string }> = {
      nuova: { label: 'Nuova', icon: Clock, className: 'status-warning' },
      in_lavorazione: { label: 'In lavorazione', icon: FileText, className: 'status-info' },
      completata: { label: 'Completata', icon: CheckCircle, className: 'status-success' },
      rifiutata: { label: 'Rifiutata', icon: XCircle, className: 'status-error' }
    };
    return statuses[status] || statuses.nuova;
  };

  const getServiceLabel = (type: string): string => {
    const labels: Record<string, string> = {
      creditizia: 'Consulenza Creditizia',
      assicurativa: 'Consulenza Assicurativa',
      immobiliare: 'Consulenza Immobiliare',
      lavorativa: 'Consulenza Lavorativa',
      legale: 'Consulenza Legale',
      medica: 'Consulenza Medica',
      fiscale: 'Consulenza Fiscale',
      generale: 'Richiesta Generale'
    };
    return labels[type] || type;
  };

  const parseNotes = (notes: string | undefined): any => {
    if (!notes) return null;
    try {
      return JSON.parse(notes);
    } catch {
      return null;
    }
  };

  // Traduzione dei campi in italiano
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      // Dati personali
      salutation: 'Titolo',
      civilStatus: 'Stato civile',
      nationality: 'Nazionalità',
      country: 'Paese',
      telephoneType: 'Tipo telefono',
      residenceDuration: 'Durata residenza',
      ownsHome: 'Proprietario abitazione',
      
      // Dati lavorativi
      occupation: 'Situazione professionale',
      company: 'Azienda',
      employmentDuration: 'Durata impiego',
      employmentRelationship: 'Tipo contratto',
      commutingMethod: 'Mezzo di trasporto',
      
      // Dati finanziari
      monthlyIncome: 'Reddito mensile netto',
      has13thSalary: '13ª mensilità',
      hasBonus: 'Bonus',
      hasSecondaryEmployment: 'Secondo impiego',
      hasAdditionalIncome: 'Reddito aggiuntivo',
      housingCosts: 'Costi abitativi mensili',
      housingSituation: 'Situazione abitativa',
      hasChildren: 'Figli a carico',
      paysAlimony: 'Pagamento alimenti',
      hasObligations: 'Altri obblighi finanziari',
      monthlyInstalments: 'Rate mensili esistenti',
      debtEnforcements: 'Esecuzioni/Betreibung',
      
      // Dati prestito
      loanDuration: 'Durata prestito richiesto',
      monthlyPayment: 'Rata mensile desiderata',
      creditProtectionInsurance: 'Assicurazione protezione credito',
      
      // Altri servizi
      consultingType: 'Tipo consulenza',
      medicalBranch: 'Settore medico',
      insuranceType: 'Tipo assicurazione',
      insuranceCompany: 'Compagnia assicurativa',
      placeOfBirth: 'Luogo di nascita',
      canton: 'Cantone',
      annualIncome: 'Reddito annuale',
      hasCv: 'CV allegato',
      cvName: 'Nome file CV',
      hasCoverLetter: 'Lettera motivazionale',
      coverLetterName: 'Nome file lettera',
      hasIdentityDocument: 'Documento identità',
      documentName: 'Nome documento'
    };
    return labels[key] || key;
  };

  // Formattazione valori
  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-';
    
    // Boolean values
    if (typeof value === 'boolean') {
      return value ? '✓ Sì' : '✗ No';
    }
    
    // Yes/No strings
    if (value === 'yes' || value === 'si' || value === 'sì') return '✓ Sì';
    if (value === 'no') return '✗ No';
    
    // Currency fields
    if (key.includes('Income') || key.includes('Costs') || key.includes('Payment') || key.includes('Instalments')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return `CHF ${num.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    
    // Duration fields
    if (key.includes('Duration') && typeof value === 'string' && value.includes('mesi')) {
      return value;
    }
    
    return String(value);
  };

  // Organizza i dati per categoria
  const organizeAdditionalData = (data: any) => {
    if (!data) return null;
    
    const categories: Record<string, { title: string; fields: Array<{ key: string; value: any }> }> = {
      personal: { title: 'Dati Personali', fields: [] },
      employment: { title: 'Dati Lavorativi', fields: [] },
      financial: { title: 'Dati Finanziari', fields: [] },
      loan: { title: 'Dati Prestito', fields: [] },
      other: { title: 'Altre Informazioni', fields: [] }
    };
    
    const personalKeys = ['salutation', 'civilStatus', 'nationality', 'country', 'telephoneType', 'residenceDuration', 'ownsHome', 'placeOfBirth', 'canton'];
    const employmentKeys = ['occupation', 'company', 'employmentDuration', 'employmentRelationship', 'commutingMethod'];
    const financialKeys = ['monthlyIncome', 'has13thSalary', 'hasBonus', 'hasSecondaryEmployment', 'hasAdditionalIncome', 'housingCosts', 'housingSituation', 'hasChildren', 'paysAlimony', 'hasObligations', 'monthlyInstalments', 'debtEnforcements', 'annualIncome'];
    const loanKeys = ['loanDuration', 'monthlyPayment', 'creditProtectionInsurance'];
    
    Object.entries(data).forEach(([key, value]) => {
      // Skip metadata fields
      if (key === 'submittedAt' || key === 'source' || key === 'simulatorData') return;
      
      if (personalKeys.includes(key)) {
        categories.personal.fields.push({ key, value });
      } else if (employmentKeys.includes(key)) {
        categories.employment.fields.push({ key, value });
      } else if (financialKeys.includes(key)) {
        categories.financial.fields.push({ key, value });
      } else if (loanKeys.includes(key)) {
        categories.loan.fields.push({ key, value });
      } else {
        categories.other.fields.push({ key, value });
      }
    });
    
    // Remove empty categories
    return Object.entries(categories)
      .filter(([_, cat]) => cat.fields.length > 0)
      .map(([id, cat]) => ({ id, ...cat }));
  };

  const isImageFile = (type: string): boolean => {
    return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(type);
  };

  const isPdfFile = (type: string, name: string): boolean => {
    return type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (attachment: Attachment) => {
    if (isImageFile(attachment.type)) {
      return <ImageIcon size={24} />;
    } else if (isPdfFile(attachment.type, attachment.name)) {
      return <FileText size={24} />;
    } else {
      return <File size={24} />;
    }
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    if (isImageFile(attachment.type)) {
      setPreviewAttachment(attachment);
    } else {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !id) return;

    const file = event.target.files[0];
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await fileUploadService.uploadFile(
        file,
        id,
        'document',
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        // Ricarica i dati della richiesta per aggiornare gli allegati
        await loadRequestData();
        alert('File caricato con successo!');
      } else {
        alert(`Errore upload: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Errore durante l'upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!id) return;

    if (!window.confirm(`Sei sicuro di voler eliminare "${attachment.name}"?`)) {
      return;
    }

    try {
      const success = await fileUploadService.deleteFile(id, attachment.id);

      if (success) {
        // Ricarica i dati della richiesta per aggiornare gli allegati
        await loadRequestData();
        alert('Allegato eliminato con successo!');
      } else {
        alert('Errore durante l\'eliminazione dell\'allegato');
      }
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      alert(`Errore: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{t('requestDetail.loading', { defaultValue: 'Caricamento dettagli...' })}</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-error">
        <h2>{t('requestDetail.notFound', { defaultValue: 'Richiesta non trovata' })}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/requests')}>
          {t('requestDetail.backToList', { defaultValue: "← Torna all'elenco" })}
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;
  const additionalData = parseNotes(request.notes);

  return (
    <div className="request-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/requests')}>
          <ArrowLeft size={20} />
          {t('requestDetail.backToList', { defaultValue: "← Torna all'elenco" })}
        </button>

        <div className="detail-header-content">
          <div className="detail-header-left">
            <h1 className="detail-title">{t('requestDetail.title', { defaultValue: 'Dettaglio Richiesta' })} #{request.id?.slice(0, 8)}</h1>
            <div className="detail-meta">
              <span className="service-badge">
                <Tag size={14} />
                {getServiceLabel(request.service_type)}
              </span>
              <span className={`status-badge-large ${statusInfo.className}`}>
                <StatusIcon size={16} />
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            {request.status === 'nuova' && (
              <button
                className="btn btn-success"
                onClick={() => handleStatusChange('in_lavorazione' as RequestStatus)}
                disabled={isUpdating}
              >
                <CheckCircle size={18} />
                {t('requests.actions.approve', { defaultValue: 'Approva' })}
              </button>
            )}
            {request.status !== 'rifiutata' && (
              <button
                className="btn btn-warning"
                onClick={() => handleStatusChange('rifiutata' as RequestStatus)}
                disabled={isUpdating}
              >
                <XCircle size={18} />
                {t('requests.actions.reject', { defaultValue: 'Rifiuta' })}
              </button>
            )}
            {request.status === 'in_lavorazione' && (
              <button
                className="btn btn-success"
                onClick={() => handleStatusChange('completata' as RequestStatus)}
                disabled={isUpdating}
              >
                <CheckCircle size={18} />
                {t('requests.actions.complete', { defaultValue: 'Completa' })}
              </button>
            )}
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={18} />
              {t('requests.actions.delete', { defaultValue: 'Elimina' })}
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="detail-grid">
        {/* Client Info Card */}
        <div className="detail-card">
          <div className="card-header">
            <h2 className="card-title">
              <User size={20} />
              {t('requestDetail.clientInfo', { defaultValue: 'Informazioni Cliente' })}
            </h2>
          </div>
          <div className="card-content">
            <div className="info-group">
              <div className="info-label">{t('requestDetail.fullName', { defaultValue: 'Nome completo' })}</div>
              <div className="info-value">{request.client_name}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <Mail size={16} />
                {t('requestDetail.email', { defaultValue: 'Email' })}
              </div>
              <div className="info-value">
                <a href={`mailto:${request.client_email}`}>{request.client_email}</a>
              </div>
            </div>

            {request.client_phone && (
              <div className="info-group">
                <div className="info-label">
                  <Phone size={16} />
                  {t('requestDetail.phone', { defaultValue: 'Telefono' })}
                </div>
                <div className="info-value">
                  <a href={`tel:${request.client_phone}`}>{request.client_phone}</a>
                </div>
              </div>
            )}

            {client && (
              <>
                {client.address && (
                  <div className="info-group">
                    <div className="info-label">
                      <MapPin size={16} />
                      {t('requestDetail.address', { defaultValue: 'Indirizzo' })}
                    </div>
                    <div className="info-value">
                      {client.address}
                      {client.city && `, ${client.city}`}
                      {client.postal_code && ` ${client.postal_code}`}
                    </div>
                  </div>
                )}

                <div className="info-group">
                  <div className="info-label">{t('requestDetail.totalRequests', { defaultValue: 'Totale richieste' })}</div>
                  <div className="info-value">{client.total_requests || 1}</div>
                </div>

                <div className="info-group">
                  <div className="info-label">{t('requestDetail.clientStatus', { defaultValue: 'Stato cliente' })}</div>
                  <div className="info-value">
                    <span className={`client-status status-${client.status}`}>
                      {client.status === 'nuovo' ? 'Nuovo' : 'Attivo'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {client && (
            <div className="card-footer">
              <button
                className="btn-link-full"
                onClick={() => navigate(`/admin/clients/${client.id}`)}
              >
                Visualizza profilo completo cliente
              </button>
            </div>
          )}
        </div>

        {/* Request Details Card */}
        <div className="detail-card">
          <div className="card-header">
            <h2 className="card-title">
              <FileText size={20} />
              {t('requestDetail.requestInfo', { defaultValue: 'Dettagli Richiesta' })}
            </h2>
          </div>
          <div className="card-content">
            <div className="info-group">
              <div className="info-label">
                <Calendar size={16} />
                {t('requestDetail.createdAt', { defaultValue: 'Data creazione' })}
              </div>
              <div className="info-value">{formatDate(request.created_at)}</div>
            </div>

            {request.updated_at && (
              <div className="info-group">
                <div className="info-label">
                  <Clock size={16} />
                  {t('requestDetail.updatedAt', { defaultValue: 'Ultimo aggiornamento' })}
                </div>
                <div className="info-value">{formatDate(request.updated_at)}</div>
              </div>
            )}

            <div className="info-group">
              <div className="info-label">{t('requestDetail.priority', { defaultValue: 'Priorità' })}</div>
              <div className="info-value">
                <span className={`priority-badge priority-${request.priority || 'media'}`}>
                  {request.priority || 'media'}
                </span>
              </div>
            </div>

            {request.amount && (
              <div className="info-group">
                <div className="info-label">
                  <DollarSign size={16} />
                  {t('requestDetail.amount', { defaultValue: 'Importo' })}
                </div>
                <div className="info-value amount">
                  CHF {request.amount.toLocaleString('it-CH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}

            <div className="info-group">
              <div className="info-label">{t('requestDetail.description', { defaultValue: 'Descrizione' })}</div>
              <div className="info-value">{request.description || '-'}</div>
            </div>
          </div>
        </div>

        {/* Simulator Data Card - Show if available */}
        {additionalData && additionalData.simulatorData && (
          <div className="detail-card full-width">
            <div className="card-header">
              <h2 className="card-title">
                <DollarSign size={20} />
                Dati Simulazione Prestito
              </h2>
              <span className="card-badge" style={{ background: '#4caf50', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: 600 }}>
                ✓ Simulato
              </span>
            </div>
            <div className="card-content">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
                padding: '24px',
                borderRadius: '12px',
                border: '2px solid #4caf50',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '4px', fontWeight: 500 }}>Importo simulato</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1b5e20' }}>
                    CHF {additionalData.simulatorData.amount?.toLocaleString('de-CH') || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '4px', fontWeight: 500 }}>Durata</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1b5e20' }}>
                    {additionalData.simulatorData.duration || 0} mesi
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '4px', fontWeight: 500 }}>Rata mensile (min)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1b5e20' }}>
                    CHF {additionalData.simulatorData.minMonthlyPayment?.toFixed(2) || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '4px', fontWeight: 500 }}>Rata mensile (max)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1b5e20' }}>
                    CHF {additionalData.simulatorData.maxMonthlyPayment?.toFixed(2) || 0}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="info-group">
                  <div className="info-label">Tasso interesse (min - max)</div>
                  <div className="info-value">
                    {(additionalData.simulatorData.minRate * 100).toFixed(1)}% - {(additionalData.simulatorData.maxRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-label">Garanzia del credito</div>
                  <div className="info-value">
                    {additionalData.simulatorData.guarantee === 'yes' ? '✓ Sì' : '✗ No'}
                    {additionalData.simulatorData.guarantee === 'yes' && additionalData.simulatorData.guaranteeFee && (
                      <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.875rem' }}>
                        (CHF {additionalData.simulatorData.guaranteeFee.toFixed(2)}/mese)
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-label">Proprietà abitazione</div>
                  <div className="info-value">
                    {additionalData.simulatorData.property === 'yes' ? '✓ Sì' : '✗ No'}
                  </div>
                </div>
                <div className="info-group">
                  <div className="info-label">Data simulazione</div>
                  <div className="info-value">
                    {additionalData.simulatorData.simulatedAt 
                      ? new Date(additionalData.simulatorData.simulatedAt).toLocaleString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Data Card */}
        {additionalData && organizeAdditionalData(additionalData) && organizeAdditionalData(additionalData)!.length > 0 && (
          <div className="detail-card full-width">
            <div className="card-header">
              <h2 className="card-title">
                <FileText size={20} />
                Dati Richiesta
              </h2>
              <span className="card-subtitle">Informazioni dettagliate fornite dal cliente</span>
            </div>
            <div className="card-content">
              {organizeAdditionalData(additionalData)!.map((category) => (
                <div key={category.id} className="data-category">
                  <h3 className="category-title">{category.title}</h3>
                  <div className="data-grid">
                    {category.fields.map(({ key, value }) => (
                      <div key={key} className="data-item">
                        <div className="data-item-label">{getFieldLabel(key)}</div>
                        <div className="data-item-value">{formatFieldValue(key, value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Card */}
        <div className="detail-card full-width">
          <div className="card-header">
            <h2 className="card-title">
              <Paperclip size={20} />
              {t('requestDetail.attachments', { defaultValue: 'Allegati' })} ({request.attachments?.length || 0})
            </h2>
            <div className="card-actions">
              <label className="btn btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={18} />
                {t('requestDetail.uploadFile', { defaultValue: 'Carica file' })}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                  accept=".pdf,application/pdf"
                />
              </label>
            </div>
          </div>
          <div className="card-content">
            {isUploading && (
              <div className="upload-progress">
                <div className="upload-progress-bar">
                  <div
                    className="upload-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="upload-progress-text">{uploadProgress}%</span>
              </div>
            )}

            
            {request.attachments && request.attachments.length > 0 ? (
              <div className="attachments-grid">
                {request.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item-wrapper">
                    <div
                      className="attachment-item"
                      onClick={() => handleAttachmentClick(attachment)}
                    >
                      <div className="attachment-icon">
                        {getFileIcon(attachment)}
                      </div>
                      <div className="attachment-info">
                        <div className="attachment-name">{attachment.name}</div>
                        <div className="attachment-meta">
                          {attachment.document_type && (
                            <span className="attachment-type">{attachment.document_type.replace(/_/g, ' ')}</span>
                          )}
                          <span className="attachment-size">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                          <span className="attachment-date">
                            {new Date(attachment.uploaded_at).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                      <div className="attachment-actions">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon btn-download"
                          title="Scarica"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={18} />
                        </a>
                        <button
                          className="btn-icon btn-delete"
                          title="Elimina"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAttachment(attachment);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-attachments">
                <Paperclip size={48} />
                <p>{t('requestDetail.noAttachments', { defaultValue: 'Nessun allegato presente' })}</p>
                <p className="text-muted">{t('requestDetail.attachmentsHint', { defaultValue: 'Carica documenti, immagini o altri file relativi a questa richiesta' })}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="detail-card full-width">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={20} />
            Storico
          </h2>
        </div>
        <div className="card-content">
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker status-success"></div>
              <div className="timeline-content">
                <div className="timeline-title">Richiesta creata</div>
                <div className="timeline-date">{formatDate(request.created_at)}</div>
                <div className="timeline-desc">
                  Richiesta inviata dal sito web per {getServiceLabel(request.service_type)}
                </div>
              </div>
            </div>

            {request.status !== 'nuova' && (
              <div className="timeline-item">
                <div className={`timeline-marker ${statusInfo.className}`}></div>
                <div className="timeline-content">
                  <div className="timeline-title">Stato aggiornato: {statusInfo.label}</div>
                  <div className="timeline-date">
                    {request.updated_at && formatDate(request.updated_at)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewAttachment && (
        <div className="preview-modal-overlay" onClick={() => setPreviewAttachment(null)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div className="preview-modal-title">
                <FileImage size={20} />
                {previewAttachment.name}
              </div>
              <button
                className="preview-modal-close"
                onClick={() => setPreviewAttachment(null)}
                title="Chiudi"
              >
                <X size={24} />
              </button>
            </div>
            <div className="preview-modal-body">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.name}
                className="preview-image"
              />
            </div>
            <div className="preview-modal-footer">
              <div className="preview-info">
                <span>{(previewAttachment.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{new Date(previewAttachment.uploaded_at).toLocaleDateString('it-IT')}</span>
              </div>
              <a
                href={previewAttachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                download={previewAttachment.name}
              >
                <Download size={18} />
                Scarica
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestDetail;
