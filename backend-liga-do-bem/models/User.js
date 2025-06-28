const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Dados pessoais
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    validate: {
      validator: function(cpf) {
        // Remove formatação e valida se tem 11 dígitos
        const cleanCPF = cpf.replace(/\D/g, '');
        return cleanCPF.length === 11;
      },
      message: 'CPF deve ter 11 dígitos'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // Email é opcional
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Email inválido'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        if (!phone) return true; // Telefone é opcional
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
      },
      message: 'Telefone deve ter entre 10 e 11 dígitos'
    }
  },
  
  // Autenticação
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  
  // Status da conta
  isActive: {
    type: Boolean,
    default: false
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  lastPayment: {
    type: Date,
    default: null
  },
  nextPaymentDue: {
    type: Date,
    default: function() {
      // Próximo pagamento em 30 dias
      const next = new Date();
      next.setDate(next.getDate() + 30);
      return next;
    }
  },
  
  // Pagamentos
  totalDonated: {
    type: Number,
    default: 0,
    min: [0, 'Total doado não pode ser negativo']
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  // Configurações da conta
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  profileImage: {
    type: String,
    default: null
  },
  
  // Controle de acesso
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
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
userSchema.index({ cpf: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ nextPaymentDue: 1 });

// Virtual para verificar se a conta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual para verificar se o pagamento está em atraso
userSchema.virtual('isPaymentOverdue').get(function() {
  if (!this.nextPaymentDue) return false;
  return new Date() > this.nextPaymentDue;
});

// Virtual para formatar CPF
userSchema.virtual('formattedCPF').get(function() {
  const cpf = this.cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
});

// Pre-save middleware para hash da senha
userSchema.pre('save', async function(next) {
  // Se a senha não foi modificada, continue
  if (!this.isModified('password')) return next();
  
  try {
    // Hash da senha
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware para limpar CPF
userSchema.pre('save', function(next) {
  if (this.isModified('cpf')) {
    this.cpf = this.cpf.replace(/\D/g, '');
  }
  this.updatedAt = new Date();
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar tentativas de login
userSchema.methods.incLoginAttempts = function() {
  // Se já temos um lock anterior e expirou, resetar tentativas
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Se atingiu o máximo de tentativas e não está bloqueado, bloquear por 2 horas
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 horas
    };
  }
  
  return this.updateOne(updates);
};

// Método para resetar tentativas de login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Método para ativar conta
userSchema.methods.activateAccount = function(months = 1) {
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + months);
  
  return this.updateOne({
    $set: {
      isActive: true,
      lastPayment: new Date(),
      nextPaymentDue: nextDue
    }
  });
};

// Método para desativar conta
userSchema.methods.deactivateAccount = function() {
  return this.updateOne({
    $set: {
      isActive: false
    }
  });
};

// Método toJSON para remover campos sensíveis
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

module.exports = mongoose.model('User', userSchema);