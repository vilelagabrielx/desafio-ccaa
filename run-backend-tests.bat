@echo off
echo ========================================
echo    Testes Unitarios - Backend CCAA
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "desafio-ccaa-backend" (
    echo ERRO: Diretorio 'desafio-ccaa-backend' nao encontrado!
    echo Execute este script a partir da raiz do projeto.
    pause
    exit /b 1
)

REM Navegar para o diretorio do backend
cd desafio-ccaa-backend

echo Executando testes unitarios do backend...
echo.

REM Executar todos os testes com verbosidade normal
echo [INFO] Executando todos os testes...
dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --verbosity normal

REM Verificar se houve erros
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Alguns testes falharam!
    echo.
    echo Opcoes disponiveis:
    echo 1. Executar testes especificos
    echo 2. Executar com cobertura de codigo
    echo 3. Executar com detalhes completos
    echo 4. Sair
    echo.
    set /p choice="Escolha uma opcao (1-4): "
    
    if "%choice%"=="1" goto specific_tests
    if "%choice%"=="2" goto coverage_tests
    if "%choice%"=="3" goto detailed_tests
    if "%choice%"=="4" goto end
    goto end
) else (
    echo.
    echo [SUCESSO] Todos os testes passaram!
    echo.
    echo Opcoes disponiveis:
    echo 1. Executar com cobertura de codigo
    echo 2. Executar testes especificos
    echo 3. Executar com detalhes completos
    echo 4. Sair
    echo.
    set /p choice="Escolha uma opcao (1-4): "
    
    if "%choice%"=="1" goto coverage_tests
    if "%choice%"=="2" goto specific_tests
    if "%choice%"=="3" goto detailed_tests
    if "%choice%"=="4" goto end
    goto end
)

:specific_tests
echo.
echo ========================================
echo    Testes Especificos
echo ========================================
echo.
echo 1. UserServiceTests
echo 2. BookServiceTests
echo 3. EmailServiceTests
echo 4. ValidationTests
echo 5. Voltar ao menu principal
echo.
set /p test_choice="Escolha o teste (1-5): "

if "%test_choice%"=="1" (
    echo Executando UserServiceTests...
    dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --filter "UserServiceTests" --verbosity normal
) else if "%test_choice%"=="2" (
    echo Executando BookServiceTests...
    dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --filter "BookServiceTests" --verbosity normal
) else if "%test_choice%"=="3" (
    echo Executando EmailServiceTests...
    dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --filter "EmailServiceTests" --verbosity normal
) else if "%test_choice%"=="4" (
    echo Executando ValidationTests...
    dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --filter "ValidationTests" --verbosity normal
) else if "%test_choice%"=="5" (
    goto start
) else (
    echo Opcao invalida!
    goto specific_tests
)
goto end

:coverage_tests
echo.
echo ========================================
echo    Testes com Cobertura de Codigo
echo ========================================
echo.
echo Executando testes com cobertura de codigo...
echo.
dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --collect:"XPlat Code Coverage" --verbosity normal
echo.
echo [INFO] Relatorio de cobertura gerado em: TestResults/
goto end

:detailed_tests
echo.
echo ========================================
echo    Testes com Detalhes Completos
echo ========================================
echo.
echo Executando testes com verbosidade detalhada...
echo.
dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --verbosity detailed
goto end

:start
echo.
echo ========================================
echo    Menu Principal
echo ========================================
echo.
echo 1. Executar todos os testes
echo 2. Executar testes especificos
echo 3. Executar com cobertura de codigo
echo 4. Executar com detalhes completos
echo 5. Sair
echo.
set /p main_choice="Escolha uma opcao (1-5): "

if "%main_choice%"=="1" goto all_tests
if "%main_choice%"=="2" goto specific_tests
if "%main_choice%"=="3" goto coverage_tests
if "%main_choice%"=="4" goto detailed_tests
if "%main_choice%"=="5" goto end
echo Opcao invalida!
goto start

:all_tests
echo.
echo Executando todos os testes...
dotnet test tests/DesafioCCAA.Tests/DesafioCCAA.Tests.csproj --verbosity normal
goto end

:end
echo.
echo ========================================
echo    Fim da Execucao
echo ========================================
echo.
echo Pressione qualquer tecla para sair...
pause >nul
