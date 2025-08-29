# 🚀 Instruções de Execução - Desafio CCAA

## 📋 Pré-requisitos

### Software Necessário
- **.NET 8 SDK** - [Download aqui](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** - LocalDB, Express ou Developer Edition
- **Visual Studio 2022** ou **VS Code** com extensões C#

### Verificação de Instalação
```bash
# Verificar versão do .NET
dotnet --version

# Verificar se o SQL Server está rodando
sqlcmd -S "(localdb)\mssqllocaldb" -Q "SELECT @@VERSION"
```

## 🛠️ Configuração Inicial

### 1. Clone e Navegação
```bash
git clone https://github.com/seu-usuario/desafio-ccaa.git
cd desafio-ccaa
```

### 2. Restaurar Dependências
```bash
dotnet restore
```

### 3. Configurar Connection String
Edite o arquivo `src/DesafioCCAA.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DesafioCCAA;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

**Alternativas de Connection String:**

#### Para SQL Server Express:
```json
"Server=.\\SQLEXPRESS;Database=DesafioCCAA;Trusted_Connection=true;MultipleActiveResultSets=true"
```

#### Para SQL Server Developer:
```json
"Server=localhost;Database=DesafioCCAA;User Id=sa;Password=SuaSenha;TrustServerCertificate=true"
```

## 🚀 Execução da Aplicação

### Opção 1: Execução Direta
```bash
# Navegar para o projeto da API
cd src/DesafioCCAA.API

# Executar a aplicação
dotnet run
```

### Opção 2: Execução via Solution
```bash
# Na raiz do projeto
dotnet run --project src/DesafioCCAA.API
```

### Opção 3: Build e Execução
```bash
# Build da solução
dotnet build --configuration Release

# Executar a API
dotnet run --project src/DesafioCCAA.API --configuration Release
```

## 🧪 Execução dos Testes

### Executar Todos os Testes
```bash
dotnet test
```

### Executar Testes com Cobertura
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### Executar Testes Específicos
```bash
# Testes de usuário
dotnet test --filter "FullyQualifiedName~UserServiceTests"

# Testes de livro
dotnet test --filter "FullyQualifiedName~BookServiceTests"
```

## 📊 Verificação da Aplicação

### 1. Acessar Swagger
Abra o navegador e acesse: `https://localhost:7000/swagger`

### 2. Testar Endpoints
Use o Swagger para testar os endpoints ou use os exemplos abaixo:

#### Registrar Usuário
```bash
curl -X POST "https://localhost:7000/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Teste",
    "lastName": "Usuario",
    "email": "teste@exemplo.com",
    "password": "Teste123",
    "confirmPassword": "Teste123"
  }'
```

#### Fazer Login
```bash
curl -X POST "https://localhost:7000/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Teste123"
  }'
```

## 🔧 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se o SQL Server está rodando
sqlcmd -S "(localdb)\mssqllocaldb" -Q "SELECT @@VERSION"

# Se não estiver rodando, iniciar LocalDB
sqllocaldb start "MSSQLLocalDB"
```

### Erro de Porta em Uso
```bash
# Verificar portas em uso
netstat -ano | findstr :7000

# Alterar porta no appsettings.json ou Program.cs
```

### Erro de Certificado HTTPS
```bash
# Gerar certificado de desenvolvimento
dotnet dev-certs https --trust
```

### Erro de Dependências
```bash
# Limpar cache do NuGet
dotnet nuget locals all --clear

# Restaurar dependências
dotnet restore --force
```

## 📁 Estrutura de Arquivos Importantes

```
desafio-ccaa/
├── src/DesafioCCAA.API/
│   ├── Program.cs              # Configuração principal
│   ├── appsettings.json        # Configurações
│   └── Controllers/            # Controllers da API
├── src/DesafioCCAA.Business/
│   ├── Services/               # Serviços de negócio
│   ├── Validators/             # Validações
│   └── DTOs/                   # Data Transfer Objects
├── src/DesafioCCAA.Infrastructure/
│   ├── Data/                   # DbContext e configurações
│   └── Repositories/           # Repositórios
└── tests/                      # Testes unitários
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** da aplicação
2. **Consulte a documentação** do Swagger
3. **Verifique a connection string** do banco
4. **Abra uma issue** no repositório

## ✅ Checklist de Verificação

- [ ] .NET 8 SDK instalado
- [ ] SQL Server rodando
- [ ] Dependências restauradas
- [ ] Connection string configurada
- [ ] Aplicação executando
- [ ] Swagger acessível
- [ ] Testes passando
- [ ] Banco de dados criado

---

**🎯 A aplicação está pronta para uso quando todos os itens acima estiverem marcados!**
