// Script de teste para verificar sincronização
console.log('🧪 TESTE DE SINCRONIZAÇÃO');

// Limpar localStorage
localStorage.removeItem('companiesData');
console.log('🗑️ localStorage limpo');

// Dados de teste
const testData = [
  {
    id: '1',
    companyName: 'Teste Pet Shop',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Teste, 123',
    phone: '(14) 1234-5678',
    email: 'teste@petshop.com',
    discount: '15% em todos os produtos',
    description: 'Pet shop de teste',
    status: 'approved',
    createdAt: '2024-01-20T10:00:00Z',
    approvedAt: '2024-01-20T11:00:00Z',
    approvedBy: 'admin@test.com'
  },
  {
    id: '2',
    companyName: 'Empresa Pendente',
    cnpj: '98.765.432/0001-10',
    address: 'Av. Teste, 456',
    phone: '(14) 9876-5432',
    email: 'pendente@teste.com',
    discount: '10% em serviços',
    description: 'Empresa em análise',
    status: 'pending',
    createdAt: '2024-01-20T12:00:00Z',
    approvedAt: null,
    approvedBy: null
  }
];

// Salvar dados de teste
localStorage.setItem('companiesData', JSON.stringify(testData));
console.log('💾 Dados de teste salvos no localStorage');

// Verificar dados salvos
const saved = JSON.parse(localStorage.getItem('companiesData'));
console.log('📋 Dados salvos:', saved);
console.log('✅ Empresas aprovadas:', saved.filter(c => c.status === 'approved').length);
console.log('⏳ Empresas pendentes:', saved.filter(c => c.status === 'pending').length);

console.log('🎯 Agora atualize a página "Parceiras" no app principal');