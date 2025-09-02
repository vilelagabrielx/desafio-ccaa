@echo off
echo ========================================
echo Alternar Banco de Dados
echo ========================================

echo.
echo Escolha o banco de dados:
echo 1. PostgreSQL (Supabase)
echo 2. SQL Server (LocalDB)
echo 3. SQL Server (Instância Local)
echo.
set /p choice="Digite sua escolha (1-3): "

if "%choice%"=="1" goto postgresql
if "%choice%"=="2" goto sqlserver_localdb
if "%choice%"=="3" goto sqlserver_local
goto invalid

:postgresql
echo.
echo Configurando para PostgreSQL...
set DB_PROVIDER=PostgreSQL
echo Provider configurado: PostgreSQL
goto apply_migration

:sqlserver_localdb
echo.
echo Configurando para SQL Server LocalDB...
set DB_PROVIDER=SQLServer
echo Provider configurado: SQL Server (LocalDB)
goto apply_migration

:sqlserver_local
echo.
echo Configurando para SQL Server Local...
set DB_PROVIDER=SQLServer
echo Provider configurado: SQL Server (Local)
goto apply_migration

:invalid
echo.
echo Escolha inválida!
pause
exit /b 1

:apply_migration
echo.
echo Aplicando migrations...
cd src\DesafioCCAA.API
dotnet ef database update --project ..\DesafioCCAA.Infrastructure --startup-project . --context ApplicationDbContext

echo.
echo Migrations aplicadas com sucesso!
echo.
echo Para iniciar a aplicação, execute:
echo dotnet run
echo.
pause
