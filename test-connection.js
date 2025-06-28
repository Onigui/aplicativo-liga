const http = require('http');

console.log('🔍 Testando conexão com http://localhost:3333/api/test...');

const options = {
  hostname: 'localhost',
  port: 3333,
  path: '/api/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Resposta:', response);
      console.log('🎉 Backend está funcionando!');
    } catch (error) {
      console.log('📦 Resposta raw:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
});

req.setTimeout(5000, () => {
  console.error('❌ Timeout - servidor não respondeu em 5 segundos');
  req.destroy();
});

req.end();