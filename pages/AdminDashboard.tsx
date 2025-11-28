/**
 * ============================================
 * ADMIN DASHBOARD - MINIMAL & MODERN
 * ============================================
 * Design pulito, elegante e contemporaneo
 * 100% dati reali da Firestore
 */

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';
import { dashboardService, requestsService } from '../services/dataService';
import { useRealTimeUpdates } from '../services/realTimeService';
import type { DashboardStats, Request } from '../types/admin.types';
import '../styles/AdminDashboard.css';

// Configurazione colori
import { SERVICE_COLORS, SERVICE_LABELS } from '../constants/serviceColors';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('admin');  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hook per aggiornamenti real-time
  const realTime = useRealTimeUpdates();

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  // Real-time listener per nuove richieste - limitato a 20
  useEffect(() => {
    const unsubscribe = requestsService.subscribe(
      (requests) => {
        // Aggiorna solo se ci sono richieste valide - LIMITA A 20
        if (requests && Array.isArray(requests)) {
          setRecentRequests(requests.slice(0, 20));
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Listener per aggiornamenti real-time SILENZIOSI
  useEffect(() => {
    // Ascolta refresh dashboard - SILENZIOSO
    const unsubscribeDashboard = realTime.onDashboardRefresh(() => {
      loadDashboardData(true); // true = aggiornamento silenzioso
    });

    // Ascolta aggiornamenti richieste - SILENZIOSO
    const unsubscribeRequests = realTime.onRequestUpdate(() => {
      loadDashboardData(true); // true = aggiornamento silenzioso
    });

    // Ascolta creazione richieste - SILENZIOSO
    const unsubscribeCreated = realTime.onRequestCreated(() => {
      loadDashboardData(true); // true = aggiornamento silenzioso
    });

    // Ascolta eliminazione richieste - SILENZIOSO
    const unsubscribeDeleted = realTime.onRequestDeleted(() => {
      loadDashboardData(true); // true = aggiornamento silenzioso
    });

    // Ascolta azioni bulk - SILENZIOSO
    const unsubscribeBulk = realTime.onBulkActionCompleted(() => {
      loadDashboardData(true); // true = aggiornamento silenzioso
    });

    return () => {
      unsubscribeDashboard();
      unsubscribeRequests();
      unsubscribeCreated();
      unsubscribeDeleted();
      unsubscribeBulk();
    };
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      // Solo mostra loading al primo caricamento, non per aggiornamenti silenziosi
      if (!silent) {
        setIsLoading(true);
      }
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error: any) {
      // Log ridotto - solo messaggio essenziale
      if (import.meta.env.DEV) {
        console.warn('Dashboard data non disponibile:', error.message);
      }
    } finally {
      // Solo nasconde loading se non è un aggiornamento silenzioso
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p style={{ color: '#6b7886', fontSize: '0.875rem', marginTop: '1rem' }}>
          Caricamento dashboard...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} color="#9ca8b4" />
        <p style={{ color: '#6b7886', fontSize: '0.9375rem', marginTop: '1rem' }}>
          Errore nel caricamento dei dati
        </p>
        <button onClick={handleRefresh} className="btn-primary" style={{ marginTop: '1.5rem' }}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">
            {t('dashboard.subtitle')}
            <span className="last-update"> • {t('dashboard.lastUpdate')}</span>
          </p>
        </div>

        <div className="dashboard-actions">
          <select
            className="period-selector"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
          >
            <option value="week">{t('dashboard.period.week')}</option>
            <option value="month">{t('dashboard.period.month')}</option>
            <option value="year">{t('dashboard.period.year')}</option>
          </select>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-header">
            <span className="stat-title">{t('dashboard.stats.totalRequests', { defaultValue: 'Richieste Totali' })}</span>
            <div className="stat-icon">
              <FileText size={20} strokeWidth={1.5} />
            </div>
          </div>
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-footer">
            <span className="stat-label">{t('dashboard.stats.allRequests', { defaultValue: 'Tutte le richieste' })}</span>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-header">
            <span className="stat-title">{t('dashboard.stats.newRequests', { defaultValue: 'Nuove Richieste' })}</span>
            <div className="stat-icon">
              <AlertCircle size={20} strokeWidth={1.5} />
            </div>
          </div>
          <div className="stat-value">{stats.newRequests}</div>
          <div className="stat-footer">
            <span className="stat-label">{t('dashboard.stats.toManage', { defaultValue: 'Da gestire' })}</span>
            {stats.newRequests > 0 && (
              <span className="stat-badge badge-urgent">{stats.newRequests} in attesa</span>
            )}
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-header">
            <span className="stat-title">{t('dashboard.stats.inProgress', { defaultValue: 'In Lavorazione' })}</span>
            <div className="stat-icon">
              <Clock size={20} strokeWidth={1.5} />
            </div>
          </div>
          <div className="stat-value">{stats.inProgressRequests}</div>
          <div className="stat-footer">
            <span className="stat-label">{t('dashboard.stats.inProgressDesc', { defaultValue: 'In corso di gestione' })}</span>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-header">
            <span className="stat-title">{t('dashboard.stats.completed', { defaultValue: 'Completate' })}</span>
            <div className="stat-icon">
              <CheckCircle size={20} strokeWidth={1.5} />
            </div>
          </div>
          <div className="stat-value">{stats.completedRequests}</div>
          <div className="stat-footer">
            <span className="stat-label">{t('dashboard.stats.rate', { rate: stats.conversionRate.toFixed(1), defaultValue: `Tasso: ${stats.conversionRate.toFixed(1)}%` })}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Richieste per Servizio */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.cards.requestsByService', { defaultValue: 'Richieste per Servizio' })}</h2>
            <span className="card-badge">
              {t('dashboard.cards.servicesCount', { count: Object.keys(stats.requestsByService).length, defaultValue: `${Object.keys(stats.requestsByService).length} servizi` })}
            </span>
          </div>
          <div className="card-content">
            {Object.keys(stats.requestsByService).length === 0 ? (
              <div className="empty-state">
                <FileText size={48} strokeWidth={1} />
                <p>{t('dashboard.cards.noRequests', { defaultValue: 'Nessuna richiesta al momento' })}</p>
              </div>
            ) : (
              <div className="services-chart">
                {Object.entries(stats.requestsByService)
                  .sort(([, a], [, b]) => Number(b) - Number(a))
                  .map(([service, count]) => {
                    const percentage = (Number(count) / Number(stats.totalRequests)) * 100;
                    const color = SERVICE_COLORS[service] || '#6b7886';

                    return (
                      <div key={service} className="service-bar-item">
                        <div className="service-bar-header">
                          <span className="service-name">
                            <span
                              className="service-dot"
                              style={{ backgroundColor: color }}
                            />
                            {SERVICE_LABELS[service] || service}
                          </span>
                          <span className="service-count">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="service-bar-track">
                          <div
                            className="service-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Grafico Statistiche Interattivo */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.cards.requestsTrend', { defaultValue: 'Andamento Richieste' })}</h2>
            <span className="card-badge">{t('dashboard.cards.last30Days', { defaultValue: 'Ultimi 30 giorni' })}</span>
          </div>
          <div className="card-content">
            <div className="stats-chart-visual">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: `${stats.totalRequests > 0 ? (Number(stats.newRequests) / Number(stats.totalRequests)) * 100 : 0}%` }}>
                  <div className="chart-bar-fill chart-bar-warning">
                    <span className="chart-bar-label">{stats.newRequests}</span>
                  </div>
                  <span className="chart-bar-title">{t('dashboard.chart.new', { defaultValue: 'Nuove' })}</span>
                </div>
                <div className="chart-bar" style={{ height: `${stats.totalRequests > 0 ? (Number(stats.inProgressRequests) / Number(stats.totalRequests)) * 100 : 0}%` }}>
                  <div className="chart-bar-fill chart-bar-info">
                    <span className="chart-bar-label">{stats.inProgressRequests}</span>
                  </div>
                  <span className="chart-bar-title">{t('dashboard.chart.inProgress', { defaultValue: 'In Corso' })}</span>
                </div>
                <div className="chart-bar" style={{ height: `${stats.totalRequests > 0 ? (Number(stats.completedRequests) / Number(stats.totalRequests)) * 100 : 0}%` }}>
                  <div className="chart-bar-fill chart-bar-success">
                    <span className="chart-bar-label">{stats.completedRequests}</span>
                  </div>
                  <span className="chart-bar-title">{t('dashboard.chart.completed', { defaultValue: 'Completate' })}</span>
                </div>
              </div>
              <div className="chart-summary">
                <div className="chart-stat">
                  <span className="chart-stat-value">{stats.conversionRate.toFixed(1)}%</span>
                  <span className="chart-stat-label">{t('dashboard.cards.successRate', { defaultValue: 'Tasso Successo' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metriche Performance */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.cards.keyMetrics', { defaultValue: 'Metriche Chiave' })}</h2>
            <TrendingUp size={20} strokeWidth={1.5} className="card-icon" />
          </div>
          <div className="card-content">
            <div className="metrics-grid">
              <div className="metric-box">
                <Users size={24} strokeWidth={1.5} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">{t('dashboard.cards.totalClients', { defaultValue: 'Totale Clienti' })}</span>
                  <span className="metric-value">{stats.totalClients}</span>
                  <span className="metric-sublabel">{t('dashboard.cards.activeClients', { count: stats.activeClients, defaultValue: `${stats.activeClients} attivi` })}</span>
                </div>
              </div>

              <div className="metric-box">
                <Clock size={24} strokeWidth={1.5} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">{t('dashboard.stats.inProgress', { defaultValue: 'In Lavorazione' })}</span>
                  <span className="metric-value">{stats.inProgressRequests}</span>
                  <span className="metric-sublabel">{t('dashboard.cards.activeRequests', { defaultValue: 'Richieste attive' })}</span>
                </div>
              </div>

              <div className="metric-box">
                <CheckCircle size={24} strokeWidth={1.5} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">{t('dashboard.stats.completed', { defaultValue: 'Completate' })}</span>
                  <span className="metric-value">{stats.completedRequests}</span>
                  <span className="metric-sublabel">{t('dashboard.cards.closedRequests', { defaultValue: 'Richieste chiuse' })}</span>
                </div>
              </div>

              <div className="metric-box">
                <Activity size={24} strokeWidth={1.5} className="metric-icon" />
                <div className="metric-content">
                  <span className="metric-label">{t('dashboard.cards.successRate', { defaultValue: 'Tasso Successo' })}</span>
                  <span className="metric-value metric-value-success">
                    {stats.conversionRate.toFixed(1)}%
                  </span>
                  <span className="metric-sublabel">Conversion rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultime Richieste */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.cards.recentRequests', { defaultValue: 'Ultime Richieste' })}</h2>
            <button
              className="btn-link"
              onClick={() => navigate('/admin/requests')}
            >
              {t('dashboard.cards.viewAll', { defaultValue: 'Vedi tutte →' })}
            </button>
          </div>
          <div className="card-content">
            {recentRequests.length === 0 ? (
              <div className="empty-state">
                <Activity size={48} strokeWidth={1} />
                <p>{t('dashboard.cards.noRecentRequests', { defaultValue: 'Nessuna richiesta recente' })}</p>
              </div>
            ) : (
              <div className="recent-requests-list">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="recent-request-item"
                    onClick={() => navigate(`/admin/requests/${request.id}`)}
                  >
                    <div className="request-icon-wrapper">
                      <div
                        className="request-icon"
                        style={{
                          backgroundColor: `${SERVICE_COLORS[request.service_type]}15`,
                          color: SERVICE_COLORS[request.service_type]
                        }}
                      >
                        <FileText size={18} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="request-title">
                        {SERVICE_LABELS[request.service_type] || request.service_type}
                      </div>
                      <div className="request-meta">
                        {request.description ? request.description.substring(0, 60) : 'Nessuna descrizione'}
                        {request.description && request.description.length > 60 && '...'}
                      </div>
                    </div>

                    <div className="request-status-wrapper">
                      <span className={`status-badge status-${request.status}`}>
                        {request.status === 'nuova' && 'Nuova'}
                        {request.status === 'in_lavorazione' && 'In Lavorazione'}
                        {request.status === 'completata' && 'Completata'}
                        {request.status === 'archiviata' && 'Archiviata'}
                      </span>
                      <span className="request-time">
                        {formatTimeAgo(request.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stati Richieste - Interattivo */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard.cards.requestStatus', { defaultValue: 'Stato Richieste' })}</h2>
            <span className="card-badge">{t('dashboard.cards.realTime', { defaultValue: 'Real-time' })}</span>
          </div>
          <div className="card-content">
            <div className="status-grid-interactive">
              <div 
                className="status-box status-box-warning"
                onClick={() => navigate('/admin/requests?status=nuova')}
              >
                <div className="status-icon-wrapper">
                  <AlertCircle size={28} strokeWidth={2} />
                </div>
                <div className="status-content">
                  <span className="status-value">{stats.newRequests}</span>
                  <span className="status-label">{t('dashboard.chart.new', { defaultValue: 'Nuove' })}</span>
                  <span className="status-sublabel">{t('dashboard.stats.toManage', { defaultValue: 'Da gestire' })}</span>
                </div>
                <div className="status-action">→</div>
              </div>

              <div 
                className="status-box status-box-info"
                onClick={() => navigate('/admin/requests?status=in_lavorazione')}
              >
                <div className="status-icon-wrapper">
                  <Clock size={28} strokeWidth={2} />
                </div>
                <div className="status-content">
                  <span className="status-value">{stats.inProgressRequests}</span>
                  <span className="status-label">{t('dashboard.stats.inProgress', { defaultValue: 'In Lavorazione' })}</span>
                  <span className="status-sublabel">{t('dashboard.cards.active', { defaultValue: 'Attive' })}</span>
                </div>
                <div className="status-action">→</div>
              </div>

              <div 
                className="status-box status-box-success"
                onClick={() => navigate('/admin/requests?status=completata')}
              >
                <div className="status-icon-wrapper">
                  <CheckCircle size={28} strokeWidth={2} />
                </div>
                <div className="status-content">
                  <span className="status-value">{stats.completedRequests}</span>
                  <span className="status-label">{t('dashboard.stats.completed', { defaultValue: 'Completate' })}</span>
                  <span className="status-sublabel">{t('dashboard.stats.rate', { rate: stats.conversionRate.toFixed(0), defaultValue: `${stats.conversionRate.toFixed(0)}% tasso` })}</span>
                </div>
                <div className="status-action">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: formatta tempo relativo
function formatTimeAgo(date: Date | any): string {
  const now = new Date();
  const createdAt = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ora';
  if (diffMins < 60) return `${diffMins}m fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `${diffDays}g fa`;
  return createdAt.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default AdminDashboard;
