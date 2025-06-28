const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');
require('dotenv').config();

const sampleUsers = [
  {
    name: 'João Silva',
    cpf: '12345678901',
    email: 'joao.silva@email.com',
    phone: '14987654321',
    password: '123456',
    isActive: true,
    totalDonated: 150.00
  },
  {
    name: 'Maria Santos',
    cpf: '10987654321',
    email: 'maria.santos@email.com',
    phone: '14912345678',
    password: '123456',
    isActive: true,
    totalDonated: 275.50
  },
  {
    name: 'Pedro Oliveira',
    cpf: '11122233344',
    email: 'pedro.oliveira@email.com',
    phone: '14999887766',
    password: '123456',
    isActive: false,
    totalDonated: 50.00
  },
  {
    name: 'Ana Costa',
    cpf: '55566677788',
    email: 'ana.costa@email.com',
    phone: '14988776655',
    password: '123456',
    isActive: true,
    totalDonated: 320.00
  },
  {
    name: 'Carlos Pereira',
    cpf: '99988877766',
    email: 'carlos.pereira@email.com',
    phone: '14977665544',
    password: '123456',
    isActive: true,
    totalDonated: 85.00
  }
];

async function seedDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-do-bem');
    console.log('✅ Conectado ao MongoDB');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await Payment.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // Manter apenas admins

    // Criar usuários de exemplo
    console.log('👥 Criando usuários de exemplo...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Usuário criado: ${user.name} (${user.formattedCPF})`);
    }

    // Criar pagamentos de exemplo
    console.log('💰 Criando pagamentos de exemplo...');
    
    for (const user of createdUsers) {
      // Pagamentos aprovados (histórico)
      const approvedPayments = Math.floor(Math.random() * 5) + 1; // 1-5 pagamentos
      
      for (let i = 0; i < approvedPayments; i++) {
        const payment = new Payment({
          user: user._id,
          amount: 25.00,
          type: 'monthly_fee',
          description: `Mensalidade Liga do Bem - ${new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          status: 'approved',
          paymentMethod: 'pix',
          dueDate: new Date(2024, i, 5),
          paidAt: new Date(2024, i, Math.floor(Math.random() * 10) + 1)
        });
        
        await payment.save();
      }

      // Alguns usuários com pagamento pendente
      if (Math.random() > 0.6) { // 40% chance
        const pendingPayment = new Payment({
          user: user._id,
          amount: 25.00,
          type: 'monthly_fee',
          description: 'Mensalidade Liga do Bem - Janeiro 2025',
          status: 'pending',
          paymentMethod: 'manual',
          dueDate: new Date(2025, 0, 5) // 5 de janeiro de 2025
        });
        
        await pendingPayment.save();
        console.log(`💳 Pagamento pendente criado para: ${user.name}`);
      }

      // Algumas doações extras
      if (Math.random() > 0.7) { // 30% chance
        const donation = new Payment({
          user: user._id,
          amount: Math.floor(Math.random() * 100) + 20, // R$ 20-120
          type: 'donation',
          description: 'Doação especial para os animais',
          status: 'approved',
          paymentMethod: 'pix',
          dueDate: new Date(),
          paidAt: new Date()
        });
        
        await donation.save();
        console.log(`🎁 Doação criada para: ${user.name} - R$ ${donation.amount}`);
      }
    }

    // Estatísticas finais
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`👥 Total de usuários: ${totalUsers}`);
    console.log(`💰 Total de pagamentos: ${totalPayments}`);
    console.log(`💸 Receita total: R$ ${totalRevenue[0]?.total.toFixed(2) || '0.00'}`);
    
    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('\n📋 USUÁRIOS DE TESTE:');
    
    for (const user of createdUsers) {
      console.log(`• ${user.name} - CPF: ${user.formattedCPF} - Senha: 123456 - Status: ${user.isActive ? 'Ativo' : 'Inativo'}`);
    }

    console.log('\n⚠️  Use estes dados para testar o aplicativo!');

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

seedDatabase();