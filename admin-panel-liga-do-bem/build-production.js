const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de produção...\n');

// Verificar se é Windows ou Linux
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

try {
  // 1. Verificar se as dependências estão instaladas
  console.log('📦 Verificando dependências...');
  if (!fs.existsSync('./node_modules')) {
    console.log('Instalando dependências...');
    execSync(`${npmCmd} install`, { stdio: 'inherit' });
  }

  // 2. Limpar build anterior
  console.log('🧹 Limpando build anterior...');
  if (fs.existsSync('./build')) {
    fs.rmSync('./build', { recursive: true, force: true });
  }

  // 3. Verificar arquivo .env
  console.log('⚙️ Verificando configurações...');
  if (!fs.existsSync('./.env')) {
    console.log('Criando arquivo .env...');
    const envContent = `PORT=3002
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_NAME=Liga do Bem - Painel Admin
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
`;
    fs.writeFileSync('./.env', envContent);
  }

  // 4. Executar build
  console.log('🔨 Executando build...');
  execSync(`${npmCmd} run build`, { stdio: 'inherit' });

  // 5. Verificar se build foi criado
  if (fs.existsSync('./build')) {
    console.log('\n✅ Build concluído com sucesso!');
    
    // 6. Mostrar informações do build
    const buildStats = fs.statSync('./build');
    console.log(`📁 Pasta de build criada em: ${buildStats.birthtime}`);
    
    // 7. Mostrar arquivos principais
    const buildFiles = fs.readdirSync('./build');
    console.log('📄 Arquivos principais:');
    buildFiles.forEach(file => {
      console.log(`   - ${file}`);
    });

    // 8. Instruções de deploy
    console.log('\n🌐 Para fazer deploy:');
    console.log('1. Copie a pasta "build" para seu servidor web');
    console.log('2. Configure o servidor para servir arquivos estáticos');
    console.log('3. Configure redirecionamento para index.html (SPA)');
    console.log('4. Configure HTTPS');
    console.log('5. Configure variáveis de ambiente de produção');

    // 9. Exemplo de configuração Nginx
    console.log('\n📋 Exemplo de configuração Nginx:');
    console.log(`
server {
    listen 80;
    server_name admin.ligadobem.org.br;
    
    location / {
        root /var/www/liga-admin/build;
        index index.html;
        try_files $uri /index.html;
    }
    
    # Configurações de cache
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
    `);

    // 10. Servidor de teste local
    console.log('\n🧪 Para testar o build localmente:');
    console.log('npm install -g serve');
    console.log('serve -s build -l 3002');

  } else {
    console.error('❌ Erro: Build não foi criado');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}

console.log('\n🎉 Processo concluído!');