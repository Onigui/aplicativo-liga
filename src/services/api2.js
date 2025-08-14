// Serviço de API centralizada para comunicação entre os sistemas
import { API_BASE_URL } from '../config/api';

console.log('*** API2.JS CARREGADO ***');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    // Adicionar token de admin se existir
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    if (token) {
      console.log('[API DEBUG] Enviando token no header Authorization:', token);
    } else {
      console.warn('[API DEBUG] Nenhum token encontrado para Authorization!');
    }
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const opts = {
      credentials: 'include',
      headers: { ...defaultHeaders, ...authHeader, ...(options.headers || {}) },
      ...options,
    };
    if (opts.body && typeof opts.body !== 'string') {
      console.log('[API DEBUG] Serializando body:', opts.body);
      opts.body = JSON.stringify(opts.body);
      console.log('[API DEBUG] Body serializado:', opts.body);
    }
    console.log('[API DEBUG] Opções finais do fetch:', opts);
    const response = await fetch(url, opts);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro na requisição');
    return data;
  }

  // === MÉTODOS PARA EMPRESAS ===

  // Buscar todas as empresas
  async getCompanies(status = null) {
    try {
      let endpoint = '/api/admin/companies';
      if (status) endpoint += `?status=${status}`;
      const response = await this.request(endpoint);
      return {
        success: true,
        companies: response.companies || []
      };
    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      return {
        success: false,
        companies: [],
        message: error.message
      };
    }
  }

  // Buscar empresa por ID
  async getCompany(id) {
    try {
      const response = await this.request(`/api/admin/companies/${id}`);
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Criar nova empresa (endpoint público)
  async createCompany(companyData) {
    try {
      const response = await this.request('/api/companies', {
        method: 'POST',
        body: companyData,
      });
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Cadastro público de empresa (endpoint específico)
  async registerCompany(companyData) {
    try {
      // Tentar primeiro o endpoint público
      const response = await this.request('/api/companies', {
        method: 'POST',
        body: companyData,
      });
      return { success: true, company: response.company };
    } catch (error) {
      console.warn('⚠️ Endpoint público falhou, tentando admin:', error);
      
      // Fallback para endpoint admin se o público falhar
      try {
        const adminResponse = await this.request('/api/admin/companies', {
          method: 'POST',
          body: companyData,
        });
        return { success: true, company: adminResponse.company };
      } catch (adminError) {
        return { success: false, message: adminError.message };
      }
    }
  }

  // Login de empresa
  async loginCompany(cnpj, password) {
    try {
      const response = await this.request('/api/companies/login', {
        method: 'POST',
        body: { cnpj, password },
      });
      // Salvar token se existir
      if (response.token) {
        localStorage.setItem('company_token', response.token);
      }
      return { success: true, ...response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Atualizar empresa existente
  async updateCompany(id, companyData) {
    try {
      const response = await this.request(`/api/admin/companies/${id}`, {
        method: 'PUT',
        body: companyData,
      });
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Aprovar empresa
  async approveCompany(id) {
    try {
      const response = await this.request(`/api/admin/companies/${id}/approve`, {
        method: 'PUT',
      });
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Rejeitar empresa
  async rejectCompany(id, reason = '') {
    try {
      const response = await this.request(`/api/admin/companies/${id}/reject`, {
        method: 'PUT',
        body: { reason },
      });
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Deletar empresa
  async deleteCompany(id) {
    try {
      const response = await this.request(`/api/admin/companies/${id}`, {
        method: 'DELETE',
      });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // === MÉTODOS PARA USUÁRIOS E AUTENTICAÇÃO ===
  async login(username, password) {
    try {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: { username: username, password },
      });
      // Salvar token se existir
      if (response.token) {
        localStorage.setItem('admin_token', response.token);
      }
      return { success: true, ...response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Cadastro de novo usuário
  async register(params) {
    console.log('[API DEBUG] INÍCIO DA FUNÇÃO REGISTER');
    console.log('[API DEBUG] Parâmetros recebidos:', params);
    console.log('[API DEBUG] Tipo dos parâmetros:', typeof params);
    console.log('[API DEBUG] Keys dos parâmetros:', Object.keys(params || {}));
    
    try {
      const { name, cpf, password } = params;
      console.log('[API DEBUG] Desestruturação - name:', name);
      console.log('[API DEBUG] Desestruturação - cpf:', cpf);
      console.log('[API DEBUG] Desestruturação - password:', password);
      console.log('[API DEBUG] Dados que serão enviados:', { name, cpf, password });
      
      const response = await this.request('/api/admin/auth/register', {
        method: 'POST',
        body: { name, cpf, password },
      });
      return { success: true, ...response };
    } catch (error) {
      console.log('[API DEBUG] Erro na requisição:', error);
      return { success: false, message: error.message };
    }
  }
}

// Exportar instância única da API
const apiService = new ApiService();
export default apiService;
