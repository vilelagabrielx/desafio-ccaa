@echo off
echo ========================================
echo    🔄 DESAFIO CCAA - RESTART LOCAL
echo ========================================
echo.

echo 🛑 Parando todos os processos...
call stop-local.bat

echo.
echo ⏳ Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo.
echo 🚀 Reiniciando aplicação...
call start-local.bat
