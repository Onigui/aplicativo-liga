// Script para debug dos dados
console.log('🔍 [DEBUG] Verificando dados no localStorage...');

// Verificar usuários
const users = localStorage.getItem('ligadobem_users');
console.log('👥 [DEBUG] Usuários no localStorage:', users ? JSON.parse(users) : 'VAZIO');

// Verificar empresas
const companies = localStorage.getItem('ligadobem_companies');
console.log('🏢 [DEBUG] Empresas no localStorage:', companies ? JSON.parse(companies) : 'VAZIO');

// Verificar tokens
const adminToken = localStorage.getItem('admin_token');
const userToken = localStorage.getItem('user_token');
console.log('🔐 [DEBUG] Admin token:', adminToken);
console.log('🔐 [DEBUG] User token:', userToken);

// Verificar dados do admin
const adminUser = localStorage.getItem('admin_user');
console.log('👤 [DEBUG] Admin user:', adminUser ? JSON.parse(adminUser) : 'VAZIO');

// Testar offlineAuth diretamente
import('./src/services/offlineAuth.js').then(module => {
  const offlineAuth = module.default;
  console.log('🧪 [DEBUG] Testando offlineAuth diretamente...');
  
  // Testar getCompanies
  offlineAuth.getCompanies().then(companies => {
    console.log('📊 [DEBUG] Empresas do offlineAuth:', companies.length);
    companies.forEach((company, index) => {
      console.log(`📋 [DEBUG] Empresa ${index + 1}:`, {
        id: company.id,
        name: company.companyName,
        status: company.status
      });
    });
  }).catch(error => {
    console.error('❌ [DEBUG] Erro ao testar offlineAuth:', error);
  });
}).catch(error => {
  console.error('❌ [DEBUG] Erro ao importar offlineAuth:', error);
});