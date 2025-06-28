const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Referência ao usuário
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  
  // Dados do pagamento
  amount: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor não pode ser negativo']
  },
  type: {
    type: String,
    enum: ['monthly_fee', 'donation', 'registration'],
    default: 'monthly_fee'
  },
  description: {
    type: String,
    default: 'Mensalidade Liga do Bem'
  },
  
  // Status do pagamento
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Método de pagamento
  paymentMethod: {
    type: String,
    enum: ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'manual'],
    required: [true, 'Método de pagamento é obrigatório']
  },
  
  // Dados do Mercado Pago
  mercadoPagoId: {
    type: String,
    default: null
  },
  mercadoPagoStatus: {
    type: String,
    default: null
  },
  
  // Comprovante manual
  receipt: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date
  },
  
  // Datas importantes
  dueDate: {
    type: Date,
    required: [true, 'Data de vencimento é obrigatória']
  },
  paidAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expira em 30 dias após a data de vencimento
      const expires = new Date(this.dueDate);
      expires.setDate(expires.getDate() + 30);
      return expires;
    }
  },
  
  // Controle administrativo
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    default: null
  },
  
  // Dados adicionais
  notes: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  
  // Auditoria
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });
paymentSchema.index({ mercadoPagoId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual para verificar se está vencido
paymentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate && this.status === 'pending';
});

// Virtual para verificar se está expirado
paymentSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt && this.status === 'pending';
});

// Virtual para calcular dias de atraso
paymentSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Se o pagamento foi aprovado, definir paidAt
  if (this.isModified('status') && this.status === 'approved' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  next();
});

// Método para aprovar pagamento
paymentSchema.methods.approve = async function(approvedByUserId, notes = null) {
  this.status = 'approved';
  this.paidAt = new Date();
  this.approvedBy = approvedByUserId;
  this.approvedAt = new Date();
  if (notes) this.notes = notes;
  
  await this.save();
  
  // Ativar/renovar conta do usuário
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  if (user) {
    await user.activateAccount(1); // Ativar por 1 mês
    
    // Adicionar ao total doado
    user.totalDonated += this.amount;
    await user.save();
  }
  
  return this;
};

// Método para rejeitar pagamento
paymentSchema.methods.reject = async function(rejectedReason, rejectedByUserId) {
  this.status = 'rejected';
  this.rejectedReason = rejectedReason;
  this.approvedBy = rejectedByUserId;
  this.approvedAt = new Date();
  
  return this.save();
};

// Método estático para buscar pagamentos pendentes
paymentSchema.statics.findPendingPayments = function() {
  return this.find({ 
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('user', 'name cpf email phone');
};

// Método estático para buscar pagamentos vencidos
paymentSchema.statics.findOverduePayments = function() {
  return this.find({ 
    status: 'pending',
    dueDate: { $lt: new Date() },
    expiresAt: { $gt: new Date() }
  }).populate('user', 'name cpf email phone');
};

// Método estático para estatísticas mensais
paymentSchema.statics.getMonthlyStats = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);