# Guia de Migrations - Entity Framework Core

Este guia ensina como criar e executar migrations para o projeto Desafio CCAA, funcionando com **PostgreSQL** e **SQL Server**.

## 🎯 **O que são Migrations?**

Migrations são arquivos que descrevem as mudanças no banco de dados. Eles permitem:
- **Versionar** o banco de dados
- **Sincronizar** estrutura entre ambientes
- **Replicar** banco em outros servidores
- **Rollback** de mudanças se necessário

## 📋 **Pré-requisitos**

### **1. Instalar Entity Framework Tools:**
```bash
dotnet tool install --global dotnet-ef
```

### **2. Verificar instalação:**
```bash
dotnet ef --version
```

**⚠️ Problema comum:** Após a instalação, o comando `dotnet ef` pode não ser reconhecido no PowerShell.

### **3. Solucionar problema de PATH (OBRIGATÓRIO):**
```powershell
# ⚠️ SEMPRE execute este comando primeiro em cada sessão do PowerShell!
$env:PATH += ";$env:USERPROFILE\.dotnet\tools"

# Verificar se a ferramenta está instalada
dotnet tool list --global

# Verificar se agora funciona
dotnet ef --version
```

**💡 Dica:** Este comando deve ser executado em CADA sessão do PowerShell, pois não persiste entre sessões.

## 🚀 **Criando sua Primeira Migration**

### **Passo 1: Navegar para o diretório correto**
```bash
cd desafio-ccaa-backend
```

### **Passo 2: Verificar se as ferramentas estão funcionando**
```bash
# Verificar se o EF está funcionando
dotnet ef --version

# Se der erro, verificar instalação
dotnet tool list --global

# Se necessário, adicionar ao PATH
$env:PATH += ";$env:USERPROFILE\.dotnet\tools"
```

### **Passo 3: Verificar conectividade com o banco**
```bash
# Testar conectividade com o host
ping aws-1-us-east-1.pooler.supabase.com

# Verificar se o projeto compila
dotnet build
```

### **Passo 4: Criar a Migration**
```bash
dotnet ef migrations add InitialCreate --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

**Explicação dos parâmetros:**
- `migrations add` - Comando para criar migration
- `InitialCreate` - Nome da migration (pode ser qualquer nome descritivo)
- `--project` - Projeto que contém o DbContext
- `--startup-project` - Projeto que contém a configuração (Program.cs)

## 📁 **Estrutura Criada**

Após executar o comando, será criada a pasta:
```
src/DesafioCCAA.Infrastructure/Migrations/
├── YYYYMMDDHHMMSS_InitialCreate.cs
├── YYYYMMDDHHMMSS_InitialCreate.Designer.cs
└── ApplicationDbContextModelSnapshot.cs
```

## 🔧 **Executando a Migration**

**⚠️ IMPORTANTE:** Criar a migration NÃO cria as tabelas no banco! É necessário executar o comando de update.

### **Passo 1: Aplicar no Banco (CRIAR TABELAS):**
```bash
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

**O que este comando faz:**
- ✅ Cria as tabelas no banco de dados
- ✅ Aplica todas as migrations pendentes
- ✅ Cria a tabela `__EFMigrationsHistory` para controle
- ⏱️ Pode demorar alguns minutos (especialmente com Supabase)

### **Passo 2: Verificar Status:**
```bash
dotnet ef migrations list --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

### **Passo 3: Verificar se as tabelas foram criadas:**
```sql
-- No PostgreSQL/Supabase
\dt

-- Ver migrations aplicadas
SELECT * FROM "__EFMigrationsHistory";
```

## 🗄️ **Comandos por Banco de Dados**

### **PostgreSQL (Supabase):**
```bash
# Criar migration
dotnet ef migrations add InitialCreate --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API

# Aplicar no banco
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API

# Remover migration (se necessário)
dotnet ef migrations remove --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

**⚠️ Configuração especial para Supabase:**

**🔧 Portas disponíveis:**
- **Porta 6543 (Transaction Pooler)** - Para aplicações stateless, mas pode ter problemas de timeout
- **Porta 5432 (Session Pooler)** - Mais estável para migrations, recomendado para desenvolvimento

**⚡ Configuração recomendada para migrations:**
```
Host=aws-1-us-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.dhzqrasofzdjfpfhhnqm;Password=sua-senha;Command Timeout=300;
```

**🚨 Problemas comuns:**
- **Ping não funciona** - Normal! Load balancers não respondem a ICMP
- **Timeout na porta 6543** - Use porta 5432 para migrations
- **Primeira execução demora** - Configure timeout de 300+ segundos

### **SQL Server:**
```bash
# Os mesmos comandos funcionam para SQL Server!
dotnet ef migrations add InitialCreate --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

## 📝 **Nomenclatura das Migrations**

### **Padrão Recomendado:**
```
InitialCreate          - Primeira migration
AddUserFields         - Adicionar campos ao usuário
UpdateBookStructure   - Atualizar estrutura do livro
AddBookIndexes        - Adicionar índices
```

### **Exemplos de Uso:**
```bash
dotnet ef migrations add AddUserFields --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
dotnet ef migrations add UpdateBookStructure --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

## ⚠️ **Cuidados Importantes**

### **1. Sempre fazer backup antes de executar migrations em produção**
### **2. Testar migrations em ambiente de desenvolvimento primeiro**
### **3. Verificar se a string de conexão está correta**
### **4. Não deletar arquivos de migration manualmente**

## 🔄 **Fluxo de Desenvolvimento**

### **1. Desenvolver/Modificar entidades**
```csharp
// Modificar Book.cs, User.cs, etc.
```

### **2. Criar migration**
```bash
dotnet ef migrations add NomeDaMudanca --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

### **3. Revisar migration gerada**
```bash
# Ver arquivo gerado em Migrations/YYYYMMDDHHMMSS_NomeDaMudanca.cs
```

### **4. Aplicar no banco**
```bash
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

## 🚨 **Solução de Problemas**

### **Erro: "No database provider has been configured"**
**Solução:** Verificar se a string de conexão está configurada no `appsettings.json`

### **Erro: "Connection failed"**
**Solução:** Verificar se o banco está rodando e acessível

### **Erro: "Migration already exists"**
**Solução:** Usar nome diferente para a migration ou remover a anterior

### **Erro: "Cannot drop database"**
**Solução:** Verificar se não há conexões ativas no banco

### **Erro: "Este host não é conhecido" ou problemas de conectividade**
**Solução:** 
1. Verificar se o host está correto na string de conexão
2. Testar conectividade com `ping hostname`
3. Verificar se há firewall ou proxy bloqueando a conexão
4. Usar o host principal do Supabase (ex: `aws-1-us-east-1.pooler.supabase.com`) em vez do host específico

### **Erro: "Timeout during reading attempt"**
**Solução:**
1. **Usar porta 5432** em vez de 6543 (Session Pooler é mais estável)
2. **Aumentar timeout** para `Command Timeout=300;` ou mais
3. **Verificar latência** de rede (especialmente para bancos em outras regiões)
4. **Usar Session Pooler** para migrations (porta 5432)

### **Problema: Migration trava por muito tempo (10+ minutos)**
**Solução:**
1. **Cancelar com Ctrl+C** se travar
2. **Alterar porta** de 6543 para 5432
3. **Aumentar timeout** para 300+ segundos
4. **Usar Session Pooler** (porta 5432) para migrations

### **Problema: Ferramentas dotnet-ef não são reconhecidas após instalação**
**Solução:**
1. Fechar e reabrir o terminal/PowerShell
2. Ou adicionar manualmente ao PATH:
   ```powershell
   $env:PATH += ";$env:USERPROFILE\.dotnet\tools"
   ```
3. Verificar instalação com: `dotnet tool list --global`

## 📊 **Verificando o Banco**

### **PostgreSQL:**
```sql
-- Ver tabelas criadas
\dt

-- Ver estrutura da tabela Books
\d "Books"

-- Ver migrations aplicadas
SELECT * FROM "__EFMigrationsHistory";
```

### **SQL Server:**
```sql
-- Ver tabelas criadas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'

-- Ver estrutura da tabela Books
sp_help 'Books'

-- Ver migrations aplicadas
SELECT * FROM [__EFMigrationsHistory]
```

## 🎯 **Comandos Rápidos (Copy & Paste)**

### **Para PostgreSQL:**
```bash
# Criar migration
dotnet ef migrations add InitialCreate --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API

# Aplicar no banco
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

### **Para SQL Server:**
```bash
# Os mesmos comandos funcionam!
dotnet ef migrations add InitialCreate --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API
```

## 🚀 **Próximos Passos**

1. **Execute o comando de criação da migration**
2. **Revise o arquivo gerado**
3. **Execute o comando de update do banco**
4. **Verifique se as tabelas foram criadas**

## 📚 **Recursos Adicionais**

- [Documentação oficial EF Core](https://docs.microsoft.com/en-us/ef/core/)
- [Migrations em EF Core](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Comandos CLI do EF Core](https://docs.microsoft.com/en-us/ef/core/cli/dotnet)

---

**💡 Dica:** Sempre teste as migrations em desenvolvimento antes de aplicar em produção!
