// Script para testar conexões
const http = require('http');

function testConnection(port, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${name} está funcionando na porta ${port} (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} NÃO está funcionando na porta ${port}: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏱️ ${name} timeout na porta ${port}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function testAll() {
  console.log('🧪 Testando conexões...\n');
  
  const backend = await testConnection(3001, 'Backend');
  const frontend = await testConnection(3002, 'Frontend');
  
  console.log('\n📊 Resumo:');
  console.log(`Backend (3001): ${backend ? '✅ OK' : '❌ ERRO'}`);
  console.log(`Frontend (3002): ${frontend ? '✅ OK' : '❌ ERRO'}`);
  
  if (!backend) {
    console.log('\n🔧 Para corrigir o backend:');
    console.log('cd backend && npm start');
  }
  
  if (!frontend) {
    console.log('\n🔧 Para corrigir o frontend:');
    console.log('cd admin-panel-liga-do-bem && npm start');
  }
}

testAll();