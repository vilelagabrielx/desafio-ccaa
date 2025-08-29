# Configuração de Banco de Dados

Este projeto suporta tanto **PostgreSQL** quanto **SQL Server**. Você pode alternar facilmente entre eles.

## 🚀 Configuração Rápida

### Para usar PostgreSQL (Padrão):
```bash
# Não precisa fazer nada - já está configurado como padrão
dotnet run --project src/DesafioCCAA.API
```

### Para usar SQL Server:
```bash
# Opção 1: Variável de ambiente
set DB_PROVIDER=SQLServer
dotnet run --project src/DesafioCCAA.API

# Opção 2: Alterar appsettings.json
# Mude "Provider": "PostgreSQL" para "Provider": "SQLServer"
```

## 🔧 Configurações Disponíveis

### 1. PostgreSQL (Supabase)
- **Host**: db.dhzqrasofzdjfpfhhnqm.supabase.co
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres
- **Password**: 123456

### 2. SQL Server (LocalDB)
- **Server**: (localdb)\mssqllocaldb
- **Database**: DesafioCCAA
- **Trusted_Connection**: true

## 📝 Métodos de Configuração

### Método 1: Variáveis de Ambiente (Recomendado)
```bash
# Windows
set DB_PROVIDER=PostgreSQL
set DB_CONNECTION_STRING="Host=seu-host;Port=5432;Database=seu-db;Username=seu-user;Password=sua-senha;"

# Linux/Mac
export DB_PROVIDER=PostgreSQL
export DB_CONNECTION_STRING="Host=seu-host;Port=5432;Database=seu-db;Username=seu-user;Password=sua-senha;"
```

**Ou use o arquivo `env.example` como base:**
1. Copie `env.example` para `env.local`
2. Edite `env.local` com suas configurações reais
3. O arquivo `env.local` não vai para o Git

### Método 2: Arquivo de Configuração
Edite `appsettings.json` ou `appsettings.Development.json`:
```json
{
  "Database": {
    "Provider": "PostgreSQL"  // ou "SQLServer"
  },
  "ConnectionStrings": {
    "PostgreSQL": "sua-connection-string-postgres",
    "SQLServer": "sua-connection-string-sqlserver"
  }
}
```

### Método 3: Linha de Comando
```bash
dotnet run --project src/DesafioCCAA.API --environment Development
```

## 🔍 Verificação

Quando a API iniciar, você verá no console:
```
Using Database Provider: PostgreSQL
Connection String: Host=db.dhzqrasofzdjfpfhhnqm.supabase.co;Port=5432;Database=postgres...
```

## ⚠️ Importante

- **PostgreSQL**: Requer o pacote `Npgsql.EntityFrameworkCore.PostgreSQL`
- **SQL Server**: Requer o pacote `Microsoft.EntityFrameworkCore.SqlServer`
- Ambos os pacotes já estão incluídos no projeto
- A mudança é automática baseada na configuração

## 🔒 Segurança

### ⚠️ IMPORTANTE: Senhas e Configurações Sensíveis
- **NUNCA** commite arquivos com senhas reais no Git
- O arquivo `appsettings.json` atual contém senhas reais e **NÃO** deve ir para o repositório
- Use o arquivo `appsettings.template.json` como base
- Configure suas próprias senhas localmente

### 📁 Arquivos que NÃO vão para o Git:
- `appsettings.Development.json` (contém senhas reais)
- `appsettings.Production.json` (se existir)
- `appsettings.Local.json` (se existir)
- Qualquer arquivo com `appsettings.*.json` (exceto o template)

### 📁 Arquivos que VÃO para o Git:
- `appsettings.template.json` (sem senhas reais)
- `appsettings.json` (apenas se não tiver senhas)

## 🆘 Troubleshooting

### Erro de conexão PostgreSQL:
- Verifique se o Supabase está ativo
- Configure sua própria senha no arquivo local
- Teste a conexão: `psql -h seu-host -U seu-username -d seu-database`

### Erro de conexão SQL Server:
- Instale SQL Server LocalDB
- Ou use SQL Server Express
- Verifique se o serviço está rodando

### Erro de provider:
- Confirme se o valor é "PostgreSQL" ou "SQLServer" (case-insensitive)
- Verifique se não há espaços extras
