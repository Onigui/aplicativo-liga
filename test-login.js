// Script para testar o login
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testando login...');
    
    // Testar conexão
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend conectado:', health.data);
    
    // Testar login admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      cpf: '12345678901',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido:', loginResponse.data);
    
    // Testar token
    const token = loginResponse.data.token;
    const verifyResponse = await axios.post('http://localhost:3001/api/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Token válido:', verifyResponse.data);
    
    // Testar pagamentos
    const paymentsResponse = await axios.get('http://localhost:3001/api/admin/payments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Pagamentos encontrados:', paymentsResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testLogin();