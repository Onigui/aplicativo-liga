// API Service para os componentes administrativos
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('⚠️ [API] Erro na resposta:', error.response?.status);
    
    // Apenas redirecionar em caso de erro real de autenticação
    if (error.response?.status === 401) {
      console.log('🔐 [API] Token inválido, redirecionando...');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Recarregar a página admin em vez de redirecionar
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

const adminApiService = {
  // COMPANIES
  async getCompanies() {
    try {
      const response = await api.get('/api/companies');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      return { success: false, error: error.message };
    }
  },

  async getCompany(id) {
    try {
      const response = await api.get(`/companies/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  async createCompany(companyData) {
    try {
      const response = await api.post('/api/companies', companyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  async updateCompany(id, companyData) {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteCompany(id) {
    try {
      await api.delete(`/companies/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  async approveCompany(id) {
    try {
      const response = await api.put(`/companies/${id}`, { status: 'approved' });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  async rejectCompany(id) {
    try {
      const response = await api.put(`/companies/${id}`, { status: 'rejected' });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error);
      return { success: false, error: error.message };
    }
  },

  // USERS
  async getUsers() {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return { success: false, error: error.message };
    }
  },

  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, error: error.message };
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteUser(id) {
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { success: false, error: error.message };
    }
  },

  // PAYMENTS
  async getPayments() {
    try {
      const response = await api.get('/payments');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return { success: false, error: error.message };
    }
  },

  // STATISTICS/REPORTS
  async getStatistics() {
    try {
      // Simular estatísticas com dados do JSON Server
      const companies = await this.getCompanies();
      const users = await this.getUsers();
      
      return {
        success: true,
        data: {
          totalCompanies: companies.data?.length || 0,
          approvedCompanies: companies.data?.filter(c => c.status === 'approved').length || 0,
          pendingCompanies: companies.data?.filter(c => c.status === 'pending').length || 0,
          totalUsers: users.data?.length || 0,
          totalPayments: 0, // Implementar quando tiver pagamentos
          totalRevenue: 0    // Implementar quando tiver pagamentos
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message };
    }
  }
};

export default adminApiService;