const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem');
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe
    const existingUser = await User.findOne({ cpf: '12345678901' });
    if (existingUser) {
      console.log('👤 Usuário de teste já existe:');
      console.log('   CPF:', existingUser.formattedCPF);
      console.log('   Nome:', existingUser.name);
      console.log('   Ativo:', existingUser.isActive);
      mongoose.disconnect();
      return;
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

    console.log('🎉 Usuário de teste criado com sucesso!');
    console.log('📋 Credenciais para login:');
    console.log('   CPF: 123.456.789-01');
    console.log('   Senha: 123456');
    
    mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    mongoose.disconnect();
  }
}

createTestUser();