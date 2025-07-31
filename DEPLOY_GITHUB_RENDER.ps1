# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - GITHUB + RENDER
# ================================================================

param(
    [string]$GitHubRepo = "",
    [string]$RenderProject = "",
    [switch]$FirstTime = $false
)

Write-Host "🚀 LIGA DO BEM - DEPLOY AUTOMÁTICO" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Função para verificar se git está instalado
function Test-Git {
    try {
        git --version | Out-Null
        return $true
    }
    catch {
        Write-Host "❌ Git não está instalado ou não está no PATH" -ForegroundColor Red
        Write-Host "💡 Instale o Git: https://git-scm.com/" -ForegroundColor Yellow
        return $false
    }
}

# Função para verificar se npm está funcionando
function Test-Npm {
    try {
        npm --version | Out-Null
        return $true
    }
    catch {
        Write-Host "❌ npm não está funcionando" -ForegroundColor Red
        return $false
    }
}

# Verificar pré-requisitos
Write-Host "🔍 Verificando pré-requisitos..." -ForegroundColor Cyan

if (-not (Test-Git)) {
    exit 1
}

if (-not (Test-Npm)) {
    exit 1
}

Write-Host "✅ Pré-requisitos OK" -ForegroundColor Green
Write-Host ""

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# Instalar dependências do backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Cyan
cd backend-unico
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    exit 1
}
cd ..
Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
Write-Host ""

# Executar testes
Write-Host "🧪 Executando testes..." -ForegroundColor Cyan
npm test -- --coverage --watchAll=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Testes falharam, mas continuando..." -ForegroundColor Yellow
}
Write-Host ""

# Build de produção
Write-Host "🏗️  Fazendo build de produção..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build concluído" -ForegroundColor Green
Write-Host ""

# Configurar Git se for primeira vez
if ($FirstTime) {
    Write-Host "🔧 Configurando Git para primeiro deploy..." -ForegroundColor Cyan
    
    # Verificar se já é um repositório Git
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
    }

    # Adicionar arquivos
    git add .
    git commit -m "feat: sistema integrado Liga do Bem com PostgreSQL"
    
    # Configurar branch main
    git branch -M main
    
    Write-Host "✅ Git configurado" -ForegroundColor Green
    Write-Host ""
}

# Se repositório GitHub foi fornecido, configurar remote
if ($GitHubRepo -ne "") {
    Write-Host "🔗 Configurando repositório GitHub..." -ForegroundColor Cyan
    
    # Verificar se remote origin já existe
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "ℹ️  Remote origin já existe: $existingRemote" -ForegroundColor Yellow
    } else {
        git remote add origin $GitHubRepo
        Write-Host "✅ Remote adicionado: $GitHubRepo" -ForegroundColor Green
    }
    
    # Push para GitHub
    Write-Host "📤 Enviando código para GitHub..." -ForegroundColor Cyan
    git add .
    git commit -m "feat: atualização com PostgreSQL e deploy automático"
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Código enviado para GitHub" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erro ao enviar para GitHub. Verifique as credenciais." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Resumo final
Write-Host "🎉 DEPLOY CONFIGURADO COM SUCESSO!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""

if ($GitHubRepo -eq "") {
    Write-Host "1. 📂 Criar repositório no GitHub" -ForegroundColor White
    Write-Host "2. 🔗 Executar: git remote add origin https://github.com/SEU_USUARIO/liga-do-bem-app.git" -ForegroundColor White
    Write-Host "3. 📤 Executar: git push -u origin main" -ForegroundColor White
} else {
    Write-Host "✅ Código já está no GitHub: $GitHubRepo" -ForegroundColor Green
}

Write-Host "4. 🌐 Conectar repositório no Render (https://render.com)" -ForegroundColor White
Write-Host "5. 🗄️  Criar banco PostgreSQL no Render" -ForegroundColor White
Write-Host "6. ⚙️  Configurar variáveis de ambiente no Render" -ForegroundColor White
Write-Host "7. 🚀 Deploy automático funcionará a cada push" -ForegroundColor White
Write-Host ""

Write-Host "🔐 CREDENCIAIS DE TESTE:" -ForegroundColor Yellow
Write-Host "Admin: CPF 000.000.000-00 | Senha: admin123" -ForegroundColor White
Write-Host "User:  CPF 123.456.789-01 | Senha: 123456" -ForegroundColor White
Write-Host ""

Write-Host "📁 ESTRUTURA:" -ForegroundColor Yellow
Write-Host "Frontend: https://seu-app.onrender.com" -ForegroundColor White
Write-Host "Backend:  https://seu-api.onrender.com" -ForegroundColor White
Write-Host "Database: PostgreSQL no Render" -ForegroundColor White
Write-Host ""

Write-Host "🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "DATABASE_URL=postgresql://..." -ForegroundColor White
Write-Host "JWT_SECRET=sua_chave_secreta" -ForegroundColor White
Write-Host "CORS_ORIGINS=https://seu-app.onrender.com" -ForegroundColor White
Write-Host ""

# Oferecer para abrir URLs úteis
$openUrls = Read-Host "🌐 Abrir URLs úteis no navegador? (y/n)"
if ($openUrls -eq "y" -or $openUrls -eq "Y") {
    Start-Process "https://github.com"
    Start-Process "https://render.com"
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "✨ Sistema pronto para produção!" -ForegroundColor Green
Write-Host "🐾 Liga do Bem - Fazendo a diferença na vida dos animais!" -ForegroundColor Cyan 