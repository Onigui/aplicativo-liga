// Sistema de Monitoramento de Performance para Liga do Bem
import analyticsService from './analyticsService.js';

class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoads: {},
      apiCalls: {},
      userInteractions: {},
      errors: []
    };
    
    this.startTime = performance.now();
    this.observers = [];
    
    // Inicializar monitoramento
    this.initPerformanceMonitoring();
    
    console.log('⚡ [PERFORMANCE] Serviço de performance inicializado');
  }

  // Inicializar monitoramento de performance
  initPerformanceMonitoring() {
    // Monitorar carregamento de página
    this.observePageLoads();
    
    // Monitorar chamadas de API
    this.observeApiCalls();
    
    // Monitorar interações do usuário
    this.observeUserInteractions();
    
    // Monitorar erros
    this.observeErrors();
    
    // Monitorar recursos
    this.observeResources();
  }

  // Monitorar carregamento de páginas
  observePageLoads() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      this.trackPageLoad();
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = (...args) => {
      this.trackPageLoad();
      return originalReplaceState.apply(history, args);
    };
    
    // Monitorar navegação inicial
    window.addEventListener('load', () => {
      this.trackPageLoad();
    });
  }

  // Monitorar chamadas de API
  observeApiCalls() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.trackApiCall(url, duration, response.status, 'success');
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.trackApiCall(url, duration, 0, 'error', error.message);
        throw error;
      }
    };
  }

  // Monitorar interações do usuário
  observeUserInteractions() {
    const events = ['click', 'input', 'scroll', 'resize'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackUserInteraction(eventType, event.target);
      }, { passive: true });
    });
  }

  // Monitorar erros
  observeErrors() {
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', {
        reason: event.reason
      });
    });
  }

  // Monitorar recursos
  observeResources() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackResource(entry);
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  // Rastrear carregamento de página
  trackPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      url: window.location.href,
      timestamp: Date.now()
    };
    
    this.metrics.pageLoads[window.location.pathname] = metrics;
    
    // Enviar para analytics
    analyticsService.trackPerformance('page_load', metrics);
    
    console.log('⚡ [PERFORMANCE] Página carregada:', metrics);
  }

  // Rastrear chamada de API
  trackApiCall(url, duration, status, result, error = null) {
    const apiCall = {
      url,
      duration,
      status,
      result,
      error,
      timestamp: Date.now()
    };
    
    if (!this.metrics.apiCalls[url]) {
      this.metrics.apiCalls[url] = [];
    }
    
    this.metrics.apiCalls[url].push(apiCall);
    
    // Manter apenas as últimas 10 chamadas por URL
    if (this.metrics.apiCalls[url].length > 10) {
      this.metrics.apiCalls[url] = this.metrics.apiCalls[url].slice(-10);
    }
    
    // Enviar para analytics
    analyticsService.trackPerformance('api_call', apiCall);
    
    // Alertar se a chamada for muito lenta
    if (duration > 5000) {
      console.warn('⚡ [PERFORMANCE] API call lenta:', url, duration + 'ms');
    }
  }

  // Rastrear interação do usuário
  trackUserInteraction(eventType, target) {
    const interaction = {
      type: eventType,
      target: target.tagName?.toLowerCase() || 'unknown',
      className: target.className || '',
      id: target.id || '',
      timestamp: Date.now()
    };
    
    if (!this.metrics.userInteractions[eventType]) {
      this.metrics.userInteractions[eventType] = [];
    }
    
    this.metrics.userInteractions[eventType].push(interaction);
    
    // Manter apenas as últimas 50 interações por tipo
    if (this.metrics.userInteractions[eventType].length > 50) {
      this.metrics.userInteractions[eventType] = this.metrics.userInteractions[eventType].slice(-50);
    }
  }

  // Rastrear erro
  trackError(type, details) {
    const error = {
      type,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.metrics.errors.push(error);
    
    // Manter apenas os últimos 100 erros
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
    
    // Enviar para analytics
    analyticsService.trackError(new Error(type), details);
    
    console.error('⚡ [PERFORMANCE] Erro rastreado:', error);
  }

  // Rastrear recurso
  trackResource(entry) {
    if (entry.entryType === 'resource') {
      const resource = {
        name: entry.name,
        type: entry.initiatorType,
        duration: entry.duration,
        size: entry.transferSize,
        timestamp: Date.now()
      };
      
      // Alertar se o recurso for muito grande ou lento
      if (entry.duration > 3000) {
        console.warn('⚡ [PERFORMANCE] Recurso lento:', entry.name, entry.duration + 'ms');
      }
      
      if (entry.transferSize > 1024 * 1024) { // 1MB
        console.warn('⚡ [PERFORMANCE] Recurso grande:', entry.name, (entry.transferSize / 1024 / 1024).toFixed(2) + 'MB');
      }
    }
  }

  // Obter First Paint
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  // Obter First Contentful Paint
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  // Obter métricas de performance
  getMetrics() {
    const totalDuration = performance.now() - this.startTime;
    
    // Calcular médias
    const apiCallStats = this.calculateApiCallStats();
    const pageLoadStats = this.calculatePageLoadStats();
    const errorStats = this.calculateErrorStats();
    
    return {
      session: {
        totalDuration,
        startTime: this.startTime,
        currentTime: performance.now()
      },
      apiCalls: apiCallStats,
      pageLoads: pageLoadStats,
      errors: errorStats,
      userInteractions: this.metrics.userInteractions
    };
  }

  // Calcular estatísticas de chamadas de API
  calculateApiCallStats() {
    const allCalls = Object.values(this.metrics.apiCalls).flat();
    
    if (allCalls.length === 0) return { total: 0, average: 0, slowest: 0 };
    
    const durations = allCalls.map(call => call.duration);
    const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    const slowest = Math.max(...durations);
    
    return {
      total: allCalls.length,
      average: Math.round(average),
      slowest: Math.round(slowest),
      byUrl: Object.keys(this.metrics.apiCalls).map(url => ({
        url,
        count: this.metrics.apiCalls[url].length,
        average: this.metrics.apiCalls[url].reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls[url].length
      }))
    };
  }

  // Calcular estatísticas de carregamento de página
  calculatePageLoadStats() {
    const pages = Object.values(this.metrics.pageLoads);
    
    if (pages.length === 0) return { total: 0, average: 0 };
    
    const loadTimes = pages.map(page => page.loadTime);
    const average = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    
    return {
      total: pages.length,
      average: Math.round(average),
      pages: Object.keys(this.metrics.pageLoads).map(path => ({
        path,
        loadTime: this.metrics.pageLoads[path].loadTime
      }))
    };
  }

  // Calcular estatísticas de erros
  calculateErrorStats() {
    const errors = this.metrics.errors;
    
    const errorTypes = {};
    errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });
    
    return {
      total: errors.length,
      byType: errorTypes,
      recent: errors.slice(-10) // Últimos 10 erros
    };
  }

  // Gerar relatório de performance
  generateReport() {
    const metrics = this.getMetrics();
    
    return {
      summary: {
        sessionDuration: Math.round(metrics.session.totalDuration / 1000) + 's',
        totalApiCalls: metrics.apiCalls.total,
        averageApiCallTime: metrics.apiCalls.average + 'ms',
        totalPageLoads: metrics.pageLoads.total,
        averagePageLoadTime: metrics.pageLoads.average + 'ms',
        totalErrors: metrics.errors.total
      },
      details: metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  // Gerar recomendações baseadas nas métricas
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.apiCalls.average > 2000) {
      recommendations.push('Considerar otimização das chamadas de API - tempo médio muito alto');
    }
    
    if (metrics.pageLoads.average > 3000) {
      recommendations.push('Considerar otimização do carregamento de páginas - tempo médio muito alto');
    }
    
    if (metrics.errors.total > 10) {
      recommendations.push('Investigar erros frequentes - muitos erros detectados');
    }
    
    if (metrics.apiCalls.slowest > 10000) {
      recommendations.push('Investigar chamadas de API muito lentas - algumas demoram mais de 10s');
    }
    
    return recommendations;
  }

  // Limpar métricas
  clear() {
    this.metrics = {
      pageLoads: {},
      apiCalls: {},
      userInteractions: {},
      errors: []
    };
    this.startTime = performance.now();
  }
}

// Instância singleton
const performanceService = new PerformanceService();

export default performanceService; 