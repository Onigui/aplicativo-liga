const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configuração do multer para upload de comprovantes
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/receipts');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas imagens e PDFs
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.'));
    }
  }
});

// POST /api/payments/create - Criar novo pagamento
router.post('/create', auth, async (req, res) => {
  try {
    const { amount, type = 'monthly_fee', description } = req.body;
    const userId = req.user._id;

    // Validações
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero'
      });
    }

    // Verificar se já existe um pagamento pendente do mesmo tipo
    const existingPayment = await Payment.findOne({
      user: userId,
      type,
      status: 'pending'
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um pagamento pendente deste tipo',
        paymentId: existingPayment._id
      });
    }

    // Criar novo pagamento
    const payment = new Payment({
      user: userId,
      amount: parseFloat(amount),
      type,
      description: description || 'Mensalidade Liga do Bem',
      paymentMethod: 'manual', // Por padrão, será manual até integrar com gateway
      dueDate: new Date()
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      payment: {
        id: payment._id,
        amount: payment.amount,
        type: payment.type,
        description: payment.description,
        status: payment.status,
        dueDate: payment.dueDate,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    
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

// POST /api/payments/:id/upload-receipt - Upload de comprovante
router.post('/:id/upload-receipt', auth, upload.single('receipt'), async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user._id;

    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo de comprovante é obrigatório'
      });
    }

    // Buscar pagamento
    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId
    });

    if (!payment) {
      // Remover arquivo se pagamento não for encontrado
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      // Remover arquivo se pagamento já foi processado
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: 'Pagamento já foi processado'
      });
    }

    // Remover comprovante anterior se existir
    if (payment.receipt?.filename) {
      const oldFilePath = path.join(__dirname, '../uploads/receipts', payment.receipt.filename);
      await fs.unlink(oldFilePath).catch(console.error);
    }

    // Atualizar pagamento com o novo comprovante
    payment.receipt = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date()
    };

    await payment.save();

    res.json({
      success: true,
      message: 'Comprovante enviado com sucesso',
      receipt: {
        filename: payment.receipt.filename,
        originalName: payment.receipt.originalName,
        uploadDate: payment.receipt.uploadDate
      }
    });

  } catch (error) {
    // Remover arquivo em caso de erro
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo 5MB permitido.'
      });
    }

    console.error('Erro no upload do comprovante:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// GET /api/payments/:id - Obter detalhes de um pagamento
router.get('/:id', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user._id;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId
    }).populate('user', 'name cpf email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        type: payment.type,
        description: payment.description,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        isOverdue: payment.isOverdue,
        receipt: payment.receipt ? {
          originalName: payment.receipt.originalName,
          uploadDate: payment.receipt.uploadDate
        } : null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/payments/monthly/generate - Gerar cobrança mensal
router.post('/monthly/generate', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const monthlyFee = parseFloat(process.env.MONTHLY_FEE) || 25.00;

    // Verificar se já existe pagamento do mês atual
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const existingPayment = await Payment.findOne({
      user: userId,
      type: 'monthly_fee',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Cobrança mensal já existe para este mês',
        payment: {
          id: existingPayment._id,
          amount: existingPayment.amount,
          status: existingPayment.status,
          dueDate: existingPayment.dueDate
        }
      });
    }

    // Criar nova cobrança mensal
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5); // Vence em 5 dias

    const payment = new Payment({
      user: userId,
      amount: monthlyFee,
      type: 'monthly_fee',
      description: `Mensalidade Liga do Bem - ${currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      paymentMethod: 'manual',
      dueDate
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Cobrança mensal gerada com sucesso',
      payment: {
        id: payment._id,
        amount: payment.amount,
        description: payment.description,
        status: payment.status,
        dueDate: payment.dueDate,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao gerar cobrança mensal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/payments/:id - Cancelar pagamento pendente
router.delete('/:id', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user._id;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pagamentos pendentes podem ser cancelados'
      });
    }

    // Remover comprovante se existir
    if (payment.receipt?.filename) {
      const filePath = path.join(__dirname, '../uploads/receipts', payment.receipt.filename);
      await fs.unlink(filePath).catch(console.error);
    }

    // Cancelar pagamento
    payment.status = 'cancelled';
    await payment.save();

    res.json({
      success: true,
      message: 'Pagamento cancelado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;