const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar autenticação
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
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

    // Adicionar usuário ao request
    req.user = user;
    next();

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

    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se é admin
const adminAuth = async (req, res, next) => {
  try {
    // Primeiro verificar autenticação normal
    await auth(req, res, () => {
      // Verificar se é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar conta ativa
const activeAccountAuth = async (req, res, next) => {
  try {
    // Primeiro verificar autenticação normal
    await auth(req, res, () => {
      // Verificar se a conta está ativa
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Conta inativa. Regularize seu pagamento.',
          accountStatus: 'inactive'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de conta ativa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = { auth, adminAuth, activeAccountAuth };