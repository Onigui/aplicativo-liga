import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      console.log('🔍 Buscando dados do dashboard...');
      const response = await axios.get('/admin/dashboard');
      console.log('✅ Dados do dashboard recebidos:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      // Usar dados mock em caso de erro
      setDashboardData({
        totalUsers: 156,
        activeUsers: 142,
        inactiveUsers: 14,
        totalRevenue: 15600.00,
        monthlyRevenue: 2800.00,
        pendingPayments: 8,
        overdue: 3,
        revenueGrowth: 12.5,
        userGrowth: 8.3,
        revenueChart: [
          { month: 'Jan', revenue: 2400, users: 35 },
          { month: 'Fev', revenue: 2200, users: 42 },
          { month: 'Mar', revenue: 2800, users: 38 }
        ],
        alerts: [
          { id: 1, type: 'warning', message: 'Dados simulados (backend offline)', link: '#' }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total de Usuários',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${dashboardData?.userGrowth || 0}%`,
      changeType: 'positive'
    },
    {
      title: 'Usuários Ativos',
      value: dashboardData?.activeUsers || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pagamentos Pendentes',
      value: dashboardData?.pendingPayments || 0,
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(dashboardData?.monthlyRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: `+${dashboardData?.revenueGrowth || 0}%`,
      changeType: 'positive'
    }
  ];

  // Dados para gráfico de barras (últimos 6 meses mockados)
  const monthlyData = [
    { month: 'Jul', receita: 450, usuarios: 12 },
    { month: 'Ago', receita: 520, usuarios: 15 },
    { month: 'Set', receita: 380, usuarios: 8 },
    { month: 'Out', receita: 670, usuarios: 22 },
    { month: 'Nov', receita: 580, usuarios: 18 },
    { month: 'Dez', receita: dashboardData?.revenue?.monthly || 0, usuarios: dashboardData?.users?.active || 0 }
  ];

  // Dados para gráfico de pizza
  const userStatusData = [
    { name: 'Ativos', value: dashboardData?.users?.active || 0, color: '#10b981' },
    { name: 'Inativos', value: dashboardData?.users?.inactive || 0, color: '#ef4444' },
    { name: 'Com Atraso', value: dashboardData?.users?.withOverduePayments || 0, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema Liga do Bem</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receita Mensal</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Últimos 6 meses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'receita' ? `R$ ${value}` : value,
                  name === 'receita' ? 'Receita' : 'Novos Usuários'
                ]}
              />
              <Legend />
              <Bar dataKey="receita" fill="#0ea5e9" name="receita" />
              <Bar dataKey="usuarios" fill="#10b981" name="usuarios" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Status Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Status dos Usuários</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Total: {dashboardData?.users?.total || 0}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Alert */}
        {dashboardData?.payments?.overdue > 0 && (
          <div className="card border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h4 className="text-lg font-semibold text-red-900">
                  Atenção Requerida!
                </h4>
                <p className="text-red-700">
                  {dashboardData.payments.overdue} pagamentos estão vencidos e precisam de atenção.
                </p>
                <button className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium">
                  Ver pagamentos vencidos →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Pagamentos Aprovados</span>
              </div>
              <span className="text-sm font-medium">
                {(dashboardData?.users?.total || 0) - (dashboardData?.payments?.pending || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Usuários Inativos</span>
              </div>
              <span className="text-sm font-medium">{dashboardData?.users?.inactive || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Receita Total</span>
              </div>
              <span className="text-sm font-medium">
                R$ {dashboardData?.revenue?.total?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Taxa de Crescimento</span>
              </div>
              <span className="text-sm font-medium text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;