// Script para atualizar configurações no Render
// Este script gera as instruções para atualizar as variáveis de ambiente

console.log('🔧 INSTRUÇÕES PARA ATUALIZAR CONFIGURAÇÕES NO RENDER');
console.log('====================================================\n');

console.log('1️⃣ ACESSE O DASHBOARD DO RENDER:');
console.log('   https://dashboard.render.com\n');

console.log('2️⃣ ATUALIZE AS VARIÁVEIS DE AMBIENTE:');
console.log('   - Vá para o serviço "liga-do-bem-api"');
console.log('   - Clique em "Environment"');
console.log('   - Atualize a variável DATABASE_URL com a nova URL do banco\n');

console.log('3️⃣ NOVA CONFIGURAÇÃO DO BANCO:');
console.log('   - Nome: liga-do-bem-db-v2');
console.log('   - Plano: Free (ou Starter)');
console.log('   - Região: mesma do app atual\n');

console.log('4️⃣ VARIÁVEIS DE AMBIENTE NECESSÁRIAS:');
console.log('   DATABASE_URL=postgresql://usuario:senha@host:porta/banco');
console.log('   NODE_ENV=production');
console.log('   PORT=3001');
console.log('   JWT_SECRET=sua_chave_secreta');
console.log('   JWT_EXPIRES_IN=7d');
console.log('   CORS_ORIGINS=https://liga-do-bem-app.onrender.com\n');

console.log('5️⃣ DEPLOY AUTOMÁTICO:');
console.log('   - O Render fará deploy automático após salvar as variáveis');
console.log('   - Monitore os logs para verificar se tudo está funcionando\n');

console.log('6️⃣ TESTE A APLICAÇÃO:');
console.log('   - Acesse: https://liga-do-bem-api.onrender.com/api/health');
console.log('   - Verifique se retorna status OK');
console.log('   - Teste login e funcionalidades principais\n');

console.log('✅ CONFIGURAÇÃO CONCLUÍDA!');

