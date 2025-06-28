import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import Login from './components/Login';
import LoginTest from './components/LoginTest';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Users from './components/Users';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Settings from './components/Settings';

// Configuração do axios
axios.defaults.baseURL = 'http://localhost:3001/api';
axios.defaults.timeout = 10000;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.post('/auth/verify-token', {
        token: localStorage.getItem('admin_token')
      });

      if (response.data.success && response.data.user.role === 'admin') {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('admin_token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      console.log('🔍 Tentando login com:', { cpf: credentials.cpf, password: '***' });
      console.log('🌐 URL da API:', axios.defaults.baseURL);
      
      const response = await axios.post('/auth/login', credentials);
      console.log('✅ Resposta do servidor:', response.data);

      if (response.data.success && response.data.user.role === 'admin') {
        const { token, user } = response.data;
        
        localStorage.setItem('admin_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('✅ Login realizado com sucesso!');
        return { success: true };
      } else {
        console.log('❌ Usuário não é admin:', response.data);
        return { 
          success: false, 
          message: 'Acesso negado. Apenas administradores podem acessar.' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      console.error('❌ Resposta do erro:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro no login'
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar se é página de teste
  if (window.location.pathname === '/test') {
    return <LoginTest />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          {/* Header */}
          <Header 
            user={user}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
