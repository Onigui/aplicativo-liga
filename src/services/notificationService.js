// Sistema Avançado de Notificações Push para Liga do Bem
import analyticsService from './analyticsService.js';
import cacheService from './cacheService.js';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.subscriptions = new Map();
    this.notificationQueue = [];
    this.scheduledNotifications = new Map();
    this.categories = {
      payment: {
        title: '💳 Pagamentos',
        icon: '💳',
        color: 'bg-blue-500'
      },
      subscription: {
        title: '📅 Assinatura',
        icon: '📅',
        color: 'bg-green-500'
      },
      donation: {
        title: '❤️ Doações',
        icon: '❤️',
        color: 'bg-pink-500'
      },
      partner: {
        title: '🏢 Parceiros',
        icon: '🏢',
        color: 'bg-purple-500'
      },
      adoption: {
        title: '🐾 Adoção',
        icon: '🐾',
        color: 'bg-orange-500'
      },
      general: {
        title: '📢 Geral',
        icon: '📢',
        color: 'bg-gray-500'
      }
    };
  }

  async init() {
    await this.requestPermission();
    this.loadSubscriptions();
    this.startNotificationWorker();
    this.loadScheduledNotifications();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações push');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        this.registerServiceWorker();
        analyticsService.track('notification_permission_granted');
      } else {
        analyticsService.track('notification_permission_denied');
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        
        // Configurar push manager
        if ('PushManager' in window) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
          });
          
          this.subscriptions.set('default', subscription);
          this.saveSubscriptions();
        }
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendNotification(notification) {
    const {
      title,
      message,
      category = 'general',
      icon = '/logo192.png',
      badge = '/logo192.png',
      image,
      data = {},
      requireInteraction = false,
      silent = false,
      tag = null,
      renotify = true,
      actions = [],
      priority = 'normal'
    } = notification;

    if (this.permission !== 'granted') {
      this.addToQueue(notification);
      return false;
    }

    try {
      const notificationOptions = {
        body: message,
        icon,
        badge,
        image,
        data: {
          ...data,
          category,
          timestamp: Date.now(),
          source: 'liga-do-bem'
        },
        requireInteraction,
        silent,
        tag,
        renotify,
        actions,
        priority
      };

      const notificationInstance = new Notification(title, notificationOptions);
      
      // Event listeners
      notificationInstance.onclick = (event) => {
        this.handleNotificationClick(event, notification);
      };

      notificationInstance.onclose = (event) => {
        this.handleNotificationClose(event, notification);
      };

      // Analytics
      analyticsService.track('notification_sent', {
        category,
        title,
        priority,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      this.addToQueue(notification);
      return false;
    }
  }

  async sendCategoryNotification(category, title, message, options = {}) {
    const categoryConfig = this.categories[category] || this.categories.general;
    
    const notification = {
      title: `${categoryConfig.icon} ${title}`,
      message,
      category,
      ...options
    };

    return this.sendNotification(notification);
  }

  async sendPaymentNotification(type, amount, status) {
    const notifications = {
      subscription: {
        title: 'Assinatura Processada',
        message: `Sua assinatura de R$ ${amount} foi processada com sucesso!`,
        category: 'subscription'
      },
      donation: {
        title: 'Doação Recebida',
        message: `Obrigado pela sua doação de R$ ${amount}!`,
        category: 'donation'
      },
      payment_failed: {
        title: 'Pagamento Falhou',
        message: 'Houve um problema com seu pagamento. Tente novamente.',
        category: 'payment'
      },
      payment_success: {
        title: 'Pagamento Confirmado',
        message: `Pagamento de R$ ${amount} confirmado com sucesso!`,
        category: 'payment'
      }
    };

    const notification = notifications[type] || notifications.payment_success;
    return this.sendCategoryNotification(notification.category, notification.title, notification.message);
  }

  async sendSubscriptionReminder(daysRemaining) {
    const messages = {
      7: 'Sua assinatura expira em 7 dias. Renove agora para manter seus benefícios!',
      3: 'Sua assinatura expira em 3 dias. Não perca seus benefícios!',
      1: 'Sua assinatura expira amanhã! Renove agora para continuar usando o app.'
    };

    const message = messages[daysRemaining] || `Sua assinatura expira em ${daysRemaining} dias.`;
    
    return this.sendCategoryNotification('subscription', 'Renovação de Assinatura', message, {
      requireInteraction: true,
      actions: [
        {
          action: 'renew',
          title: 'Renovar Agora'
        },
        {
          action: 'dismiss',
          title: 'Lembrar Depois'
        }
      ]
    });
  }

  async sendPartnerNotification(partnerName, discount) {
    return this.sendCategoryNotification('partner', 'Novo Desconto Disponível', 
      `${partnerName} está oferecendo ${discount}% de desconto para membros da Liga do Bem!`, {
      image: '/partner-notification.jpg',
      requireInteraction: false
    });
  }

  async sendAdoptionNotification(animalName, status) {
    const messages = {
      available: `${animalName} está disponível para adoção!`,
      adopted: `${animalName} foi adotado com sucesso!`,
      urgent: `${animalName} precisa de um lar urgente!`
    };

    const message = messages[status] || messages.available;
    
    return this.sendCategoryNotification('adoption', 'Atualização de Adoção', message, {
      requireInteraction: status === 'urgent',
      priority: status === 'urgent' ? 'high' : 'normal'
    });
  }

  scheduleNotification(notification, delay) {
    const scheduledTime = Date.now() + delay;
    const notificationId = `scheduled_${Date.now()}_${Math.random()}`;
    
    this.scheduledNotifications.set(notificationId, {
      notification,
      scheduledTime,
      id: notificationId
    });

    this.saveScheduledNotifications();
    
    // Agendar execução
    setTimeout(() => {
      this.executeScheduledNotification(notificationId);
    }, delay);

    return notificationId;
  }

  async executeScheduledNotification(notificationId) {
    const scheduled = this.scheduledNotifications.get(notificationId);
    if (scheduled) {
      await this.sendNotification(scheduled.notification);
      this.scheduledNotifications.delete(notificationId);
      this.saveScheduledNotifications();
    }
  }

  cancelScheduledNotification(notificationId) {
    if (this.scheduledNotifications.has(notificationId)) {
      this.scheduledNotifications.delete(notificationId);
      this.saveScheduledNotifications();
      return true;
    }
    return false;
  }

  addToQueue(notification) {
    this.notificationQueue.push({
      ...notification,
      timestamp: Date.now()
    });
    this.saveQueue();
  }

  async processQueue() {
    if (this.permission === 'granted' && this.notificationQueue.length > 0) {
      const notifications = [...this.notificationQueue];
      this.notificationQueue = [];
      this.saveQueue();

      for (const notification of notifications) {
        await this.sendNotification(notification);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre notificações
      }
    }
  }

  startNotificationWorker() {
    // Processar fila a cada 30 segundos
    setInterval(() => {
      this.processQueue();
    }, 30000);

    // Verificar permissão a cada 5 minutos
    setInterval(() => {
      if (this.permission !== 'granted') {
        this.requestPermission();
      }
    }, 300000);
  }

  handleNotificationClick(event, notification) {
    // Fechar notificação
    event.notification.close();

    // Analytics
    analyticsService.track('notification_clicked', {
      category: notification.category,
      title: notification.title,
      timestamp: Date.now()
    });

    // Ações específicas
    if (notification.data?.action) {
      this.handleNotificationAction(notification.data.action, notification);
    }

    // Focar na janela do app
    if (window.focus) {
      window.focus();
    }
  }

  handleNotificationClose(event, notification) {
    analyticsService.track('notification_closed', {
      category: notification.category,
      title: notification.title,
      timestamp: Date.now()
    });
  }

  handleNotificationAction(action, notification) {
    switch (action) {
      case 'renew':
        // Abrir página de renovação
        window.location.href = '/subscription';
        break;
      case 'donate':
        // Abrir página de doação
        window.location.href = '/donations';
        break;
      case 'partners':
        // Abrir página de parceiros
        window.location.href = '/partners';
        break;
      default:
        console.log('Ação de notificação não implementada:', action);
    }
  }

  // Persistência
  saveSubscriptions() {
    const subscriptions = {};
    this.subscriptions.forEach((value, key) => {
      subscriptions[key] = value.toJSON();
    });
    localStorage.setItem('notification_subscriptions', JSON.stringify(subscriptions));
  }

  loadSubscriptions() {
    try {
      const saved = localStorage.getItem('notification_subscriptions');
      if (saved) {
        const subscriptions = JSON.parse(saved);
        Object.entries(subscriptions).forEach(([key, value]) => {
          this.subscriptions.set(key, value);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    }
  }

  saveQueue() {
    localStorage.setItem('notification_queue', JSON.stringify(this.notificationQueue));
  }

  loadQueue() {
    try {
      const saved = localStorage.getItem('notification_queue');
      if (saved) {
        this.notificationQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar fila de notificações:', error);
    }
  }

  saveScheduledNotifications() {
    const scheduled = {};
    this.scheduledNotifications.forEach((value, key) => {
      scheduled[key] = value;
    });
    localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
  }

  loadScheduledNotifications() {
    try {
      const saved = localStorage.getItem('scheduled_notifications');
      if (saved) {
        const scheduled = JSON.parse(saved);
        Object.entries(scheduled).forEach(([key, value]) => {
          const delay = value.scheduledTime - Date.now();
          if (delay > 0) {
            this.scheduledNotifications.set(key, value);
            setTimeout(() => {
              this.executeScheduledNotification(key);
            }, delay);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar notificações agendadas:', error);
    }
  }

  // Estatísticas
  getStats() {
    return {
      permission: this.permission,
      queueLength: this.notificationQueue.length,
      scheduledCount: this.scheduledNotifications.size,
      subscriptionsCount: this.subscriptions.size
    };
  }

  // Limpeza
  clearQueue() {
    this.notificationQueue = [];
    this.saveQueue();
  }

  clearScheduled() {
    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();
  }

  clearAll() {
    this.clearQueue();
    this.clearScheduled();
    this.subscriptions.clear();
    this.saveSubscriptions();
  }
}

const notificationService = new NotificationService();
export default notificationService; 