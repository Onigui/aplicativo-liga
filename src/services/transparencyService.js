// Sistema de Transparência Financeira para Liga do Bem
import analyticsService from './analyticsService.js';
import cacheService from './cacheService.js';
import syncService from './syncService.js';

class TransparencyService {
  constructor() {
    this.financialCategories = {
      income: {
        subscriptions: 'Assinaturas Mensais',
        donations: 'Doações',
        events: 'Eventos',
        partnerships: 'Parcerias',
        grants: 'Subvenções',
        other: 'Outros'
      },
      expenses: {
        medical: 'Tratamentos Médicos',
        food: 'Alimentação',
        shelter: 'Manutenção de Abrigos',
        events: 'Organização de Eventos',
        education: 'Campanhas Educativas',
        administration: 'Administração',
        utilities: 'Contas e Serviços',
        equipment: 'Equipamentos',
        other: 'Outros'
      }
    };

    this.transparencyLevels = {
      public: 'Público',
      members: 'Membros',
      admin: 'Administradores'
    };

    console.log('📊 [TRANSPARENCY] Serviço de transparência financeira inicializado');
  }

  // Registrar receita
  async recordIncome(incomeData) {
    try {
      const record = {
        id: this.generateRecordId(),
        type: 'income',
        category: incomeData.category,
        categoryName: this.financialCategories.income[incomeData.category],
        amount: incomeData.amount,
        description: incomeData.description,
        source: incomeData.source,
        paymentMethod: incomeData.paymentMethod,
        transactionId: incomeData.transactionId,
        userId: incomeData.userId,
        userData: incomeData.userData,
        timestamp: new Date().toISOString(),
        transparencyLevel: incomeData.transparencyLevel || 'public',
        receipt: incomeData.receipt || null,
        notes: incomeData.notes || ''
      };

      // Salvar no histórico financeiro
      await this.saveFinancialRecord(record);
      
      // Sincronizar com servidor
      syncService.addToQueue('financial_record_created', record, 'high');
      
      // Rastrear analytics
      analyticsService.track('financial_income_recorded', {
        category: incomeData.category,
        amount: incomeData.amount,
        source: incomeData.source
      });

      console.log('📊 [TRANSPARENCY] Receita registrada:', record.id);
      
      return { success: true, record };
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao registrar receita:', error);
      analyticsService.trackError(error, { context: 'transparency_income' });
      
      return { success: false, error: error.message };
    }
  }

  // Registrar despesa
  async recordExpense(expenseData) {
    try {
      const record = {
        id: this.generateRecordId(),
        type: 'expense',
        category: expenseData.category,
        categoryName: this.financialCategories.expenses[expenseData.category],
        amount: expenseData.amount,
        description: expenseData.description,
        supplier: expenseData.supplier,
        paymentMethod: expenseData.paymentMethod,
        transactionId: expenseData.transactionId,
        approvedBy: expenseData.approvedBy,
        timestamp: new Date().toISOString(),
        transparencyLevel: expenseData.transparencyLevel || 'public',
        receipt: expenseData.receipt || null,
        notes: expenseData.notes || '',
        beneficiary: expenseData.beneficiary || null
      };

      // Salvar no histórico financeiro
      await this.saveFinancialRecord(record);
      
      // Sincronizar com servidor
      syncService.addToQueue('financial_record_created', record, 'high');
      
      // Rastrear analytics
      analyticsService.track('financial_expense_recorded', {
        category: expenseData.category,
        amount: expenseData.amount,
        supplier: expenseData.supplier
      });

      console.log('📊 [TRANSPARENCY] Despesa registrada:', record.id);
      
      return { success: true, record };
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao registrar despesa:', error);
      analyticsService.trackError(error, { context: 'transparency_expense' });
      
      return { success: false, error: error.message };
    }
  }

  // Salvar registro financeiro
  async saveFinancialRecord(record) {
    try {
      const records = JSON.parse(localStorage.getItem('financial_records') || '[]');
      records.unshift(record);
      
      // Manter apenas os últimos 1000 registros
      if (records.length > 1000) {
        records.splice(1000);
      }
      
      localStorage.setItem('financial_records', JSON.stringify(records));
      
      // Atualizar cache
      cacheService.set('financial_records', records);
      
      console.log('📊 [TRANSPARENCY] Registro financeiro salvo:', record.id);
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao salvar registro:', error);
    }
  }

  // Obter registros financeiros
  getFinancialRecords(filters = {}) {
    try {
      let records = JSON.parse(localStorage.getItem('financial_records') || '[]');
      
      // Aplicar filtros
      if (filters.type) {
        records = records.filter(record => record.type === filters.type);
      }
      
      if (filters.category) {
        records = records.filter(record => record.category === filters.category);
      }
      
      if (filters.startDate) {
        records = records.filter(record => new Date(record.timestamp) >= new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        records = records.filter(record => new Date(record.timestamp) <= new Date(filters.endDate));
      }
      
      if (filters.transparencyLevel) {
        records = records.filter(record => record.transparencyLevel === filters.transparencyLevel);
      }
      
      // Ordenar por data (mais recente primeiro)
      records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return records;
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao obter registros:', error);
      return [];
    }
  }

  // Gerar relatório financeiro
  generateFinancialReport(startDate = null, endDate = null) {
    try {
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const records = this.getFinancialRecords(filters);
      
      const report = {
        period: {
          start: startDate || new Date(new Date().getFullYear(), 0, 1).toISOString(),
          end: endDate || new Date().toISOString()
        },
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          incomeCount: 0,
          expenseCount: 0
        },
        income: {
          byCategory: {},
          byMonth: {},
          bySource: {}
        },
        expenses: {
          byCategory: {},
          byMonth: {},
          bySupplier: {}
        },
        records: records
      };

      records.forEach(record => {
        if (record.type === 'income') {
          report.summary.totalIncome += record.amount;
          report.summary.incomeCount++;
          
          // Por categoria
          if (!report.income.byCategory[record.category]) {
            report.income.byCategory[record.category] = { amount: 0, count: 0 };
          }
          report.income.byCategory[record.category].amount += record.amount;
          report.income.byCategory[record.category].count++;
          
          // Por mês
          const month = new Date(record.timestamp).toISOString().substring(0, 7);
          if (!report.income.byMonth[month]) {
            report.income.byMonth[month] = { amount: 0, count: 0 };
          }
          report.income.byMonth[month].amount += record.amount;
          report.income.byMonth[month].count++;
          
          // Por fonte
          if (!report.income.bySource[record.source]) {
            report.income.bySource[record.source] = { amount: 0, count: 0 };
          }
          report.income.bySource[record.source].amount += record.amount;
          report.income.bySource[record.source].count++;
          
        } else if (record.type === 'expense') {
          report.summary.totalExpenses += record.amount;
          report.summary.expenseCount++;
          
          // Por categoria
          if (!report.expenses.byCategory[record.category]) {
            report.expenses.byCategory[record.category] = { amount: 0, count: 0 };
          }
          report.expenses.byCategory[record.category].amount += record.amount;
          report.expenses.byCategory[record.category].count++;
          
          // Por mês
          const month = new Date(record.timestamp).toISOString().substring(0, 7);
          if (!report.expenses.byMonth[month]) {
            report.expenses.byMonth[month] = { amount: 0, count: 0 };
          }
          report.expenses.byMonth[month].amount += record.amount;
          report.expenses.byMonth[month].count++;
          
          // Por fornecedor
          if (!report.expenses.bySupplier[record.supplier]) {
            report.expenses.bySupplier[record.supplier] = { amount: 0, count: 0 };
          }
          report.expenses.bySupplier[record.supplier].amount += record.amount;
          report.expenses.bySupplier[record.supplier].count++;
        }
      });

      report.summary.balance = report.summary.totalIncome - report.summary.totalExpenses;
      
      return report;
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao gerar relatório:', error);
      return null;
    }
  }

  // Gerar relatório de transparência pública
  generatePublicTransparencyReport() {
    try {
      const report = this.generateFinancialReport();
      
      if (!report) return null;
      
      // Filtrar apenas registros públicos
      const publicRecords = report.records.filter(record => 
        record.transparencyLevel === 'public'
      );
      
      const publicReport = {
        ...report,
        records: publicRecords,
        summary: {
          totalIncome: publicRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
          totalExpenses: publicRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
          balance: 0,
          incomeCount: publicRecords.filter(r => r.type === 'income').length,
          expenseCount: publicRecords.filter(r => r.type === 'expense').length
        }
      };
      
      publicReport.summary.balance = publicReport.summary.totalIncome - publicReport.summary.totalExpenses;
      
      return publicReport;
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao gerar relatório público:', error);
      return null;
    }
  }

  // Exportar dados para CSV
  exportToCSV(records, filename = 'financial_report.csv') {
    try {
      if (!records || records.length === 0) {
        throw new Error('Nenhum registro para exportar');
      }

      const headers = [
        'ID',
        'Tipo',
        'Categoria',
        'Valor',
        'Descrição',
        'Data',
        'Método de Pagamento',
        'Nível de Transparência'
      ];

      const csvContent = [
        headers.join(','),
        ...records.map(record => [
          record.id,
          record.type === 'income' ? 'Receita' : 'Despesa',
          record.categoryName,
          record.amount.toFixed(2),
          `"${record.description}"`,
          new Date(record.timestamp).toLocaleDateString('pt-BR'),
          record.paymentMethod,
          this.transparencyLevels[record.transparencyLevel]
        ].join(','))
      ].join('\n');

      // Criar blob e download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log('📊 [TRANSPARENCY] Relatório exportado:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao exportar CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Gerar relatório de auditoria
  generateAuditReport(startDate = null, endDate = null) {
    try {
      const records = this.getFinancialRecords({ startDate, endDate });
      
      const auditReport = {
        period: {
          start: startDate || new Date(new Date().getFullYear(), 0, 1).toISOString(),
          end: endDate || new Date().toISOString()
        },
        totalRecords: records.length,
        incomeRecords: records.filter(r => r.type === 'income').length,
        expenseRecords: records.filter(r => r.type === 'expense').length,
        totalIncome: records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
        totalExpenses: records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
        balance: 0,
        anomalies: [],
        recommendations: []
      };

      auditReport.balance = auditReport.totalIncome - auditReport.totalExpenses;

      // Detectar anomalias
      const avgIncome = auditReport.totalIncome / auditReport.incomeRecords || 0;
      const avgExpense = auditReport.totalExpenses / auditReport.expenseRecords || 0;

      records.forEach(record => {
        // Verificar valores muito altos
        if (record.amount > avgIncome * 5 && record.type === 'income') {
          auditReport.anomalies.push({
            type: 'high_income',
            recordId: record.id,
            amount: record.amount,
            description: 'Receita com valor muito alto'
          });
        }

        if (record.amount > avgExpense * 5 && record.type === 'expense') {
          auditReport.anomalies.push({
            type: 'high_expense',
            recordId: record.id,
            amount: record.amount,
            description: 'Despesa com valor muito alto'
          });
        }

        // Verificar registros sem descrição
        if (!record.description || record.description.trim() === '') {
          auditReport.anomalies.push({
            type: 'missing_description',
            recordId: record.id,
            description: 'Registro sem descrição'
          });
        }
      });

      // Gerar recomendações
      if (auditReport.balance < 0) {
        auditReport.recommendations.push('Saldo negativo detectado - revisar despesas');
      }

      if (auditReport.anomalies.length > 10) {
        auditReport.recommendations.push('Muitas anomalias detectadas - revisar processos');
      }

      if (auditReport.expenseRecords > auditReport.incomeRecords * 2) {
        auditReport.recommendations.push('Muitas despesas em relação às receitas');
      }

      return auditReport;
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao gerar relatório de auditoria:', error);
      return null;
    }
  }

  // Gerar ID único para registro
  generateRecordId() {
    return `FIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter categorias financeiras
  getFinancialCategories() {
    return this.financialCategories;
  }

  // Obter níveis de transparência
  getTransparencyLevels() {
    return this.transparencyLevels;
  }

  // Limpar registros antigos
  async cleanupOldRecords(daysToKeep = 365) {
    try {
      const records = this.getFinancialRecords();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredRecords = records.filter(record => 
        new Date(record.timestamp) >= cutoffDate
      );

      localStorage.setItem('financial_records', JSON.stringify(filteredRecords));
      
      console.log('📊 [TRANSPARENCY] Registros antigos removidos:', records.length - filteredRecords.length);
      
      return { success: true, removedCount: records.length - filteredRecords.length };
    } catch (error) {
      console.error('📊 [TRANSPARENCY] Erro ao limpar registros:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instância singleton
const transparencyService = new TransparencyService();

export default transparencyService; 