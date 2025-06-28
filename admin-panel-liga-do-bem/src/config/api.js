// Configurações da API
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/api/auth/login',
    VERIFY_TOKEN: '/api/auth/verify-token',
    LOGOUT: '/api/auth/logout',
    
    // Dashboard
    DASHBOARD_STATS: '/api/admin/dashboard',
    
    // Usuários
    USERS: '/api/admin/users',
    USER_TOGGLE_STATUS: (id) => `/api/admin/users/${id}/toggle-status`,
    USER_DETAILS: (id) => `/api/admin/users/${id}`,
    
    // Pagamentos
    PAYMENTS: '/api/admin/payments',
    PAYMENT_APPROVE: (id) => `/api/admin/payments/${id}/approve`,
    PAYMENT_REJECT: (id) => `/api/admin/payments/${id}/reject`,
    PAYMENT_DETAILS: (id) => `/api/admin/payments/${id}`,
    
    // Configurações
    SETTINGS: '/api/admin/settings',
    UPDATE_SETTINGS: '/api/admin/settings',
    
    // Relatórios
    REPORTS: '/api/admin/reports',
    EXPORT_REPORT: '/api/admin/reports/export'
  }
};

// Headers padrão para as requisições
export const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// URLs completas da API
export const API_URLS = {
  BASE_URL: API_CONFIG.BASE_URL,
  
  // Autenticação
  LOGIN: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
  VERIFY_TOKEN: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_TOKEN}`,
  LOGOUT: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_STATS}`,
  
  // Usuários
  USERS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
  USER_TOGGLE_STATUS: (id) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_TOGGLE_STATUS(id)}`,
  USER_DETAILS: (id) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_DETAILS(id)}`,
  
  // Pagamentos
  PAYMENTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}`,
  PAYMENT_APPROVE: (id) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_APPROVE(id)}`,
  PAYMENT_REJECT: (id) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_REJECT(id)}`,
  PAYMENT_DETAILS: (id) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_DETAILS(id)}`,
  
  // Configurações
  SETTINGS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SETTINGS}`,
  UPDATE_SETTINGS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_SETTINGS}`,
  
  // Relatórios
  REPORTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}`,
  EXPORT_REPORT: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPORT_REPORT}`
};

export default API_CONFIG;