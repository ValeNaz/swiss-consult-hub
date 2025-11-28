/**
 * ============================================
 * ADMIN REPORTS - REPORT E ANALISI COMPLETI
 * ============================================
 * Dashboard report con statistiche, grafici e export CSV
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Target,
  DollarSign,
  RefreshCw,
  Filter
} from 'lucide-react';
import { dashboardService } from '../services/dataService';
import type { DashboardStats, ServiceType } from '../types/admin.types';
import '../styles/AdminClients.css';

const AdminReportsEnhanced: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error: any) {
      // Gestione errore migliorata - no alert, solo log ridotto
      if (import.meta.env.DEV) {
        console.warn('Stats non disponibili:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!stats) return;

    // Prepare CSV data
    const csvRows: string[] = [];

    // Header
    csvRows.push('Report Richieste - Swiss Consult Hub');
    csvRows.push(`Generato il: ${new Date().toLocaleString('it-IT')}`);
    csvRows.push('');

    // Summary stats
    csvRows.push('STATISTICHE GENERALI');
    csvRows.push('Metrica,Valore');
    csvRows.push(`Richieste Totali,${stats.totalRequests}`);
    csvRows.push(`Richieste Nuove,${stats.newRequests}`);
    csvRows.push(`In Lavorazione,${stats.inProgressRequests}`);
    csvRows.push(`Completate,${stats.completedRequests}`);
    csvRows.push(`Clienti Totali,${stats.totalClients}`);
    csvRows.push(`Clienti Attivi,${stats.activeClients}`);
    csvRows.push(`Tasso di Conversione,${stats.conversionRate.toFixed(2)}%`);
    csvRows.push(`Richieste Recenti (30gg),${stats.recentRequestsCount}`);
    csvRows.push('');

    // Requests by service
    csvRows.push('RICHIESTE PER SERVIZIO');
    csvRows.push('Servizio,Numero Richieste');
    Object.entries(stats.requestsByService).forEach(([service, count]) => {
      csvRows.push(`${service},${count}`);
    });

    // Create and download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getServiceColor = (service: string): string => {
    const colors: Record<string, string> = {
      creditizia: '#4F46E5',
      assicurativa: '#059669',
      immobiliare: '#DC2626',
      lavorativa: '#D97706',
      legale: '#7C3AED',
      medica: '#0891B2',
      fiscale: '#DB2777'
    };
    return colors[service] || '#6B7280';
  };

  const renderBarChart = (data: Record<string, number>) => {
    const maxValue = Math.max(...Object.values(data), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                minWidth: '120px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--neutral-700)',
                textTransform: 'capitalize'
              }}
            >
              {key}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div
                style={{
                  flex: 1,
                  height: '32px',
                  background: 'var(--neutral-100)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: `${(value / maxValue) * 100}%`,
                    height: '100%',
                    background: getServiceColor(key),
                    transition: 'width 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 'var(--space-2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  {value > 0 && value}
                </div>
              </div>
              <div
                style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--primary-navy)'
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = (trend: Array<{ date: string; count: number; completed: number }>) => {
    const maxValue = Math.max(...trend.map((t) => Math.max(t.count, t.completed)), 1);
    const step = Math.max(1, Math.floor(trend.length / 7)); // Show max 7 labels

    return (
      <div style={{ padding: 'var(--space-4) 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            height: '200px',
            paddingBottom: 'var(--space-3)',
            borderBottom: '2px solid var(--neutral-200)'
          }}
        >
          {trend.map((item, idx) => (
            <div
              key={item.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px', width: '100%' }}>
                {item.count > 0 && (
                  <div
                    style={{
                      height: `${(item.count / maxValue) * 100}%`,
                      background: 'var(--primary-navy)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'height 0.5s ease'
                    }}
                    title={`Nuove: ${item.count}`}
                  />
                )}
                {item.completed > 0 && (
                  <div
                    style={{
                      height: `${(item.completed / maxValue) * 100}%`,
                      background: 'var(--service-immobiliare)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'height 0.5s ease'
                    }}
                    title={`Completate: ${item.completed}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--neutral-600)'
          }}
        >
          {trend
            .filter((_, idx) => idx % step === 0 || idx === trend.length - 1)
            .map((item) => (
              <span key={item.date}>
                {new Date(item.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
              </span>
            ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-3)',
            fontSize: 'var(--font-size-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: '16px', height: '16px', background: 'var(--primary-navy)', borderRadius: '2px' }} />
            <span>Nuove</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: '16px', height: '16px', background: 'var(--service-immobiliare)', borderRadius: '2px' }} />
            <span>Completate</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento statistiche...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state-large">
        <BarChart3 size={48} strokeWidth={1.5} />
        <h3>Errore caricamento dati</h3>
        <p>Non è stato possibile caricare le statistiche</p>
        <button className="btn-primary" onClick={loadStats}>
          <RefreshCw size={18} strokeWidth={1.5} />
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="admin-clients">
      {/* Page Header */}
      <div className="clients-header">
        <div>
          <h1 className="page-title">Report e Analisi</h1>
          <p className="page-subtitle">Statistiche dettagliate e analisi delle performance</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadStats}>
            <RefreshCw size={18} strokeWidth={1.5} />
            Aggiorna
          </button>
          <button className="btn-primary" onClick={exportToCSV}>
            <Download size={18} strokeWidth={1.5} />
            Esporta CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div className="metric-card">
          <FileText size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.totalRequests}</div>
            <div className="metric-label">Richieste Totali</div>
          </div>
        </div>

        <div className="metric-card">
          <TrendingUp size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.completedRequests}</div>
            <div className="metric-label">Completate</div>
          </div>
        </div>

        <div className="metric-card">
          <Users size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.totalClients}</div>
            <div className="metric-label">Clienti Totali</div>
          </div>
        </div>

        <div className="metric-card">
          <Target size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.conversionRate.toFixed(1)}%</div>
            <div className="metric-label">Tasso Conversione</div>
          </div>
        </div>

        <div className="metric-card">
          <Clock size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.inProgressRequests}</div>
            <div className="metric-label">In Lavorazione</div>
          </div>
        </div>

        <div className="metric-card">
          <Calendar size={32} strokeWidth={1.5} />
          <div>
            <div className="metric-value">{stats.recentRequestsCount}</div>
            <div className="metric-label">Richieste Recenti</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        {/* Requests by Service */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <BarChart3 size={24} strokeWidth={1.5} color="var(--primary-navy)" />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--primary-navy)' }}>
              Richieste per Servizio
            </h3>
          </div>
          {renderBarChart(stats.requestsByService)}
        </div>

        {/* Trend Chart - Commentato perché requestsTrend non disponibile */}
        {false && (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <TrendingUp size={24} strokeWidth={1.5} color="var(--primary-navy)" />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--primary-navy)' }}>
              Trend Ultimi 30 Giorni
            </h3>
          </div>
          {/* renderTrendChart(stats.requestsTrend) */}
        </div>
        )}

        {/* Stati Richieste */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Target size={24} strokeWidth={1.5} color="var(--primary-navy)" />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--primary-navy)' }}>
              Stato Richieste
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'rgba(5, 150, 105, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--service-immobiliare)', marginBottom: 'var(--space-1)' }}>
                {stats.completedRequests}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>Completate</div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'rgba(234, 179, 8, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: '#D97706', marginBottom: 'var(--space-1)' }}>
                {stats.inProgressRequests}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>In Lavorazione</div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-1)' }}>
                {stats.newRequests}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>Nuove</div>
            </div>
          </div>
        </div>

        {/* Recent Activities - Commentato perché dati non disponibili */}
        {false && stats.recentActivities && stats.recentActivities.length > 0 && (
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--neutral-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <Clock size={24} strokeWidth={1.5} color="var(--primary-navy)" />
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--primary-navy)' }}>
                Attività Recenti
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stats.recentActivities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  <div style={{ fontWeight: 500, color: 'var(--primary-navy)', marginBottom: 'var(--space-1)' }}>
                    {activity.description}
                  </div>
                  <div style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-size-xs)' }}>
                    {activity.timestamp instanceof Date
                      ? activity.timestamp.toLocaleString('it-IT')
                      : new Date((activity.timestamp as any).seconds * 1000).toLocaleString('it-IT')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsEnhanced;
