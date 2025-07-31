@echo off
REM Inicia o backend em um novo terminal
start cmd /k "cd /d %~dp0backend-unico && npm start"
REM Inicia o frontend em outro terminal
start cmd /k "cd /d %~dp0 && npm start"
