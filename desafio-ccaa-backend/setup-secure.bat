@echo off
echo ========================================
echo    DESAFIO CCAA - CONFIGURACAO SEGURA
echo ========================================
echo.

echo [1/4] Verificando arquivos de exemplo...
if not exist "env.example" (
    echo ❌ ERRO: Arquivo env.example nao encontrado!
    echo Certifique-se de estar no diretorio correto.
    pause
    exit /b 1
)

echo [2/4] Criando arquivo .env...
if exist ".env" (
    echo ⚠️  Arquivo .env ja existe. Deseja sobrescrever? (S/N)
    set /p choice=
    if /i "%choice%"=="S" (
        copy "env.example" ".env" >nul
        echo ✅ Arquivo .env atualizado.
    ) else (
        echo ℹ️  Mantendo arquivo .env existente.
    )
) else (
    copy "env.example" ".env" >nul
    echo ✅ Arquivo .env criado.
)

echo [3/4] Verificando .gitignore...
findstr /c:".env" .gitignore >nul
if %errorlevel%==0 (
    echo ✅ Arquivo .env esta no .gitignore.
) else (
    echo ⚠️  ATENCAO: Arquivo .env nao esta no .gitignore!
    echo Adicione a linha ".env" ao arquivo .gitignore
)

echo [4/4] Instalando dependencias...
echo Executando: dotnet restore
dotnet restore

echo.
echo ========================================
echo           CONFIGURACAO COMPLETA!
echo ========================================
echo.
echo ✅ Arquivo .env criado/atualizado
echo ✅ Dependencias instaladas
echo.
echo 🔒 PROXIMOS PASSOS:
echo 1. Edite o arquivo .env com suas credenciais reais
echo 2. NUNCA commite o arquivo .env no Git
echo 3. Execute: dotnet run
echo.
echo 📖 Para mais detalhes, consulte SECURITY_FIXES.md
echo.
pause
