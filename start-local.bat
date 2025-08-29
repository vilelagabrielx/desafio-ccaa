@echo off
echo ========================================
echo    🚀 DESAFIO CCAA - START LOCAL
echo ========================================
echo.

echo 🔧 Iniciando Backend (.NET)...
echo 📍 Porta: 5000 (HTTP) / 5001 (HTTPS)
echo.

cd desafio-ccaa-backend\src\DesafioCCAA.API

echo 🚀 Executando: dotnet run
start "Backend - Desafio CCAA" powershell -Command "cd '%~dp0desafio-ccaa-backend\src\DesafioCCAA.API'; $env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --urls=http://localhost:5000;https://localhost:5001"

echo.
echo ⏳ Aguardando 5 segundos para o backend inicializar...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Iniciando Frontend (Angular)...
echo 📍 Porta: 4200
echo.

cd ..\..\..\desafio-ccaa-frontend

echo 🚀 Executando: npm start
start "Frontend - Desafio CCAA" cmd /k "npm start"

echo.
echo ========================================
echo    ✅ APLICAÇÃO INICIADA!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:4200
echo 🔧 Backend: http://localhost:5000
echo 📚 Swagger: http://localhost:5000
echo.
echo 🔐 Auth0 configurado e funcionando!
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
