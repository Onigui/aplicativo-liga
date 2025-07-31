import React, { useState } from 'react';
import { Shield, Heart, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    cpf: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Limpar CPF (remover formatação)
    const cleanCPF = formData.cpf.replace(/\D/g, '');
    
    console.log('🔑 [ADMIN] Tentativa de login:', { cpf: cleanCPF, password: '***' });

    // Login real via backend
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCPF, password: formData.password })
      });
      const data = await response.json();
      if (response.ok && data.success && data.token) {
        console.log('✅ [ADMIN] Login bem-sucedido!');
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'CPF ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCPF(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-900 via-admin-800 to-admin-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-admin-600" />
                <Heart className="h-8 w-8 text-primary-500" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h2>
          <p className="text-admin-200 text-lg">
            Liga do Bem - Botucatu
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 text-sm">
              Apenas administradores podem acessar este painel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF do Administrador
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="input-field"
                required
                maxLength="14"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-admin-600 hover:bg-admin-700 disabled:bg-admin-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Acessar Painel</span>
                </>
              )}
            </button>
          </form>

          {/* Ajuda */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Problemas para acessar? Entre em contato com o suporte
            </p>
            <p className="text-admin-600 text-sm font-medium mt-1">
              📧 admin@ligadobem.org.br | 📱 (14) 3815-1234
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-admin-200 text-sm">
            © 2024 Liga do Bem Botucatu - Sistema Administrativo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;