# 🚀 SCRIPT PARA INICIAR TODO O SISTEMA LIGA DO BEM
# ================================================================

Write-Host "🚀 INICIANDO SISTEMA LIGA DO BEM..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# 1. Parar todos os processos Node.js existentes
Write-Host "🛑 Parando processos Node.js existentes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Definir caminhos
$PROJETO_ROOT = "c:\Users\Onigu\OneDrive\Desktop\novo projeto da liga\liga-do-bem-app"
$ADMIN_PATH = "$PROJETO_ROOT\admin-panel-liga-do-bem"
$FRONTEND_PATH = "$PROJETO_ROOT\frontend-liga-do-bem"

Write-Host "📁 Projeto localizado em: $PROJETO_ROOT" -ForegroundColor Cyan

# 3. Verificar se as pastas existem
if (!(Test-Path $PROJETO_ROOT)) {
    Write-Host "❌ ERRO: Pasta do projeto não encontrada!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit
}

# 4. Iniciar JSON Server (Banco de Dados)
Write-Host "🗄️  INICIANDO BANCO DE DADOS (JSON Server)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJETO_ROOT'; Write-Host '🗄️  JSON SERVER - BANCO DE DADOS' -ForegroundColor Green; Write-Host 'URL: http://localhost:3001' -ForegroundColor Cyan; npx json-server --watch db.json --port 3001" -WindowStyle Normal
Start-Sleep -Seconds 8

# 5. Iniciar Admin Panel
Write-Host "🛠️  INICIANDO ADMIN PANEL..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ADMIN_PATH'; Write-Host '🛠️  ADMIN PANEL' -ForegroundColor Green; Write-Host 'URL: http://localhost:3002' -ForegroundColor Cyan; npm start" -WindowStyle Normal
Start-Sleep -Seconds 10

# 6. Iniciar Frontend Público
Write-Host "👥 INICIANDO FRONTEND PÚBLICO..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_PATH'; Write-Host '👥 FRONTEND PÚBLICO' -ForegroundColor Green; Write-Host 'URL: http://localhost:3000' -ForegroundColor Cyan; npm start" -WindowStyle Normal
Start-Sleep -Seconds 10

# 7. Abrir navegadores automaticamente
Write-Host "🌐 ABRINDO NAVEGADORES..." -ForegroundColor Green
Start-Process "msedge" -ArgumentList "--inprivate", "http://localhost:3001/companies"
Start-Sleep -Seconds 2
Start-Process "msedge" -ArgumentList "--inprivate", "http://localhost:3002/companies"
Start-Sleep -Seconds 2
Start-Process "msedge" -ArgumentList "--inprivate", "http://localhost:3000"

# 8. Finalização
Write-Host ""
Write-Host "✅ SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🗄️  Banco de Dados: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🛠️  Admin Panel:    http://localhost:3002" -ForegroundColor Cyan
Write-Host "👥 Frontend:       http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para parar todos os serviços, feche as janelas do PowerShell" -ForegroundColor Yellow
Write-Host "🔄 Para reiniciar, execute este script novamente" -ForegroundColor Yellow
Write-Host ""

Read-Host "Pressione Enter para sair deste console..."