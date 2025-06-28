const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Configurar CORS para permitir requisições do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Responder OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Rota de teste
  if (path === '/api/test') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: '🎉 Servidor simples funcionando!',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Rota de login
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📦 Dados de login recebidos:', data);
        
        // Simular login bem-sucedido
        if (data.cpf === '12345678901' && data.password === '123456') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'Login bem-sucedido!',
            user: {
              id: '1',
              name: 'João Silva',
              cpf: '123.456.789-01',
              isActive: true
            },
            token: 'fake-jwt-token'
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'CPF ou senha incorretos'
          }));
        }
      } catch (error) {
        console.error('❌ Erro ao processar login:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Dados inválidos'
        }));
      }
    });
    return;
  }
  
  // Rota de cadastro
  if (path === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📦 Dados de cadastro recebidos:', data);
        
        // Simular cadastro bem-sucedido
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Usuário cadastrado com sucesso!',
          user: {
            id: Date.now().toString(),
            name: data.name,
            cpf: data.cpf,
            isActive: false
          }
        }));
      } catch (error) {
        console.error('❌ Erro ao processar cadastro:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Dados inválidos'
        }));
      }
    });
    return;
  }
  
  // Rota não encontrada
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'Rota não encontrada'
  }));
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`📍 Teste: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Cadastro: http://localhost:${PORT}/api/auth/register`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});