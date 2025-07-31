import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const LoginTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testando...');

    try {
      // Testar conexão primeiro
      const healthCheck = await axios.get(`${API_BASE_URL}/api/health`);
      setResult(prev => prev + '\n✅ Backend conectado: ' + JSON.stringify(healthCheck.data));

      // Testar login
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        cpf: '12345678901',
        password: 'admin123'
      });
      
      setResult(prev => prev + '\n✅ Login funcionando: ' + JSON.stringify(loginResponse.data));
      
    } catch (error) {
      setResult(prev => prev + '\n❌ Erro: ' + (error.response?.data?.message || error.message));
      console.error('Erro completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const testQuickLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        cpf: '12345678901',
        password: 'admin123'
      });
      setResult('✅ Login via axios configurado: ' + JSON.stringify(response.data));
      
      // Testar pagamentos também
      const token = response.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const paymentsResponse = await axios.get('/admin/payments');
      setResult(prev => prev + '\n✅ Pagamentos carregados: ' + JSON.stringify(paymentsResponse.data));
      
    } catch (error) {
      setResult('❌ Erro no teste: ' + (error.response?.data?.message || error.message));
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Teste de Login - Liga do Bem</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Credenciais de Teste</h2>
          <div className="space-y-2">
            <p><strong>CPF Admin:</strong> 12345678901</p>
            <p><strong>Senha Admin:</strong> admin123</p>
            <p><strong>Backend:</strong> {API_BASE_URL}</p>
            <p><strong>Frontend:</strong> {window.location.origin}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Conexão Direta'}
          </button>

          <button
            onClick={testQuickLogin}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testando...' : 'Testar Login via Axios'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instruções:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Certifique-se que o backend está rodando na porta 3001</li>
            <li>Abra o console do navegador (F12) para ver logs detalhados</li>
            <li>Teste primeiro a "Conexão Direta" para verificar se o backend responde</li>
            <li>Depois teste o "Login via Axios" para verificar a configuração</li>
            <li>Se ambos funcionarem, o problema está no componente de Login principal</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;