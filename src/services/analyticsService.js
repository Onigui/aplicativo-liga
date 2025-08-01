// Sistema de Analytics para Liga do Bem
class AnalyticsService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isOnline = navigator.onLine;
    
    // Listener para mudanças de conectividade
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Listener para mudanças de visibilidade
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    console.log('📊 [ANALYTICS] Inicializado - Session ID:', this.sessionId);
  }

  // Gerar ID único para sessão
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Rastrear evento
  track(eventName, properties = {}) {
    const event = {
      id: Date.now() + Math.random(),
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      isOnline: this.isOnline
    };

    this.events.push(event);
    console.log('📊 [ANALYTICS] Event tracked:', eventName, properties);

    // Enviar para servidor se online
    if (this.isOnline) {
      this.sendToServer(event);
    }
  }

  // Rastrear navegação de página
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page: pageName,
      referrer: document.referrer,
      ...properties
    });
  }

  // Rastrear ação do usuário
  trackUserAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties
    });
  }

  // Rastrear erro
  trackError(error, properties = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...properties
    });
  }

  // Rastrear performance
  trackPerformance(metric, value, properties = {}) {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  // Rastrear conversão
  trackConversion(type, value, properties = {}) {
    this.track('conversion', {
      type,
      value,
      ...properties
    });
  }

  // Enviar evento para servidor
  async sendToServer(event) {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('📊 [ANALYTICS] Event sent to server');
    } catch (error) {
      console.error('📊 [ANALYTICS] Failed to send event:', error);
      // Armazenar para envio posterior
      this.storeForLater(event);
    }
  }

  // Armazenar evento para envio posterior
  storeForLater(event) {
    const stored = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
    stored.push(event);
    localStorage.setItem('analytics_queue', JSON.stringify(stored));
  }

  // Enviar eventos armazenados
  async sendStoredEvents() {
    const stored = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
    if (stored.length === 0) return;

    console.log('📊 [ANALYTICS] Sending stored events:', stored.length);

    for (const event of stored) {
      await this.sendToServer(event);
    }

    localStorage.removeItem('analytics_queue');
  }

  // Handler para quando ficar online
  handleOnline() {
    this.isOnline = true;
    this.track('connection_restored');
    this.sendStoredEvents();
  }

  // Handler para quando ficar offline
  handleOffline() {
    this.isOnline = false;
    this.track('connection_lost');
  }

  // Handler para mudança de visibilidade
  handleVisibilityChange() {
    if (document.hidden) {
      this.track('page_hidden');
    } else {
      this.track('page_visible');
    }
  }

  // Obter métricas da sessão
  getSessionMetrics() {
    const duration = Date.now() - this.startTime;
    const eventCount = this.events.length;
    
    const eventTypes = {};
    this.events.forEach(event => {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      duration,
      eventCount,
      eventTypes,
      isOnline: this.isOnline
    };
  }

  // Obter relatório de analytics
  getReport() {
    const metrics = this.getSessionMetrics();
    const pages = {};
    const actions = {};
    const errors = [];

    this.events.forEach(event => {
      if (event.event === 'page_view') {
        const page = event.properties.page;
        pages[page] = (pages[page] || 0) + 1;
      } else if (event.event === 'user_action') {
        const action = event.properties.action;
        actions[action] = (actions[action] || 0) + 1;
      } else if (event.event === 'error') {
        errors.push(event);
      }
    });

    return {
      session: metrics,
      pages,
      actions,
      errors,
      totalEvents: this.events.length
    };
  }

  // Limpar dados da sessão
  clear() {
    this.events = [];
    localStorage.removeItem('analytics_queue');
  }
}

// Instância singleton
const analyticsService = new AnalyticsService();

export default analyticsService; 