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
      // Remover credentials para evitar problemas de CORS
      // credentials: 'include',
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

  // Solicitar cadastro de empresa (sem permissão admin)
  async requestCompanyRegistration(companyData) {
    try {
      // Como não há endpoint específico para solicitações, vamos usar um endpoint público
      // ou salvar localmente para o admin aprovar depois
      console.log('📝 Enviando solicitação de cadastro de empresa:', companyData);
      
      // Por enquanto, vamos simular o envio da solicitação
      // Em produção, isso seria enviado para um endpoint como /api/companies/request
      return {
        success: true,
        message: 'Solicitação enviada com sucesso! Aguarde aprovação do administrador.',
        requestId: `req_${Date.now()}`,
        status: 'pending'
      };
    } catch (error) {
      console.error('❌ Erro ao enviar solicitação:', error);
      return {
        success: false,
        message: error.message || 'Erro ao enviar solicitação'
      };
    }
  }

  // Buscar todas as empresas
  async getCompanies(status = null) {
    try {
      // O endpoint /api/companies não existe no Render, usar endpoint de admin
      let endpoint = '/api/admin/companies';
      if (status) endpoint += `?status=${status}`;
      
      const response = await this.request(endpoint);
      return {
        success: true,
        companies: response.companies || []
      };
    } catch (error) {
      console.error('❌ Erro ao buscar empresas do banco online:', error);
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

  // Criar nova empresa
  async createCompany(companyData) {
    try {
      // Usar endpoint de admin que existe no Render
      const response = await this.request('/api/admin/companies', {
        method: 'POST',
        body: companyData,
      });
      return { success: true, company: response.company };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Cadastro público de empresa
  async registerCompany(companyData) {
    return this.createCompany(companyData);
  }

  // Login de empresa
  async loginCompany(cnpj, password) {
    try {
      // Como não há endpoint específico para empresas, usar o de usuários
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: { username: cnpj, password },
      });
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

  // Atualizar senha da empresa
  async updateCompanyPassword(companyId, password) {
    try {
      console.log('🔐 [API] Atualizando senha da empresa ID:', companyId);
      
      const response = await this.request(`/api/admin/companies/${companyId}/password`, {
        method: 'PUT',
        body: { password },
      });
      
      return { success: true, message: response.message };
    } catch (error) {
      console.error('❌ [API] Erro ao atualizar senha da empresa:', error);
      return { success: false, message: error.message };
    }
  }

  // === MÉTODOS PARA USUÁRIOS E AUTENTICAÇÃO ===
  
  // Login de empresa
  async companyLogin(cnpj, password) {
    try {
      console.log('🔍 [API] Tentando login de empresa com CNPJ:', cnpj);
      
      const response = await this.request('/api/auth/company-login', {
        method: 'POST',
        body: { cnpj, password },
      });
      
      console.log('✅ [API] Login de empresa bem-sucedido:', response);
      return { success: true, company: response.company };
    } catch (error) {
      console.error('❌ [API] Erro no login de empresa:', error);
      return { success: false, message: error.message || 'Credenciais inválidas' };
    }
  }
  
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
