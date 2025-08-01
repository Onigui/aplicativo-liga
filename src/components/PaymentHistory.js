import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CreditCard, Heart, Download, Filter, Search, Eye } from 'lucide-react';
import paymentService from '../services/paymentService';

const PaymentHistory = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPaymentHistory = () => {
    setLoading(true);
    try {
      const history = paymentService.getPaymentHistory(userId);
      setPayments(history);
      setStats(paymentService.getPaymentStats(userId));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(payment => payment.type === filters.type);
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Filtro por data
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(payment => new Date(payment.timestamp) >= startDate);
      }
    }

    // Filtro por busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.id.toLowerCase().includes(searchTerm) ||
        (payment.type === 'subscription' && payment.planName?.toLowerCase().includes(searchTerm)) ||
        (payment.type === 'donation' && payment.categoryName?.toLowerCase().includes(searchTerm)) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Concluído' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Falhou' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      pix: '💳',
      creditCard: '💳',
      debitCard: '💳',
      bankTransfer: '🏦',
      boleto: '📄'
    };
    return icons[method] || '💳';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportHistory = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Valor', 'Método', 'Status', 'Data', 'Descrição'].join(','),
      ...filteredPayments.map(payment => [
        payment.id,
        payment.type === 'subscription' ? 'Assinatura' : 'Doação',
        `R$ ${payment.amount.toFixed(2)}`,
        payment.paymentMethod,
        payment.status,
        formatDate(payment.timestamp),
        payment.type === 'subscription' ? payment.planName : payment.categoryName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_pagamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-lg font-semibold text-gray-900">
                  R$ {(stats.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Assinaturas</p>
                <p className="text-lg font-semibold text-gray-900">{stats.subscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Doações</p>
                <p className="text-lg font-semibold text-gray-900">{stats.donations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pagamentos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="subscription">Assinaturas</option>
            <option value="donation">Doações</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="completed">Concluído</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhou</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as datas</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>

          <button
            onClick={exportHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Lista de pagamentos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Histórico de Pagamentos ({filteredPayments.length})
          </h3>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {payment.type === 'subscription' ? payment.planName : payment.categoryName}
                        </h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>ID: {payment.id}</p>
                        <p>Método: {payment.paymentMethod}</p>
                        <p>Data: {formatDate(payment.timestamp)}</p>
                        {payment.message && (
                          <p className="text-gray-500 italic">"{payment.message}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      R$ {payment.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes do Pagamento</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedPayment.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.type === 'subscription' ? 'Assinatura' : 'Doação'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <p className="text-lg font-semibold text-gray-900">
                    R$ {selectedPayment.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Método</label>
                  <p className="text-sm text-gray-900">{selectedPayment.paymentMethod}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Data</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedPayment.timestamp)}</p>
                </div>

                {selectedPayment.transactionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID da Transação</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedPayment.transactionId}</p>
                  </div>
                )}

                {selectedPayment.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                    <p className="text-sm text-gray-900 italic">"{selectedPayment.message}"</p>
                  </div>
                )}

                {selectedPayment.error && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Erro</label>
                    <p className="text-sm text-red-600">{selectedPayment.error}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 