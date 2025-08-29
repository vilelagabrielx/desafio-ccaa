@echo off
chcp 65001 >nul
echo ====================================================
echo    COMANDOS RÁPIDOS - DESAFIO CCAA
echo ====================================================
echo.

echo 🔧 Configurando PATH para Entity Framework...
set "PATH=%PATH%;%USERPROFILE%\.dotnet\tools"

echo.
echo 📋 Comandos disponíveis:
echo.
echo 1. Verificar versão do EF
echo 2. Compilar projeto
echo 3. Criar migration
echo 4. Aplicar migration no banco
echo 5. Listar migrations
echo 6. Remover migration
echo 7. Sair
echo.

:menu
set /p escolha="Escolha uma opção (1-7): "

if "%escolha%"=="1" goto versao
if "%escolha%"=="2" goto build
if "%escolha%"=="3" goto criar
if "%escolha%"=="4" goto aplicar
if "%escolha%"=="5" goto listar
if "%escolha%"=="6" goto remover
if "%escolha%"=="7" goto sair

echo ❌ Opção inválida!
goto menu

:versao
echo.
echo 📊 Verificando versão do Entity Framework...
dotnet ef --version
echo.
pause
goto menu

:build
echo.
echo 🏗️ Compilando projeto...
dotnet build
echo.
pause
goto menu

:criar
echo.
echo 🔨 Criando migration InitialCreate...
dotnet ef migrations add InitialCreate --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
echo.
pause
goto menu

:aplicar
echo.
echo ⚠️ IMPORTANTE: Este comando vai criar as tabelas no banco!
echo ⏱️ Pode demorar alguns minutos...
echo.
set /p confirma="Tem certeza? (s/n): "
if /i "%confirma%"=="s" (
    echo 🗄️ Aplicando migration no banco...
    dotnet ef database update --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
) else (
    echo ❌ Operação cancelada
)
echo.
pause
goto menu

:listar
echo.
echo 📊 Listando migrations...
dotnet ef migrations list --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
echo.
pause
goto menu

:remover
echo.
echo ⚠️ ATENÇÃO: Este comando remove a última migration!
echo.
set /p confirma="Tem certeza? (s/n): "
if /i "%confirma%"=="s" (
    echo 🗑️ Removendo última migration...
    dotnet ef migrations remove --project src\DesafioCCAA.Infrastructure --startup-project src\DesafioCCAA.API
) else (
    echo ❌ Operação cancelada
)
echo.
pause
goto menu

:sair
echo.
echo 👋 Até logo!
echo.
pause
exit /b 0
