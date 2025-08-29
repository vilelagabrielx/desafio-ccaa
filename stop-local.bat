@echo off
echo ========================================
echo    🛑 DESAFIO CCAA - STOP LOCAL
echo ========================================
echo.

echo 🔍 Procurando processos em execução...
echo.

echo 🚫 Parando processos .NET (Backend)...
taskkill /f /im dotnet.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend parado com sucesso!
) else (
    echo ℹ️  Nenhum processo .NET encontrado.
)

echo.
echo 🚫 Parando processos Node.js (Frontend)...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend parado com sucesso!
) else (
    echo ℹ️  Nenhum processo Node.js encontrado.
)

echo.
echo 🚫 Fechando janelas de terminal...
taskkill /f /fi "WINDOWTITLE eq Backend - Desafio CCAA*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Frontend - Desafio CCAA*" 2>nul

echo.
echo ========================================
echo    ✅ TODOS OS PROCESSOS PARADOS!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:4200 ❌
echo 🔧 Backend: http://localhost:5000 ❌
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
