@echo off
echo ========================================
echo    🚀 BACKEND DESAFIO CCAA
echo ========================================
echo.

echo 🔧 Configurando ambiente...
powershell -Command "$env:ASPNETCORE_ENVIRONMENT='Development'; Write-Host '✅ Ambiente:' $env:ASPNETCORE_ENVIRONMENT"

echo.
echo 🚀 Executando backend...
echo 📍 Porta: 5000 (HTTP) / 5001 (HTTPS)
echo.

cd src\DesafioCCAA.API
powershell -Command "$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --urls=http://localhost:5000;https://localhost:5001"

echo.
echo 🔚 Backend finalizado.
pause
