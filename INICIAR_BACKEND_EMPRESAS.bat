@echo off
echo ========================================
echo    LIGA DO BEM - BACKEND EMPRESAS
echo ========================================
echo.
echo Iniciando backend local para empresas...
echo.

cd backend-unico

echo Instalando dependencias...
npm install

echo.
echo Iniciando servidor...
echo URL: http://localhost:3001
echo Health Check: http://localhost:3001/api/health
echo.

npm start

pause
