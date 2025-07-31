import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import companiesRoutes from './routes/companies.js';
import usersRoutes from './routes/users.js';
import paymentsRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use('/api/', limiter);

// CORS configurado
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] Headers:`, req.headers);
    console.log(`[DEBUG] Body:`, req.body);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/admin/companies', companiesRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/payments', paymentsRoutes);
app.use('/api/admin/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Backend da Liga do Bem - Botucatu',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      path: req.originalUrl
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Backend da Liga do Bem iniciado!');
  console.log(`📍 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
