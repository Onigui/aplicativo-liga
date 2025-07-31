import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: 1,
        limit: 50,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      console.log('🔍 Buscando pagamentos com params:', params);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/payments`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Pagamentos recebidos:', response.data);
      
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos:', error);
      setError(error.response?.data?.message || 'Erro ao carregar pagamentos');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Tem certeza que deseja aprovar este pagamento?')) {
      return;
    }

    try {
      console.log('🔍 Aprovando pagamento:', paymentId);
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_BASE_URL}/api/admin/payments/${paymentId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Pagamento aprovado com sucesso');
      fetchPayments();
    } catch (error) {
      console.error('❌ Erro ao aprovar pagamento:', error);
      setError(error.response?.data?.message || 'Erro ao aprovar pagamento');
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      console.log('🔍 Rejeitando pagamento:', paymentId, 'Motivo:', reason);
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_BASE_URL}/api/admin/payments/${paymentId}/reject`, { reason }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Pagamento rejeitado com sucesso');
      fetchPayments();
    } catch (error) {
      console.error('❌ Erro ao rejeitar pagamento:', error);
      setError(error.response?.data?.message || 'Erro ao rejeitar pagamento');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600">Gerenciar e aprovar pagamentos</p>
        </div>
        <button onClick={fetchPayments} className="btn-primary flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
            <p className="ml-4 text-gray-600">Carregando pagamentos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{payments && payments.length > 0 ? payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.user_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{payment.user_cpf || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {(payment.value || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">{payment.month || payment.notes || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                      {payment.isOverdue && (
                        <div className="text-xs text-red-600 mt-1">Vencido</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Criado: {new Date(payment.created_at || Date.now()).toLocaleDateString('pt-BR')}</div>
                      {payment.reviewed_at && (
                        <div>Revisado: {new Date(payment.reviewed_at).toLocaleDateString('pt-BR')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Aprovar"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeitar"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {payment.receipt_url && (
                        <button
                          onClick={() => window.open(`${API_BASE_URL}${payment.receipt_url}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver Comprovante"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;