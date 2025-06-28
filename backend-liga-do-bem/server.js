const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: true, // Permitir todas as origens em desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de log para todas as requisições (depois do parsing do body)
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('📦 Body:', req.body);
  next();
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem')
.then(() => {
  console.log('✅ Conectado ao MongoDB');
})
.catch((error) => {
  console.error('❌ Erro ao conectar ao MongoDB:', error);
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🎉 API Liga do Bem funcionando!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota temporária para criar usuário de teste
app.post('/api/create-test-user', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Verificar se já existe
    const existingUser = await User.findOne({ cpf: '12345678901' });
    if (existingUser) {
      return res.json({ 
        success: true,
        message: 'Usuário de teste já existe',
        user: {
          cpf: existingUser.formattedCPF,
          name: existingUser.name
        }
      });
    }

    // Criar usuário de teste
    const testUser = new User({
      name: 'Usuário Teste',
      cpf: '12345678901',
      email: 'teste@ligadobem.org',
      password: '123456',
      isActive: true
    });

    await testUser.save();

    res.json({
      success: true,
      message: 'Usuário de teste criado!',
      user: {
        cpf: testUser.formattedCPF,
        name: testUser.name
      },
      credentials: {
        cpf: '123.456.789-01',
        password: '123456'
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(`🌐 Servidor escutando em todas as interfaces`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso`);
  } else {
    console.error('❌ Erro ao iniciar servidor:', err);
  }
});

module.exports = app;