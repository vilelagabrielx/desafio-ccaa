# ========================================
#    DESAFIO CCAA - CONFIGURACAO SEGURA
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DESAFIO CCAA - CONFIGURACAO SEGURA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check example files
Write-Host "[1/4] Verificando arquivos de exemplo..." -ForegroundColor Yellow
if (-not (Test-Path "env.example")) {
    Write-Host "❌ ERRO: Arquivo env.example nao encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretorio correto." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Arquivo env.example encontrado." -ForegroundColor Green

# Step 2: Create .env file
Write-Host "[2/4] Criando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $choice = Read-Host "⚠️  Arquivo .env ja existe. Deseja sobrescrever? (S/N)"
    if ($choice -eq "S" -or $choice -eq "s") {
        Copy-Item "env.example" ".env" -Force
        Write-Host "✅ Arquivo .env atualizado." -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Mantendo arquivo .env existente." -ForegroundColor Blue
    }
} else {
    Copy-Item "env.example" ".env"
    Write-Host "✅ Arquivo .env criado." -ForegroundColor Green
}

# Step 3: Check .gitignore
Write-Host "[3/4] Verificando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
if ($gitignoreContent -and ($gitignoreContent -match "\.env")) {
    Write-Host "✅ Arquivo .env esta no .gitignore." -ForegroundColor Green
} else {
    Write-Host "⚠️  ATENCAO: Arquivo .env nao esta no .gitignore!" -ForegroundColor Yellow
    Write-Host "Adicione a linha '.env' ao arquivo .gitignore" -ForegroundColor Yellow
}

# Step 4: Install dependencies
Write-Host "[4/4] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "Executando: dotnet restore" -ForegroundColor Gray
try {
    dotnet restore
    Write-Host "✅ Dependencias instaladas com sucesso." -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependencias." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           CONFIGURACAO COMPLETA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Arquivo .env criado/atualizado" -ForegroundColor Green
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Edite o arquivo .env com suas credenciais reais" -ForegroundColor White
Write-Host "2. NUNCA commite o arquivo .env no Git" -ForegroundColor White
Write-Host "3. Execute: dotnet run" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para mais detalhes, consulte SECURITY_FIXES.md" -ForegroundColor Blue
Write-Host ""
Read-Host "Pressione Enter para sair"
