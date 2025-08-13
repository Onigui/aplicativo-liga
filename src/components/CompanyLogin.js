import React, { useState } from 'react';
import { Building, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const CompanyLogin = ({ onLogin, onBack, companies = [] }) => {
  const [formData, setFormData] = useState({
    cnpj: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Usar empresas reais se fornecidas, senão usar mock para demonstração
  const availableCompanies = companies.length > 0 ? companies : [
    {
      id: 'company_123',
      cnpj: '12.345.678/0001-90',
      name: 'Empresa Exemplo LTDA',
      email: 'contato@empresa.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Empresas, 123',
      city: 'São Paulo',
      state: 'SP',
      category: 'Alimentação',
      discount: 15,
      password: '123456', // Em produção, seria hash
      workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '17:00', isOpen: true },
        sunday: { open: '10:00', close: '16:00', isOpen: false }
      },
      description: 'Empresa parceira da Liga do Bem',
      logo: null,
      status: 'approved',
      role: 'company'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar CNPJ
      const cleanCnpj = formData.cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) {
        throw new Error('CNPJ inválido');
      }

      // Buscar empresa no banco de dados
      const company = availableCompanies.find(comp => 
        comp.cnpj.replace(/\D/g, '') === cleanCnpj
      );

      if (!company) {
        throw new Error('Empresa não encontrada. Verifique o CNPJ ou cadastre-se primeiro.');
      }

      // Validar senha
      if (company.password !== formData.password) {
        throw new Error('Senha incorreta');
      }

      // Login bem-sucedido
      const { password, ...companyData } = company; // Remove a senha dos dados retornados
      onLogin(companyData);
      
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (value) => {
    const clean = value.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Área Empresarial</h1>
          <p className="text-gray-600 mt-2">Faça login para acessar sua área</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Entrar na Área Empresarial</span>
              </>
            )}
          </button>
        </form>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Voltar para o login principal
          </button>
        </div>

        {/* Informações */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Área Empresarial</h3>
          <p className="text-sm text-blue-700">
            Acesse para gerenciar seus dados, horários, descontos e validar carteirinhas dos clientes.
          </p>
          <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Dados de teste:</strong><br/>
              CNPJ: 12.345.678/0001-90<br/>
              Senha: 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin; 