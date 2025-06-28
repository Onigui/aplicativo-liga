const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 8888;

console.log('🚀 Iniciando servidor super simples...');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`📥 ${new Date().toISOString()} - ${method} ${path}`);
  
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Preflight CORS
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Rota de teste
  if (path === '/api/test' && method === 'GET') {
    console.log('✅ Respondendo rota de teste');
    res.writeHead(200);
    res.end(JSON.stringify({
      message: '🎉 Servidor funcionando!',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Rotas que precisam do body
  if (method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('📦 Body recebido:', body);
      
      let data = {};
      try {
        data = JSON.parse(body);
        console.log('📋 Dados parseados:', data);
      } catch (error) {
        console.error('❌ Erro ao parsear JSON:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'JSON inválido' }));
        return;
      }
      
      // LOGIN
      if (path === '/api/auth/login') {
        console.log('🔐 Processando login...');
        const { cpf, password } = data;
        
        if (cpf === '12345678901' && password === '123456') {
          console.log('✅ Login bem-sucedido!');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'Login realizado com sucesso!',
            user: {
              id: '1',
              name: 'João Silva',
              cpf: '123.456.789-01',
              isActive: true
            },
            token: 'fake-jwt-token-123'
          }));
        } else {
          console.log('❌ Credenciais inválidas');
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'CPF ou senha incorretos'
          }));
        }
        return;
      }
      
      // CADASTRO
      if (path === '/api/auth/register') {
        console.log('📝 Processando cadastro...');
        const { name, cpf, password } = data;
        
        if (!name || !cpf || !password) {
          console.log('❌ Dados obrigatórios faltando');
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: 'Nome, CPF e senha são obrigatórios'
          }));
          return;
        }
        
        console.log('✅ Cadastro realizado!');
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: 'Usuário cadastrado com sucesso!',
          user: {
            id: Date.now().toString(),
            name: name,
            cpf: cpf,
            isActive: false
          }
        }));
        return;
      }
      
      // Rota não encontrada
      console.log('❌ Rota não encontrada:', path);
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: 'Rota não encontrada' }));
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: 'Erro interno' }));
    });
    
    return;
  }
  
  // Método não suportado
  console.log('❌ Método não suportado:', method);
  res.writeHead(405);
  res.end(JSON.stringify({ success: false, message: 'Método não permitido' }));
});

server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    return;
  }
  
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📍 Teste: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Cadastro: http://localhost:${PORT}/api/auth/register`);
  
  // Testar se está realmente funcionando
  setTimeout(() => {
    const testReq = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/test',
      method: 'GET'
    }, (testRes) => {
      console.log('🧪 Auto-teste bem-sucedido! Status:', testRes.statusCode);
    });
    
    testReq.on('error', (error) => {
      console.error('🧪 Auto-teste falhou:', error.message);
    });
    
    testReq.end();
  }, 1000);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso!`);
  } else {
    console.error('❌ Erro no servidor:', error);
  }
});