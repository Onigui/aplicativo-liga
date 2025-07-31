// ============================================
// TESTE COMPLETO DE SINCRONIZAÇÃO DE DADOS
// Cole este código no console do navegador (F12)
// ============================================

console.clear();
console.log('🔍 INICIANDO TESTE DE SINCRONIZAÇÃO...');

// Função para testar localStorage
function testarLocalStorage() {
  console.log('\n📊 ===== TESTE DO LOCALSTORAGE =====');
  
  // Verificar chaves existentes
  const keys = Object.keys(localStorage);
  console.log('🔑 Chaves no localStorage:', keys);
  
  // Verificar usuários
  const users = localStorage.getItem('ligadobem_users');
  if (users) {
    const userData = JSON.parse(users);
    console.log('👥 Usuários encontrados:', userData.length);
    userData.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.cpf})`);
    });
  } else {
    console.log('❌ Nenhum usuário encontrado');
  }
  
  // Verificar empresas
  const companies = localStorage.getItem('ligadobem_companies');
  if (companies) {
    const companyData = JSON.parse(companies);
    console.log('🏢 Empresas encontradas:', companyData.length);
    companyData.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.companyName} (${company.status})`);
    });
    
    // Estatísticas
    const approved = companyData.filter(c => c.status === 'approved').length;
    const pending = companyData.filter(c => c.status === 'pending').length;
    const rejected = companyData.filter(c => c.status === 'rejected').length;
    
    console.log(`📊 Estatísticas:`);
    console.log(`  ✅ Aprovadas: ${approved}`);
    console.log(`  ⏳ Pendentes: ${pending}`);
    console.log(`  ❌ Rejeitadas: ${rejected}`);
    
  } else {
    console.log('❌ Nenhuma empresa encontrada');
  }
  
  // Verificar tokens
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('user_token');
  const adminUser = localStorage.getItem('admin_user');
  
  console.log('🔐 Tokens:');
  console.log('  Admin Token:', adminToken ? 'SIM' : 'NÃO');
  console.log('  User Token:', userToken ? 'SIM' : 'NÃO');
  console.log('  Admin User:', adminUser ? 'SIM' : 'NÃO');
}

// Função para criar dados de teste
function criarDadosTeste() {
  console.log('\n🔧 ===== CRIANDO DADOS DE TESTE =====');
  
  const usuariosTeste = [
    {
      id: 1,
      name: 'Administrador',
      cpf: '00000000000',
      password: 'admin123',
      role: 'admin',
      isAdmin: true,
      isActive: true
    },
    {
      id: 2,
      name: 'João Silva',
      cpf: '11111111111',
      password: 'senha123',
      role: 'user',
      isAdmin: false,
      isActive: true
    },
    {
      id: 3,
      name: 'Maria Santos',
      cpf: '22222222222',
      password: 'senha123',
      role: 'user',
      isAdmin: false,
      isActive: true
    }
  ];
  
  const empresasTeste = [
    {
      id: '1',
      companyName: 'Pet Shop Exemplo',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123',
      phone: '(14) 99999-9999',
      email: 'contato@petshop.com',
      status: 'approved',
      coordinates: { latitude: -22.8858, longitude: -48.4406 },
      workingHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '16:00', closed: false },
        sunday: { open: '08:00', close: '12:00', closed: false }
      }
    },
    {
      id: '2',
      companyName: 'Clínica Veterinária VidaPet',
      cnpj: '98.765.432/0001-11',
      address: 'Av. Dom Lúcio, 456',
      phone: '(14) 3333-5678',
      email: 'contato@clinica.com',
      status: 'pending',
      coordinates: { latitude: -22.8912, longitude: -48.4421 },
      workingHours: {
        monday: { open: '07:00', close: '19:00', closed: false },
        tuesday: { open: '07:00', close: '19:00', closed: false },
        wednesday: { open: '07:00', close: '19:00', closed: false },
        thursday: { open: '07:00', close: '19:00', closed: false },
        friday: { open: '07:00', close: '19:00', closed: false },
        saturday: { open: '07:00', close: '17:00', closed: false },
        sunday: { open: '08:00', close: '12:00', closed: false }
      }
    },
    {
      id: '3',
      companyName: 'Ração & Cia',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Major Matheus, 789',
      phone: '(14) 3344-9012',
      email: 'contato@racao.com',
      status: 'approved',
      coordinates: { latitude: -22.8789, longitude: -48.4367 },
      workingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      }
    }
  ];
  
  localStorage.setItem('ligadobem_users', JSON.stringify(usuariosTeste));
  localStorage.setItem('ligadobem_companies', JSON.stringify(empresasTeste));
  
  console.log('✅ Dados de teste criados com sucesso!');
  console.log('👥 Usuários:', usuariosTeste.length);
  console.log('🏢 Empresas:', empresasTeste.length);
}

// Função para testar sincronização
function testarSincronizacao() {
  console.log('\n🔄 ===== TESTE DE SINCRONIZAÇÃO =====');
  
  // Simular acesso do usuário
  const empresas = localStorage.getItem('ligadobem_companies');
  if (empresas) {
    const empresasData = JSON.parse(empresas);
    const aprovadas = empresasData.filter(e => e.status === 'approved');
    
    console.log('👤 VISÃO DO USUÁRIO:');
    console.log(`  📊 Total de empresas: ${empresasData.length}`);
    console.log(`  ✅ Empresas aprovadas: ${aprovadas.length}`);
    console.log('  📋 Empresas aprovadas:');
    aprovadas.forEach((empresa, index) => {
      console.log(`    ${index + 1}. ${empresa.companyName}`);
    });
    
    console.log('\n🔧 VISÃO DO ADMIN:');
    console.log(`  📊 Total de empresas: ${empresasData.length}`);
    console.log('  📋 Todas as empresas:');
    empresasData.forEach((empresa, index) => {
      console.log(`    ${index + 1}. ${empresa.companyName} (${empresa.status})`);
    });
    
    console.log('\n🎯 RESULTADO:');
    if (aprovadas.length > 0 && empresasData.length > aprovadas.length) {
      console.log('✅ SINCRONIZAÇÃO FUNCIONANDO!');
      console.log('✅ Usuário vê apenas aprovadas');
      console.log('✅ Admin vê todas as empresas');
    } else {
      console.log('❌ PROBLEMA DE SINCRONIZAÇÃO');
    }
  } else {
    console.log('❌ Nenhuma empresa encontrada para teste');
  }
}

// Função para limpar dados
function limparDados() {
  console.log('\n🗑️ ===== LIMPANDO DADOS =====');
  localStorage.clear();
  console.log('✅ Todos os dados foram limpos!');
}

// Função para recarregar página
function recarregarPagina() {
  console.log('\n🔄 Recarregando página...');
  location.reload();
}

// Executar testes
console.log('🧪 TESTES DISPONÍVEIS:');
console.log('  testarLocalStorage() - Verificar dados atuais');
console.log('  criarDadosTeste() - Criar dados de teste');
console.log('  testarSincronizacao() - Testar sincronização');
console.log('  limparDados() - Limpar todos os dados');
console.log('  recarregarPagina() - Recarregar página');
console.log('\n🎯 EXECUTE: testarLocalStorage() para começar');

// Executar teste inicial
testarLocalStorage();