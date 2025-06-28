import axios from 'axios';
import { API_URLS, getHeaders } from '../config/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URLS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de API
export const apiService = {
  // Autenticação
  login: async (cpf, password) => {
    try {
      const response = await api.post('/api/auth/login', { cpf, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.post('/api/auth/verify-token');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token inválido' };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('adminToken');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('adminToken');
      throw error.response?.data || { message: 'Erro ao fazer logout' };
    }
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar estatísticas' };
    }
  },

  // Usuários
  getUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/api/admin/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar usuários' };
    }
  },

  getUserDetails: async (id) => {
    try {
      const response = await api.get(`/api/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar detalhes do usuário' };
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await api.put(`/api/admin/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao alterar status do usuário' };
    }
  },

  // Pagamentos
  getPayments: async (page = 1, limit = 10, status = '') => {
    try {
      const response = await api.get('/api/admin/payments', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar pagamentos' };
    }
  },

  getPaymentDetails: async (id) => {
    try {
      const response = await api.get(`/api/admin/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar detalhes do pagamento' };
    }
  },

  approvePayment: async (id) => {
    try {
      const response = await api.put(`/api/admin/payments/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao aprovar pagamento' };
    }
  },

  rejectPayment: async (id, reason = '') => {
    try {
      const response = await api.put(`/api/admin/payments/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao rejeitar pagamento' };
    }
  },

  // Configurações
  getSettings: async () => {
    try {
      const response = await api.get('/api/admin/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar configurações' };
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put('/api/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar configurações' };
    }
  },

  // Relatórios
  getReports: async (startDate, endDate, type = 'all') => {
    try {
      const response = await api.get('/api/admin/reports', {
        params: { startDate, endDate, type }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao carregar relatórios' };
    }
  },

  exportReport: async (startDate, endDate, type = 'all', format = 'pdf') => {
    try {
      const response = await api.get('/api/admin/reports/export', {
        params: { startDate, endDate, type, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao exportar relatório' };
    }
  }
};

// Função para testar conectividade
export const testConnection = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro de conexão com o servidor' };
  }
};

export default api;