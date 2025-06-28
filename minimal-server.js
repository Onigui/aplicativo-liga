const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota de teste
app.get('/api/test', (req, res) => {
  console.log('✅ Rota /api/test chamada');
  res.json({ 
    message: '🎉 Servidor minimalista funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  console.log('📥 Login request:', req.body);
  
  const { cpf, password } = req.body;
  
  // Simular credenciais válidas
  if (cpf === '12345678901' && password === '123456') {
    res.json({
      success: true,
      message: 'Login bem-sucedido!',
      user: {
        id: '1',
        name: 'João Silva',
        cpf: '123.456.789-01',
        isActive: true
      },
      token: 'fake-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'CPF ou senha incorretos'
    });
  }
});

// Rota de cadastro
app.post('/api/auth/register', (req, res) => {
  console.log('📥 Register request:', req.body);
  
  const { name, cpf, password } = req.body;
  
  if (!name || !cpf || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nome, CPF e senha são obrigatórios'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Usuário cadastrado com sucesso!',
    user: {
      id: Date.now().toString(),
      name: name,
      cpf: cpf,
      isActive: false
    }
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error('❌ Erro:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor minimalista rodando na porta ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Cadastro: http://localhost:${PORT}/api/auth/register`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
  });
});