const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem');
    console.log('✅ Conectado ao MongoDB');

    // Buscar o usuário João Silva
    const user = await User.findOne({ cpf: '12345678901' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      mongoose.disconnect();
      return;
    }

    // Definir nova senha
    user.password = '123456';
    await user.save();

    console.log('🎉 Senha resetada com sucesso!');
    console.log('📋 Credenciais para login:');
    console.log(`   Nome: ${user.name}`);
    console.log(`   CPF: ${user.formattedCPF}`);
    console.log('   Senha: 123456');
    console.log(`   Status: ${user.isActive ? 'Ativo' : 'Inativo'}`);
    
    mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    mongoose.disconnect();
  }
}

resetPassword();