@echo off
echo ========================================
echo    EXECUTANDO MIGRATION - DESAFIO CCAA
echo ========================================
echo.

cd src\DesafioCCAA.API
echo 🔧 Executando migration do banco...
dotnet ef database update

echo ✅ Migration concluída!
pause
