@echo off
title Liga do Bem - Parar Servicos

echo.
echo ===========================================
echo    LIGA DO BEM - PARAR SERVICOS
echo ===========================================
echo.

echo Finalizando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo Nenhum processo Node.js encontrado
) else (
    echo Processos Node.js finalizados
)

echo.
echo Finalizando processos npm...
taskkill /F /IM npm.exe >nul 2>&1
if errorlevel 1 (
    echo Nenhum processo npm encontrado
) else (
    echo Processos npm finalizados
)

echo.
echo Finalizando processos nas portas 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ===========================================
echo   TODOS OS SERVICOS FORAM FINALIZADOS!
echo ===========================================
echo.
echo As portas 3000 e 3001 estao agora livres.
echo.
echo Aguardando 3 segundos...
ping 127.0.0.1 -n 4 >nul
echo.
echo Concluido!