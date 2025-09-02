@echo off
echo ========================================
echo Iniciando Desafio CCAA com SQL Server
echo ========================================

echo.
echo Configurando variáveis de ambiente para SQL Server...
set DB_PROVIDER=SQLServer
set ASPNETCORE_ENVIRONMENT=Development

echo.
echo Aplicando migrations no SQL Server...
cd src\DesafioCCAA.API
dotnet ef database update --project ..\DesafioCCAA.Infrastructure --startup-project . --context ApplicationDbContext

echo.
echo Iniciando aplicação...
dotnet run

pause
