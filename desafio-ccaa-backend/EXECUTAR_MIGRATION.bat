@echo off
chcp 65001 >nul
echo ====================================================
echo    EXECUTOR DE MIGRATION - DESAFIO CCAA
echo ====================================================
echo.

echo 🚀 Iniciando processo de Migration...
echo.

echo 📍 Verificando localização...
if not exist "src\DesafioCCAA.Infrastructure" (
    echo ❌ ERRO: Execute este arquivo na pasta desafio-ccaa-backend
    echo.
    echo Localização atual: %CD%
    echo.
    pause
    exit /b 1
)

echo ✅ Localização correta detectada
echo.

echo 🔧 Configurando Entity Framework Tools...
set "PATH=%PATH%;%USERPROFILE%\.dotnet\tools"

echo 📋 Verificando se as ferramentas estão funcionando...
dotnet ef --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: dotnet ef não está funcionando
    echo.
    echo Tentando instalar as ferramentas...
    dotnet tool install --global dotnet-ef
    if %errorlevel% neq 0 (
        echo ❌ Falha na instalação das ferramentas
        pause
        exit /b 1
    )
    echo ✅ Ferramentas instaladas com sucesso
) else (
    echo ✅ Entity Framework Tools funcionando
)

echo.
echo 🏗️ Compilando o projeto...
dotnet build
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha na compilação do projeto
    pause
    exit /b 1
)
echo ✅ Projeto compilado com sucesso

echo.
echo 📊 Verificando migrations existentes...
dotnet ef migrations list --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API >nul 2>&1
if %errorlevel% neq 0 (
    echo ℹ️ Nenhuma migration encontrada, criando a primeira...
    echo.
    echo 🔨 Criando migration InitialCreate...
    dotnet ef migrations add InitialCreate --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
    if %errorlevel% neq 0 (
        echo ❌ ERRO: Falha na criação da migration
        pause
        exit /b 1
    )
    echo ✅ Migration criada com sucesso
) else (
    echo ℹ️ Migrations existentes encontradas
)

echo.
echo ⚠️ IMPORTANTE: Agora vamos criar as tabelas no banco de dados
echo ⏱️ Este processo pode demorar alguns minutos (especialmente com Supabase)
echo.
echo 💡 DICA: Use porta 5432 (Session Pooler) para migrations mais estáveis
echo 🗄️ Aplicando migration no banco PostgreSQL...
dotnet ef database update --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCESSO! Migration aplicada com sucesso!
    echo ✅ Tabelas criadas no banco de dados
    echo.
    echo 📊 Verificando status final...
    dotnet ef migrations list --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
) else (
    echo.
    echo ❌ ERRO: Falha ao aplicar migration no banco
    echo.
    echo 🔍 Possíveis causas:
    echo    - Problemas de conectividade com o banco
    echo    - String de conexão incorreta
    echo    - Timeout na conexão
    echo.
    echo 📚 Consulte o arquivo MIGRATION_GUIDE.md para soluções
)

echo.
echo ====================================================
echo    PROCESSO FINALIZADO
echo ====================================================
echo.
pause
