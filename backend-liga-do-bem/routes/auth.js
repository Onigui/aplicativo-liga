const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Função para gerar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// POST /api/auth/login - Login de usuário
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { cpf, password } = req.body;

    // Validação básica
    if (!cpf || !password) {
      return res.status(400).json({
        success: false,
        message: 'CPF e senha são obrigatórios'
      });
    }

    // Limpar CPF (remover formatação)
    const cleanCPF = cpf.replace(/\D/g, '');

    // Buscar usuário pelo CPF
    const user = await User.findOne({ cpf: cleanCPF });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'CPF ou senha incorretos'
      });
    }

    // Verificar se a conta está bloqueada
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Conta temporariamente bloqueada devido a muitas tentativas de login incorretas'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar tentativas de login
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'CPF ou senha incorretos'
      });
    }

    // Verificar se a conta está ativa (pagamento em dia)
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Conta inativa. Regularize seu pagamento para continuar usando o app.',
        accountStatus: 'inactive'
      });
    }

    // Login bem-sucedido
    await user.resetLoginAttempts();
    
    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince.getFullYear(),
        totalDonated: user.totalDonated,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/register - Registro de novo usuário (apenas para admins)
router.post('/register', async (req, res) => {
  try {
    const { name, cpf, email, phone, password } = req.body;

    // Debug: log dos dados recebidos
    console.log('=== REGISTRO - Dados recebidos ===');
    console.log('Body completo:', req.body);
    console.log('name:', name, '(tipo:', typeof name, ')');
    console.log('cpf:', cpf, '(tipo:', typeof cpf, ')');
    console.log('password:', password ? '[DEFINIDA]' : '[VAZIA]', '(tipo:', typeof password, ')');
    console.log('================================');

    // Validação básica - verificar se existe e não é string vazia
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('❌ Validação falhou - nome:', name);
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    if (!cpf || typeof cpf !== 'string' || !cpf.trim()) {
      console.log('❌ Validação falhou - cpf:', cpf);
      return res.status(400).json({
        success: false,
        message: 'CPF é obrigatório'
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      console.log('❌ Validação falhou - password:', password);
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    console.log('✅ Validação básica passou!');

    // Limpar CPF
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verificar se o CPF já existe
    const existingUser = await User.findOne({ cpf: cleanCPF });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado no sistema'
      });
    }

    // Criar novo usuário
    const user = new User({
      name: name.trim(),
      cpf: cleanCPF,
      email: email?.trim().toLowerCase(),
      phone: phone?.replace(/\D/g, ''),
      password,
      isActive: false // Inativo até o primeiro pagamento
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado no sistema'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/verify-token - Verificar se o token ainda é válido
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se ainda está ativo
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Conta inativa',
        accountStatus: 'inactive'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince.getFullYear(),
        totalDonated: user.totalDonated,
        role: user.role
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/logout - Logout (invalidar token no cliente)
router.post('/logout', (req, res) => {
  // Em uma implementação real, você poderia manter uma blacklist de tokens
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;