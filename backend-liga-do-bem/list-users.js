const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem');
    console.log('✅ Conectado ao MongoDB');

    // Listar todos os usuários
    const users = await User.find({}).select('name cpf email isActive createdAt');
    
    if (users.length === 0) {
      console.log('📝 Nenhum usuário encontrado no banco de dados');
    } else {
      console.log(`📋 ${users.length} usuário(s) encontrado(s):`);
      console.log('');
      
      users.forEach((user, index) => {
        console.log(`👤 Usuário ${index + 1}:`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   CPF: ${user.formattedCPF}`);
        console.log(`   Email: ${user.email || 'Não informado'}`);
        console.log(`   Ativo: ${user.isActive ? '✅ Sim' : '❌ Não'}`);
        console.log(`   Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    }
    
    mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    mongoose.disconnect();
  }
}

listUsers();