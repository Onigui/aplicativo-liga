// Sistema de Sincronização para Liga do Bem
import cacheService from './cacheService.js';
import analyticsService from './analyticsService.js';

class SyncService {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSync = null;
    this.syncInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    
    // Iniciar sincronização automática
    this.startAutoSync();
    
    console.log('🔄 [SYNC] Serviço de sincronização inicializado');
  }

  // Adicionar item à fila de sincronização
  addToQueue(action, data, priority = 'normal') {
    const syncItem = {
      id: Date.now() + Math.random(),
      action,
      data,
      priority,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    this.syncQueue.push(syncItem);
    
    // Ordenar por prioridade
    this.syncQueue.sort((a, b) => {
      const priorities = { high: 3, normal: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    console.log('🔄 [SYNC] Item adicionado à fila:', action, priority);
    
    // Tentar sincronizar imediatamente se for alta prioridade
    if (priority === 'high') {
      this.sync();
    }
  }

  // Sincronizar dados
  async sync() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log('🔄 [SYNC] Iniciando sincronização...');

    try {
      const itemsToSync = [...this.syncQueue];
      this.syncQueue = [];

      for (const item of itemsToSync) {
        await this.processSyncItem(item);
      }

      this.lastSync = new Date();
      this.retryAttempts = 0;
      
      analyticsService.track('sync_completed', {
        itemsProcessed: itemsToSync.length,
        timestamp: this.lastSync
      });

      console.log('🔄 [SYNC] Sincronização concluída');
    } catch (error) {
      console.error('🔄 [SYNC] Erro na sincronização:', error);
      
      // Recolocar itens na fila para retry
      this.syncQueue.unshift(...itemsToSync);
      
      this.retryAttempts++;
      if (this.retryAttempts < this.maxRetries) {
        setTimeout(() => this.sync(), 5000 * this.retryAttempts);
      }
      
      analyticsService.trackError(error, { context: 'sync_service' });
    } finally {
      this.isSyncing = false;
    }
  }

  // Processar item de sincronização
  async processSyncItem(item) {
    try {
      item.attempts++;
      
      switch (item.action) {
        case 'user_update':
          await this.syncUserData(item.data);
          break;
        case 'company_register':
          await this.syncCompanyRegistration(item.data);
          break;
        case 'donation_create':
          await this.syncDonation(item.data);
          break;
        case 'analytics_batch':
          await this.syncAnalytics(item.data);
          break;
        case 'cache_update':
          await this.syncCache(item.data);
          break;
        default:
          console.warn('🔄 [SYNC] Ação desconhecida:', item.action);
      }

      console.log('🔄 [SYNC] Item processado com sucesso:', item.action);
    } catch (error) {
      console.error('🔄 [SYNC] Erro ao processar item:', item.action, error);
      
      if (item.attempts < this.maxRetries) {
        this.syncQueue.push(item);
      } else {
        console.error('🔄 [SYNC] Item descartado após tentativas:', item.action);
        analyticsService.track('sync_item_failed', {
          action: item.action,
          attempts: item.attempts
        });
      }
    }
  }

  // Sincronizar dados do usuário
  async syncUserData(userData) {
    const response = await fetch('/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Atualizar cache local
    cacheService.set('user_data', userData);
  }

  // Sincronizar registro de empresa
  async syncCompanyRegistration(companyData) {
    const response = await fetch('/api/companies/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Limpar cache de empresas
    cacheService.clear('companies');
  }

  // Sincronizar doação
  async syncDonation(donationData) {
    const response = await fetch('/api/donations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Limpar cache de doações
    cacheService.clear('donations');
  }

  // Sincronizar analytics
  async syncAnalytics(analyticsData) {
    const response = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // Sincronizar cache
  async syncCache(cacheData) {
    // Enviar dados do cache para servidor
    const response = await fetch('/api/cache/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cacheData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // Iniciar sincronização automática
  startAutoSync() {
    // Sincronizar a cada 30 segundos
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.syncQueue.length > 0) {
        this.sync();
      }
    }, 30000);

    // Sincronizar quando voltar online
    window.addEventListener('online', () => {
      console.log('🔄 [SYNC] Conexão restaurada, iniciando sincronização...');
      this.sync();
    });
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Forçar sincronização
  forceSync() {
    console.log('🔄 [SYNC] Sincronização forçada...');
    this.sync();
  }

  // Obter status da sincronização
  getStatus() {
    return {
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSync,
      retryAttempts: this.retryAttempts,
      isOnline: navigator.onLine
    };
  }

  // Limpar fila de sincronização
  clearQueue() {
    this.syncQueue = [];
    console.log('🔄 [SYNC] Fila de sincronização limpa');
  }

  // Fazer backup dos dados
  async createBackup() {
    const backup = {
      timestamp: new Date().toISOString(),
      userData: cacheService.get('user_data'),
      companies: cacheService.get('companies'),
      donations: cacheService.get('donations'),
      analytics: analyticsService.getReport(),
      syncQueue: this.syncQueue
    };

    // Salvar no localStorage
    localStorage.setItem('liga_do_bem_backup', JSON.stringify(backup));
    
    console.log('🔄 [SYNC] Backup criado:', backup.timestamp);
    
    return backup;
  }

  // Restaurar backup
  async restoreBackup() {
    const backupData = localStorage.getItem('liga_do_bem_backup');
    if (!backupData) {
      throw new Error('Nenhum backup encontrado');
    }

    const backup = JSON.parse(backupData);
    
    // Restaurar dados do cache
    if (backup.userData) cacheService.set('user_data', backup.userData);
    if (backup.companies) cacheService.set('companies', backup.companies);
    if (backup.donations) cacheService.set('donations', backup.donations);
    
    // Restaurar fila de sincronização
    if (backup.syncQueue) this.syncQueue = backup.syncQueue;
    
    console.log('🔄 [SYNC] Backup restaurado:', backup.timestamp);
    
    return backup;
  }
}

// Instância singleton
const syncService = new SyncService();

export default syncService; 