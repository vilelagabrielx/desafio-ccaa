@echo off
echo ========================================
echo    SINCRONIZANDO CONFIGURACOES
echo    DESAFIO CCAA
echo ========================================
echo.

echo 🔧 Atualizando configuracoes em todos os arquivos...
echo.

REM Atualizar appsettings.json
echo 📝 Atualizando appsettings.json...
powershell -Command "(Get-Content 'src\DesafioCCAA.API\appsettings.json') -replace 'Host=aws-1-us-east-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.dhzqrasofzdjfpfhhnqm;Password=ccaateste@123;SSL Mode=Require;Trust Server Certificate=true;Command Timeout=300;', 'Host=aws-1-us-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.dhzqrasofzdjfpfhhnqm;Password=ccaateste@123;SSL Mode=Require;Trust Server Certificate=true;Command Timeout=300;' | Set-Content 'src\DesafioCCAA.API\appsettings.json'"

REM Atualizar appsettings.Development.json
echo 📝 Atualizando appsettings.Development.json...
powershell -Command "(Get-Content 'src\DesafioCCAA.API\appsettings.Development.json') -replace 'Host=aws-1-us-east-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.dhzqrasofzdjfpfhhnqm;Password=ccaateste@123;SSL Mode=Require;Trust Server Certificate=true;Command Timeout=300;', 'Host=aws-1-us-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.dhzqrasofzdjfpfhhnqm;Password=ccaateste@123;SSL Mode=Require;Trust Server Certificate=true;Command Timeout=300;' | Set-Content 'src\DesafioCCAA.API\appsettings.Development.json'"

echo.
echo ✅ Configuracoes sincronizadas com sucesso!
echo.
echo 📋 Para alterar configuracoes futuras:
echo 1. Edite apenas o arquivo database-config.json
echo 2. Execute este script novamente
echo.
pause
