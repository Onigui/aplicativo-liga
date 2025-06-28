const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem');
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Já existe um usuário administrador:', existingAdmin.name);
      process.exit(1);
    }

    // Dados do admin
    const adminData = {
      name: 'Administrador Liga do Bem',
      cpf: '00000000000', // CPF fictício para admin
      email: 'admin@ligadobem.org.br',
      phone: '14981234567',
      password: 'admin123', // Senha padrão - ALTERE em produção!
      role: 'admin',
      isActive: true
    };

    // Criar admin
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Senha:', 'admin123');
    console.log('⚠️  ATENÇÃO: Altere a senha padrão após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

createAdmin();