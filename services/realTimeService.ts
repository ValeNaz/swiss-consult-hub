/**
 * ============================================
 * REAL-TIME SERVICE - EVENT SYSTEM
 * ============================================
 * Sistema centralizzato per aggiornamenti in tempo reale
 * Gestisce eventi e notifiche tra componenti
 */

type EventType = 
  | 'request_created'
  | 'request_updated' 
  | 'request_deleted'
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'dashboard_refresh'
  | 'bulk_action_completed';

type EventData = {
  request_created: { requestId: string; request: any };
  request_updated: { requestId: string; changes: any; request?: any };
  request_deleted: { requestId: string };
  client_created: { clientId: string; client: any };
  client_updated: { clientId: string; changes: any; client?: any };
  client_deleted: { clientId: string };
  dashboard_refresh: { timestamp: number };
  bulk_action_completed: { action: string; count: number; ids: string[] };
};

type EventCallback<T extends EventType> = (data: EventData[T]) => void;

class RealTimeService {
  private listeners: Map<EventType, Set<EventCallback<any>>> = new Map();
  private isPolling = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastUpdate = Date.now();
  
  // Registra un listener per un tipo di evento
  on<T extends EventType>(event: T, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Avvia il polling se non è già attivo
    this.startPolling();
    
    // Ritorna funzione per rimuovere il listener
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        
        // Se non ci sono più listener, ferma il polling
        if (this.getTotalListeners() === 0) {
          this.stopPolling();
        }
      }
    };
  }
  
  // Emette un evento a tutti i listener
  emit<T extends EventType>(event: T, data: EventData[T]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Errore nel listener per evento ${event}:`, error);
        }
      });
    }
    
    // Aggiorna timestamp ultimo evento
    this.lastUpdate = Date.now();
  }
  
  // Conta il numero totale di listener attivi
  private getTotalListeners(): number {
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }
  
  // Avvia il polling intelligente SILENZIOSO
  private startPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Polling ogni 15 secondi per aggiornamenti silenziosi
    this.pollInterval = setInterval(() => {
      this.checkForUpdates();
    }, 15000);
    
    // Nessun log per mantenere silenzioso
  }
  
  // Ferma il polling
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    this.isPolling = false;
    // Nessun log per mantenere silenzioso
  }
  
  // Controlla se ci sono aggiornamenti dal server
  private async checkForUpdates(): Promise<void> {
    try {
      // Qui potresti implementare una chiamata API per controllare gli aggiornamenti
      // Per ora emettiamo un evento di refresh dashboard periodico
      if (this.listeners.has('dashboard_refresh')) {
        this.emit('dashboard_refresh', { timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Errore nel controllo aggiornamenti:', error);
    }
  }
  
  // Metodi di utilità per azioni comuni
  
  // Notifica aggiornamento richiesta
  notifyRequestUpdate(requestId: string, changes: any, fullRequest?: any): void {
    this.emit('request_updated', { 
      requestId, 
      changes, 
      request: fullRequest 
    });
    
    // Notifica anche refresh dashboard
    this.emit('dashboard_refresh', { timestamp: Date.now() });
  }
  
  // Notifica creazione richiesta
  notifyRequestCreated(requestId: string, request: any): void {
    this.emit('request_created', { requestId, request });
    this.emit('dashboard_refresh', { timestamp: Date.now() });
  }
  
  // Notifica eliminazione richiesta
  notifyRequestDeleted(requestId: string): void {
    this.emit('request_deleted', { requestId });
    this.emit('dashboard_refresh', { timestamp: Date.now() });
  }
  
  // Notifica azione bulk completata
  notifyBulkActionCompleted(action: string, count: number, ids: string[]): void {
    this.emit('bulk_action_completed', { action, count, ids });
    this.emit('dashboard_refresh', { timestamp: Date.now() });
  }
  
  // Notifica aggiornamento cliente
  notifyClientUpdate(clientId: string, changes: any, fullClient?: any): void {
    this.emit('client_updated', { 
      clientId, 
      changes, 
      client: fullClient 
    });
  }
  
  // Forza refresh di tutti i componenti
  forceRefresh(): void {
    this.emit('dashboard_refresh', { timestamp: Date.now() });
  }
  
  // Ottieni statistiche del servizio
  getStats() {
    return {
      isPolling: this.isPolling,
      totalListeners: this.getTotalListeners(),
      lastUpdate: this.lastUpdate,
      eventTypes: Array.from(this.listeners.keys())
    };
  }
}

// Istanza singleton
export const realTimeService = new RealTimeService();

// Hook React per utilizzare il servizio
export function useRealTimeUpdates() {
  return {
    // Ascolta aggiornamenti richieste
    onRequestUpdate: (callback: (data: EventData['request_updated']) => void) => 
      realTimeService.on('request_updated', callback),
    
    // Ascolta creazione richieste
    onRequestCreated: (callback: (data: EventData['request_created']) => void) => 
      realTimeService.on('request_created', callback),
    
    // Ascolta eliminazione richieste
    onRequestDeleted: (callback: (data: EventData['request_deleted']) => void) => 
      realTimeService.on('request_deleted', callback),
    
    // Ascolta refresh dashboard
    onDashboardRefresh: (callback: (data: EventData['dashboard_refresh']) => void) => 
      realTimeService.on('dashboard_refresh', callback),
    
    // Ascolta azioni bulk
    onBulkActionCompleted: (callback: (data: EventData['bulk_action_completed']) => void) => 
      realTimeService.on('bulk_action_completed', callback),
    
    // Ascolta aggiornamenti clienti
    onClientUpdate: (callback: (data: EventData['client_updated']) => void) => 
      realTimeService.on('client_updated', callback),
    
    // Metodi per notificare eventi
    notifyRequestUpdate: realTimeService.notifyRequestUpdate.bind(realTimeService),
    notifyRequestCreated: realTimeService.notifyRequestCreated.bind(realTimeService),
    notifyRequestDeleted: realTimeService.notifyRequestDeleted.bind(realTimeService),
    notifyBulkActionCompleted: realTimeService.notifyBulkActionCompleted.bind(realTimeService),
    notifyClientUpdate: realTimeService.notifyClientUpdate.bind(realTimeService),
    forceRefresh: realTimeService.forceRefresh.bind(realTimeService),
    
    // Statistiche
    getStats: realTimeService.getStats.bind(realTimeService)
  };
}

export default realTimeService;
