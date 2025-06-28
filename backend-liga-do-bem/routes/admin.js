const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const Payment = require('../models/Payment');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard - Dashboard com estatísticas
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Estatísticas gerais
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    // Pagamentos pendentes
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const overduePayments = await Payment.countDocuments({
      status: 'pending',
      dueDate: { $lt: currentDate }
    });

    // Receita do mês atual
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          paidAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Receita total
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Usuários com pagamento em atraso
    const usersWithOverduePayments = await User.find({
      nextPaymentDue: { $lt: currentDate },
      isActive: true
    }).countDocuments();

    res.json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          withOverduePayments: usersWithOverduePayments
        },
        payments: {
          pending: pendingPayments,
          overdue: overduePayments
        },
        revenue: {
          monthly: monthlyRevenue[0]?.total || 0,
          total: totalRevenue[0]?.total || 0
        },
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users - Listar todos os usuários
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Construir query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search.replace(/\D/g, ''), $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.isActive = status === 'active';
    }

    // Construir sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince,
        lastPayment: user.lastPayment,
        nextPaymentDue: user.nextPaymentDue,
        totalDonated: user.totalDonated,
        isPaymentOverdue: user.isPaymentOverdue,
        createdAt: user.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/payments - Listar todos os pagamentos
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Construir query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // Construir sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const payments = await Payment.find(query)
      .populate('user', 'name cpf email phone')
      .populate('approvedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        user: {
          id: payment.user._id,
          name: payment.user.name,
          cpf: payment.user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
          email: payment.user.email,
          phone: payment.user.phone
        },
        amount: payment.amount,
        type: payment.type,
        description: payment.description,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        isOverdue: payment.isOverdue,
        receipt: payment.receipt ? {
          originalName: payment.receipt.originalName,
          uploadDate: payment.receipt.uploadDate
        } : null,
        approvedBy: payment.approvedBy?.name,
        approvedAt: payment.approvedAt,
        rejectedReason: payment.rejectedReason,
        createdAt: payment.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/admin/payments/:id/approve - Aprovar pagamento
router.put('/payments/:id/approve', adminAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { notes } = req.body;
    const adminId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pagamentos pendentes podem ser aprovados'
      });
    }

    // Aprovar pagamento
    await payment.approve(adminId, notes);

    res.json({
      success: true,
      message: 'Pagamento aprovado com sucesso',
      payment: {
        id: payment._id,
        status: payment.status,
        paidAt: payment.paidAt,
        approvedAt: payment.approvedAt
      }
    });

  } catch (error) {
    console.error('Erro ao aprovar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/admin/payments/:id/reject - Rejeitar pagamento
router.put('/payments/:id/reject', adminAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pagamentos pendentes podem ser rejeitados'
      });
    }

    // Rejeitar pagamento
    await payment.reject(reason, adminId);

    res.json({
      success: true,
      message: 'Pagamento rejeitado com sucesso',
      payment: {
        id: payment._id,
        status: payment.status,
        rejectedReason: payment.rejectedReason,
        approvedAt: payment.approvedAt
      }
    });

  } catch (error) {
    console.error('Erro ao rejeitar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/payments/:id/receipt - Baixar comprovante
router.get('/payments/:id/receipt', adminAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (!payment.receipt?.filename) {
      return res.status(404).json({
        success: false,
        message: 'Comprovante não encontrado'
      });
    }

    const filePath = path.join(__dirname, '../uploads/receipts', payment.receipt.filename);
    
    try {
      await fs.access(filePath);
      res.download(filePath, payment.receipt.originalName);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Arquivo de comprovante não encontrado no sistema'
      });
    }

  } catch (error) {
    console.error('Erro ao baixar comprovante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/users - Criar novo usuário
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, cpf, email, phone, password, isActive = false } = req.body;

    // Validação básica
    if (!name || !cpf || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, CPF e senha são obrigatórios'
      });
    }

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
      isActive
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
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

// PUT /api/admin/users/:id/toggle-status - Ativar/Desativar usuário
router.put('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (isActive) {
      await user.activateAccount(1);
    } else {
      await user.deactivateAccount();
    }

    res.json({
      success: true,
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        id: user._id,
        name: user.name,
        isActive: isActive
      }
    });

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;