@echo off
echo ========================================
echo   LIMPEZA DE LIVROS INATIVOS - CCAA
echo ========================================
echo.
echo Este script irá limpar livros inativos do banco de dados.
echo ATENCAO: Esta operacao e IRREVERSIVEL!
echo.
pause

echo.
echo Executando limpeza via API...
echo.

REM Substitua a URL pela sua API local
curl -X POST "http://localhost:5000/api/book/cleanup-inactive" ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI" ^
  -H "Content-Type: application/json"

echo.
echo.
echo Limpeza concluida!
echo Verifique o resultado acima.
echo.
pause
