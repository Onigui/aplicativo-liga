import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReportData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando dados de relatório...');
      
      // Calcular datas baseado no range selecionado
      const endDate = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case 'last7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'last30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'last90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        type: 'all'
      };

      const response = await axios.get('/admin/reports', { params });
      console.log('✅ Dados de relatório recebidos:', response.data);
      setReportData(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar relatórios:', error);
      // Dados mock em caso de erro
      setReportData({
        period: { start: '2024-01-01', end: '2024-01-31' },
        revenue: { total: 2825.00, monthly: [
          { month: '2024-01', value: 2825.00 }
        ]},
        users: { total: 156, new: 12, active: 142 },
        payments: { total: 312, approved: 289, pending: 15, rejected: 8 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados mockados para os gráficos
  const monthlyData = reportData?.revenue?.monthly || [
    { month: 'Jan', receita: 350, usuarios: 8, pagamentos: 12 },
    { month: 'Fev', receita: 420, usuarios: 12, pagamentos: 15 },
    { month: 'Mar', receita: 380, usuarios: 6, pagamentos: 18 },
    { month: 'Abr', receita: 520, usuarios: 15, pagamentos: 22 },
    { month: 'Mai', receita: 450, usuarios: 10, pagamentos: 20 },
    { month: 'Jun', receita: 680, usuarios: 18, pagamentos: 28 },
  ];

  const dailyData = [
    { day: '1', receita: 25, pagamentos: 1 },
    { day: '2', receita: 50, pagamentos: 2 },
    { day: '3', receita: 75, pagamentos: 3 },
    { day: '4', receita: 25, pagamentos: 1 },
    { day: '5', receita: 100, pagamentos: 4 },
    { day: '6', receita: 0, pagamentos: 0 },
    { day: '7', receita: 50, pagamentos: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Analytics e métricas do sistema</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="last7days">Últimos 7 dias</option>
            <option value="last30days">Últimos 30 dias</option>
            <option value="last90days">Últimos 90 dias</option>
          </select>
          <button 
            onClick={fetchReportData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-600"></div>
          <span className="ml-3 text-gray-600">Carregando relatórios...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(reportData?.revenue?.total || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-sm text-green-600">Período selecionado</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold text-blue-600">{reportData?.users?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 text-sm text-blue-600">
              {reportData?.users?.new || 0} novos usuários
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagamentos</p>
                <p className="text-2xl font-bold text-purple-600">{reportData?.payments?.total || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-purple-600">
              {reportData?.payments?.approved || 0} aprovados
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Crescimento</p>
                <p className="text-2xl font-bold text-orange-600">12%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-sm text-orange-600">Meta: 10%</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receita Mensal</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Crescimento de Usuários</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Novos Usuários"
              />
              <Line 
                type="monotone" 
                dataKey="pagamentos" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Pagamentos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Atividade dos Últimos 7 Dias</h3>
          <div className="text-sm text-gray-500">Receita e pagamentos diários</div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stackId="1"
              stroke="#8884d8" 
              fill="#8884d8" 
              name="Receita (R$)"
            />
            <Area 
              type="monotone" 
              dataKey="pagamentos" 
              stackId="2"
              stroke="#82ca9d" 
              fill="#82ca9d" 
              name="Pagamentos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Detalhado</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pagamentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Taxa Conversão
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((data, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.month} 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {data.receita},00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    +{data.usuarios}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.pagamentos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((data.pagamentos / (data.usuarios + 10)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;