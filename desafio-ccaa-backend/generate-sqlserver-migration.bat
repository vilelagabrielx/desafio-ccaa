@echo off
echo ========================================
echo Gerando Migration para SQL Server
echo ========================================

echo.
echo Configurando provider para SQL Server...
set DB_PROVIDER=SQLServer
set ASPNETCORE_ENVIRONMENT=Development

echo.
echo Executando dotnet ef migrations add...
cd src\DesafioCCAA.API
dotnet ef migrations add SQLServerCompatible --project ..\DesafioCCAA.Infrastructure --startup-project . --context ApplicationDbContext

echo.
echo Migration gerada com sucesso!
echo.
echo Para aplicar a migration no SQL Server, execute:
echo dotnet ef database update --project ..\DesafioCCAA.Infrastructure --startup-project . --context ApplicationDbContext
echo.
echo Para voltar ao PostgreSQL, execute:
echo set DB_PROVIDER=PostgreSQL
echo dotnet ef database update --project ..\DesafioCCAA.Infrastructure --startup-project . --context ApplicationDbContext
echo.
pause
