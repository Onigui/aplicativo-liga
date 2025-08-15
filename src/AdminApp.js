import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Componentes Admin
import AdminLogin from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';
import Sidebar from './components/admin/Sidebar';
import Header from './components/admin/Header';
import Users from './components/admin/Users';
import Payments from './components/admin/Payments';
import Companies from './components/admin/Companies';
import CompanyRequests from './components/admin/CompanyRequests';
import Reports from './components/admin/Reports';
import Settings from './components/admin/Settings';

// Configuração do axios para JSON Server
import { API_BASE_URL } from './config/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;

function AdminApp({ 
  companyRequests = [], 
  onApproveCompanyRequest, 
  onRejectCompanyRequest 
}) {
  console.log('🚀 [ADMIN] AdminApp.js carregado!');
  console.log('📝 [ADMIN] CompanyRequests recebidas:', companyRequests);
  console.log('📝 [ADMIN] Tipo de companyRequests:', typeof companyRequests);
  console.log('📝 [ADMIN] É array?', Array.isArray(companyRequests));
  console.log('📝 [ADMIN] Length:', companyRequests?.length);
  console.log('📝 [ADMIN] Funções recebidas:', { onApproveCompanyRequest, onRejectCompanyRequest });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Funções definidas antes do useEffect
  const logout = useCallback(() => {
    console.log('🚪 [ADMIN] Fazendo logout...');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const verifyAdminToken = useCallback(async (token, adminDataString) => {
    try {
      console.log('🔐 [ADMIN] Verificando token admin...');
      
      const admin = JSON.parse(adminDataString);
      console.log('👤 [ADMIN] Dados do admin:', admin);
      
      // Verificar se é admin por role ou por tipo de usuário
      if (admin && (admin.role === 'admin' || admin.isAdmin === true || admin.userType === 'admin')) {
        console.log('✅ [ADMIN] Autenticação válida');
        setUser(admin);
        setIsAuthenticated(true);
      } else {
        console.log('❌ [ADMIN] Role inválida:', admin?.role, 'isAdmin:', admin?.isAdmin, 'userType:', admin?.userType);
        logout();
      }
    } catch (error) {
      console.error('❌ [ADMIN] Erro ao verificar token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = (adminData, token) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    setUser(adminData);
    setIsAuthenticated(true);
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_user');
    
    console.log('🔍 [ADMIN] Verificando autenticação...');
    console.log('🔍 [ADMIN] Token existe:', !!token);
    console.log('🔍 [ADMIN] Dados admin existem:', !!adminData);
    
    if (token && adminData) {
      verifyAdminToken(token, adminData);
    } else {
      console.log('❌ [ADMIN] Sem token ou dados, redirecionando para login');
      setLoading(false);
    }
  }, [verifyAdminToken]);

  // Monitorar mudanças no companyRequests
  useEffect(() => {
    console.log('📝 [ADMIN] CompanyRequests mudou:', companyRequests);
    console.log('📝 [ADMIN] Total de solicitações:', companyRequests?.length || 0);
  }, [companyRequests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminLogin onLogin={login} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Header user={user} onLogout={logout} />
          
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/company-requests" element={
                <CompanyRequests 
                  companyRequests={companyRequests}
                  onApprove={onApproveCompanyRequest}
                  onReject={onRejectCompanyRequest}
                />
              } />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminApp;