// Sistema de Pagamentos Completo para Liga do Bem
import analyticsService from './analyticsService.js';
import cacheService from './cacheService.js';
import syncService from './syncService.js';

class PaymentService {
  constructor() {
    this.paymentMethods = {
      pix: {
        name: 'PIX',
        icon: '💳',
        description: 'Pagamento instantâneo via PIX',
        enabled: true
      },
      creditCard: {
        name: 'Cartão de Crédito',
        icon: '💳',
        description: 'Visa, Mastercard, Elo, etc.',
        enabled: true
      },
      debitCard: {
        name: 'Cartão de Débito',
        icon: '💳',
        description: 'Débito automático em conta',
        enabled: true
      },
      bankTransfer: {
        name: 'Transferência Bancária',
        icon: '🏦',
        description: 'Transferência direta para conta',
        enabled: true
      },
      boleto: {
        name: 'Boleto Bancário',
        icon: '📄',
        description: 'Boleto com vencimento',
        enabled: true
      }
    };

    this.subscriptionPlans = {
      monthly: {
        id: 'monthly',
        name: 'Mensal',
        price: 29.90,
        period: 'month',
        benefits: [
          'Acesso completo ao aplicativo',
          'Carteirinha digital',
          'Descontos em empresas parceiras',
          'Participação em eventos exclusivos',
          'Suporte prioritário'
        ]
      },
      quarterly: {
        id: 'quarterly',
        name: 'Trimestral',
        price: 79.90,
        period: 'quarter',
        discount: 10,
        benefits: [
          'Todos os benefícios mensais',
          '10% de desconto',
          'Eventos especiais trimestrais'
        ]
      },
      yearly: {
        id: 'yearly',
        name: 'Anual',
        price: 299.90,
        period: 'year',
        discount: 17,
        benefits: [
          'Todos os benefícios mensais',
          '17% de desconto',
          'Eventos exclusivos anuais',
          'Carteirinha premium'
        ]
      }
    };

    this.donationCategories = [
      { id: 'general', name: 'Doação Geral', description: 'Para uso geral da ONG' },
      { id: 'medical', name: 'Tratamento Médico', description: 'Para tratamentos veterinários' },
      { id: 'food', name: 'Alimentação', description: 'Para compra de ração e alimentos' },
      { id: 'shelter', name: 'Abrigo', description: 'Para manutenção dos abrigos' },
      { id: 'events', name: 'Eventos', description: 'Para organização de eventos' },
      { id: 'education', name: 'Educação', description: 'Para campanhas educativas' }
    ];

    console.log('💳 [PAYMENT] Serviço de pagamentos inicializado');
  }

  // Obter métodos de pagamento disponíveis
  getAvailablePaymentMethods() {
    return Object.entries(this.paymentMethods)
      .filter(([key, method]) => method.enabled)
      .map(([key, method]) => ({ id: key, ...method }));
  }

  // Obter planos de assinatura
  getSubscriptionPlans() {
    return Object.values(this.subscriptionPlans);
  }

  // Obter categorias de doação
  getDonationCategories() {
    return this.donationCategories;
  }

  // Processar pagamento de mensalidade
  async processSubscriptionPayment(planId, paymentMethod, userData, cardData = null) {
    try {
      const plan = this.subscriptionPlans[planId];
      if (!plan) {
        throw new Error('Plano de assinatura não encontrado');
      }

      const payment = {
        id: this.generatePaymentId(),
        type: 'subscription',
        planId,
        planName: plan.name,
        amount: plan.price,
        paymentMethod,
        userData,
        cardData,
        status: 'pending',
        timestamp: new Date().toISOString(),
        recurring: true
      };

      // Processar pagamento baseado no método
      const result = await this.processPaymentByMethod(payment, paymentMethod, cardData);

      if (result.success) {
        payment.status = 'completed';
        payment.transactionId = result.transactionId;
        
        // Salvar no histórico
        await this.savePaymentToHistory(payment);
        
        // Sincronizar com servidor
        syncService.addToQueue('payment_processed', payment, 'high');
        
        // Rastrear analytics
        analyticsService.trackConversion('subscription_payment', {
          planId,
          amount: plan.price,
          paymentMethod,
          userId: userData.id
        });

        return {
          success: true,
          payment,
          message: 'Pagamento processado com sucesso!'
        };
      } else {
        payment.status = 'failed';
        payment.error = result.error;
        
        // Salvar tentativa falhada
        await this.savePaymentToHistory(payment);
        
        return {
          success: false,
          error: result.error,
          payment
        };
      }
    } catch (error) {
      console.error('💳 [PAYMENT] Erro ao processar pagamento:', error);
      analyticsService.trackError(error, { context: 'subscription_payment' });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar doação
  async processDonationPayment(donationData, paymentMethod, userData, cardData = null) {
    try {
      const payment = {
        id: this.generatePaymentId(),
        type: 'donation',
        category: donationData.category,
        categoryName: this.getDonationCategoryName(donationData.category),
        amount: donationData.amount,
        message: donationData.message || '',
        paymentMethod,
        userData,
        cardData,
        status: 'pending',
        timestamp: new Date().toISOString(),
        recurring: donationData.recurring || false
      };

      // Processar pagamento baseado no método
      const result = await this.processPaymentByMethod(payment, paymentMethod, cardData);

      if (result.success) {
        payment.status = 'completed';
        payment.transactionId = result.transactionId;
        
        // Salvar no histórico
        await this.savePaymentToHistory(payment);
        
        // Sincronizar com servidor
        syncService.addToQueue('donation_processed', payment, 'high');
        
        // Rastrear analytics
        analyticsService.trackConversion('donation_payment', {
          category: donationData.category,
          amount: donationData.amount,
          paymentMethod,
          userId: userData.id
        });

        return {
          success: true,
          payment,
          message: 'Doação realizada com sucesso! Obrigado pelo seu apoio!'
        };
      } else {
        payment.status = 'failed';
        payment.error = result.error;
        
        // Salvar tentativa falhada
        await this.savePaymentToHistory(payment);
        
        return {
          success: false,
          error: result.error,
          payment
        };
      }
    } catch (error) {
      console.error('💳 [PAYMENT] Erro ao processar doação:', error);
      analyticsService.trackError(error, { context: 'donation_payment' });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento por método específico
  async processPaymentByMethod(payment, method, cardData) {
    switch (method) {
      case 'pix':
        return await this.processPixPayment(payment);
      case 'creditCard':
        return await this.processCreditCardPayment(payment, cardData);
      case 'debitCard':
        return await this.processDebitCardPayment(payment, cardData);
      case 'bankTransfer':
        return await this.processBankTransferPayment(payment);
      case 'boleto':
        return await this.processBoletoPayment(payment);
      default:
        throw new Error('Método de pagamento não suportado');
    }
  }

  // Processar pagamento PIX
  async processPixPayment(payment) {
    try {
      // Simular processamento PIX
      const pixCode = this.generatePixCode(payment.amount);
      
      // Aguardar confirmação (simulado)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        transactionId: `PIX_${Date.now()}`,
        pixCode,
        qrCode: `data:image/png;base64,${this.generateQRCode(pixCode)}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao processar pagamento PIX'
      };
    }
  }

  // Processar pagamento com cartão de crédito
  async processCreditCardPayment(payment, cardData) {
    try {
      // Validar dados do cartão
      if (!this.validateCardData(cardData)) {
        throw new Error('Dados do cartão inválidos');
      }

      // Simular processamento com gateway de pagamento
      const response = await fetch('/api/payments/credit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payment.amount,
          cardData,
          description: `${payment.type === 'subscription' ? 'Assinatura' : 'Doação'} - Liga do Bem`
        })
      });

      if (!response.ok) {
        throw new Error('Erro no processamento do cartão');
      }

      const result = await response.json();
      
      return {
        success: true,
        transactionId: result.transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar pagamento com cartão de débito
  async processDebitCardPayment(payment, cardData) {
    try {
      // Validar dados do cartão
      if (!this.validateCardData(cardData)) {
        throw new Error('Dados do cartão inválidos');
      }

      // Simular processamento de débito
      const response = await fetch('/api/payments/debit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payment.amount,
          cardData,
          description: `${payment.type === 'subscription' ? 'Assinatura' : 'Doação'} - Liga do Bem`
        })
      });

      if (!response.ok) {
        throw new Error('Erro no processamento do débito');
      }

      const result = await response.json();
      
      return {
        success: true,
        transactionId: result.transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Processar transferência bancária
  async processBankTransferPayment(payment) {
    try {
      const bankData = {
        bank: 'Banco do Brasil',
        agency: '0001',
        account: '123456-7',
        accountType: 'Corrente',
        beneficiary: 'Liga do Bem - Proteção Animal',
        cnpj: '12.345.678/0001-90'
      };

      return {
        success: true,
        transactionId: `TRANSFER_${Date.now()}`,
        bankData,
        instructions: 'Após realizar a transferência, envie o comprovante para financeiro@ligadobem.org.br'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao gerar dados bancários'
      };
    }
  }

  // Processar boleto bancário
  async processBoletoPayment(payment) {
    try {
      const boletoData = {
        code: this.generateBoletoCode(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        amount: payment.amount,
        beneficiary: 'Liga do Bem - Proteção Animal',
        instructions: 'Pague até a data de vencimento para evitar juros'
      };

      return {
        success: true,
        transactionId: `BOLETO_${Date.now()}`,
        boletoData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao gerar boleto'
      };
    }
  }

  // Validar dados do cartão
  validateCardData(cardData) {
    if (!cardData) return false;
    
    const { number, holder, expiry, cvv } = cardData;
    
    // Validações básicas
    if (!number || number.replace(/\s/g, '').length < 13) return false;
    if (!holder || holder.trim().length < 3) return false;
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) return false;
    if (!cvv || cvv.length < 3) return false;
    
    return true;
  }

  // Salvar pagamento no histórico
  async savePaymentToHistory(payment) {
    try {
      const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
      history.unshift(payment);
      
      // Manter apenas os últimos 100 pagamentos
      if (history.length > 100) {
        history.splice(100);
      }
      
      localStorage.setItem('payment_history', JSON.stringify(history));
      
      // Atualizar cache
      cacheService.set('payment_history', history);
      
      console.log('💳 [PAYMENT] Pagamento salvo no histórico:', payment.id);
    } catch (error) {
      console.error('💳 [PAYMENT] Erro ao salvar pagamento:', error);
    }
  }

  // Obter histórico de pagamentos
  getPaymentHistory(userId = null) {
    try {
      const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
      
      if (userId) {
        return history.filter(payment => payment.userData?.id === userId);
      }
      
      return history;
    } catch (error) {
      console.error('💳 [PAYMENT] Erro ao obter histórico:', error);
      return [];
    }
  }

  // Obter estatísticas de pagamentos
  getPaymentStats(userId = null) {
    const history = this.getPaymentHistory(userId);
    
    const stats = {
      totalPayments: history.length,
      totalAmount: 0,
      subscriptions: 0,
      donations: 0,
      byMethod: {},
      byCategory: {},
      monthly: {}
    };

    history.forEach(payment => {
      stats.totalAmount += payment.amount;
      
      if (payment.type === 'subscription') {
        stats.subscriptions++;
      } else if (payment.type === 'donation') {
        stats.donations++;
        stats.byCategory[payment.category] = (stats.byCategory[payment.category] || 0) + 1;
      }
      
      stats.byMethod[payment.paymentMethod] = (stats.byMethod[payment.paymentMethod] || 0) + 1;
      
      // Estatísticas mensais
      const month = new Date(payment.timestamp).toISOString().substring(0, 7);
      if (!stats.monthly[month]) {
        stats.monthly[month] = { amount: 0, count: 0 };
      }
      stats.monthly[month].amount += payment.amount;
      stats.monthly[month].count++;
    });

    return stats;
  }

  // Gerar ID único para pagamento
  generatePaymentId() {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Gerar código PIX
  generatePixCode(amount) {
    return `00020126580014br.gov.bcb.pix013612345678901234520400005303986540${amount.toFixed(2)}5802BR5913Liga do Bem6009Botucatu62070503***6304`;
  }

  // Gerar código de barras do boleto
  generateBoletoCode() {
    return '23793.38128 60047.173406 85000.633225 9 84410026000';
  }

  // Gerar QR Code (simulado)
  generateQRCode(data) {
    // Em produção, usar biblioteca real de QR Code
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  // Obter nome da categoria de doação
  getDonationCategoryName(categoryId) {
    const category = this.donationCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Doação Geral';
  }

  // Cancelar assinatura recorrente
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }

      // Atualizar status no histórico local
      const history = this.getPaymentHistory();
      const subscription = history.find(p => p.id === subscriptionId);
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date().toISOString();
        localStorage.setItem('payment_history', JSON.stringify(history));
      }

      return { success: true, message: 'Assinatura cancelada com sucesso' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Atualizar dados do cartão
  async updateCardData(subscriptionId, newCardData) {
    try {
      if (!this.validateCardData(newCardData)) {
        throw new Error('Dados do cartão inválidos');
      }

      const response = await fetch(`/api/subscriptions/${subscriptionId}/card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar dados do cartão');
      }

      return { success: true, message: 'Dados do cartão atualizados com sucesso' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Instância singleton
const paymentService = new PaymentService();

export default paymentService; 