const express = require('express');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { auth, activeAccountAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile - Obter perfil do usuário
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('payments', 'amount status paidAt createdAt type')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
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
        memberSince: user.memberSince,
        totalDonated: user.totalDonated,
        lastPayment: user.lastPayment,
        nextPaymentDue: user.nextPaymentDue,
        isPaymentOverdue: user.isPaymentOverdue,
        recentPayments: user.payments.slice(-5), // Últimos 5 pagamentos
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/profile - Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user._id;

    // Validações
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (phone) updates.phone = phone.replace(/\D/g, '');

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        cpf: user.formattedCPF,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        memberSince: user.memberSince,
        totalDonated: user.totalDonated
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
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

// PUT /api/users/change-password - Alterar senha
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/payments - Obter histórico de pagamentos
router.get('/payments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('amount status paidAt createdAt type description dueDate');

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/payment-status - Verificar status de pagamento
router.get('/payment-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar último pagamento pendente
    const pendingPayment = await Payment.findOne({
      user: user._id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      status: {
        isActive: user.isActive,
        isPaymentOverdue: user.isPaymentOverdue,
        nextPaymentDue: user.nextPaymentDue,
        lastPayment: user.lastPayment,
        pendingPayment: pendingPayment ? {
          id: pendingPayment._id,
          amount: pendingPayment.amount,
          dueDate: pendingPayment.dueDate,
          isOverdue: pendingPayment.isOverdue
        } : null
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status de pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/account - Desativar conta (soft delete)
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Desativar conta
    await user.deactivateAccount();

    // Log da desativação
    console.log(`Conta desativada - Usuário: ${user.name}, CPF: ${user.formattedCPF}, Motivo: ${reason || 'Não informado'}`);

    res.json({
      success: true,
      message: 'Conta desativada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;