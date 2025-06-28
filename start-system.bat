@echo off
echo 🚀 Iniciando Sistema Liga do Bem...

echo.
echo 📦 Instalando dependências do backend...
cd backend
call npm install
echo.

echo 🚀 Iniciando backend na porta 3001...
start "Backend Liga do Bem" cmd /k "node server.js"

echo.
echo ⏱️ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

cd ../admin-panel-liga-do-bem
echo.
echo 📦 Instalando dependências do frontend...
call npm install
echo.

echo 🚀 Iniciando frontend na porta 3002...
start "Frontend Liga do Bem" cmd /k "npm start"

echo.
echo ✅ Sistema iniciado!
echo.
echo 📱 Acesse: http://localhost:3002
echo 🔐 Login: CPF 12345678901 / Senha admin123
echo.
pause