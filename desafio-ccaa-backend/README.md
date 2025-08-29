# Desafio CCAA - Sistema de Gerenciamento de Livros

Sistema completo de gerenciamento de livros com autenticação JWT, desenvolvido em .NET 8 seguindo arquitetura em camadas e boas práticas.

## 🚀 Funcionalidades

### Autenticação e Usuários
- ✅ Registro de usuários
- ✅ Login com JWT
- ✅ Reset de senha por email
- ✅ Alteração de senha
- ✅ Gerenciamento de perfil
- ✅ Desativação de usuários

### Gerenciamento de Livros
- ✅ CRUD completo de livros
- ✅ Upload de fotos (IFormFile)
- ✅ Busca avançada por título, ISBN, autor, editora e gênero
- ✅ Paginação de resultados
- ✅ Relatório em PDF dos livros do usuário

### Campos dos Livros
- Título (obrigatório, máx 200 caracteres)
- ISBN (obrigatório, único, 10-13 caracteres)
- Gênero (enum com 23 opções)
- Autor (obrigatório, máx 100 caracteres)
- Editora (enum com 16 opções)
- Sinopse (obrigatório, máx 5000 caracteres)
- Foto (opcional)

## 🏗️ Arquitetura

### Camadas
- **Presentation Layer** (`DesafioCCAA.API`): Controllers, configurações e middleware
- **Business Layer** (`DesafioCCAA.Business`): Serviços, validações e DTOs
- **Infrastructure Layer** (`DesafioCCAA.Infrastructure`): Repositórios, DbContext e configurações

### Tecnologias
- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM com Code First
- **SQL Server** - Banco de dados
- **ASP.NET Core Identity** - Sistema de autenticação
- **JWT Bearer** - Autenticação stateless
- **FluentValidation** - Validações de entrada
- **Mapster** - Mapeamento de objetos
- **Swagger/OpenAPI** - Documentação da API
- **xUnit** - Framework de testes
- **iTextSharp** - Geração de PDFs

## 📋 Pré-requisitos

- .NET 8 SDK
- SQL Server (LocalDB, Express ou Developer)
- Visual Studio 2022 ou VS Code

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/desafio-ccaa.git
cd desafio-ccaa
```

### 2. Restaure as dependências
```bash
dotnet restore
```

### 3. Configure a connection string
Edite o arquivo `src/DesafioCCAA.API/appsettings.json` e ajuste a connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=seu-servidor;Database=DesafioCCAA;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### 4. Execute as migrações
```bash
cd src/DesafioCCAA.API
dotnet ef database update
```

### 5. Execute o projeto
```bash
dotnet run
```

A API estará disponível em `https://localhost:7000` e o Swagger em `https://localhost:7000/swagger`

## 🧪 Executando os Testes

```bash
# Executar todos os testes
dotnet test

# Executar testes com cobertura
dotnet test --collect:"XPlat Code Coverage"

# Executar testes específicos
dotnet test --filter "FullyQualifiedName~UserServiceTests"
```

## 📚 Endpoints da API

### Autenticação
- `POST /api/user/register` - Registro de usuário
- `POST /api/user/login` - Login
- `POST /api/user/forgot-password` - Solicitar reset de senha
- `POST /api/user/reset-password` - Resetar senha

### Usuários (Autenticado)
- `GET /api/user/me` - Perfil atual
- `GET /api/user/{id}` - Usuário por ID
- `PUT /api/user/profile` - Atualizar perfil
- `POST /api/user/change-password` - Alterar senha
- `DELETE /api/user/{id}` - Desativar usuário

### Livros
- `POST /api/book` - Criar livro (Autenticado)
- `GET /api/book/{id}` - Obter livro por ID (Público)
- `GET /api/book/my` - Meus livros (Autenticado)
- `GET /api/book/my/{id}` - Meu livro por ID (Autenticado)
- `GET /api/book/search` - Buscar livros (Público)
- `PUT /api/book/{id}` - Atualizar livro (Autenticado)
- `DELETE /api/book/{id}` - Remover livro (Autenticado)
- `GET /api/book/report/pdf` - Relatório PDF (Autenticado)

## 🔐 Autenticação JWT

Para endpoints protegidos, inclua o header:
```
Authorization: Bearer {seu-token-jwt}
```

O token é obtido através do endpoint de login e tem validade de 7 dias.

## 📊 Exemplo de Uso

### 1. Registrar usuário
```bash
curl -X POST "https://localhost:7000/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@teste.com",
    "password": "Teste123",
    "confirmPassword": "Teste123"
  }'
```

### 2. Fazer login
```bash
curl -X POST "https://localhost:7000/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "Teste123"
  }'
```

### 3. Criar livro
```bash
curl -X POST "https://localhost:7000/api/book" \
  -H "Authorization: Bearer {seu-token}" \
  -F "title=O Senhor dos Anéis" \
  -F "isbn=9788533613379" \
  -F "genre=Fantasy" \
  -F "author=J.R.R. Tolkien" \
  -F "publisher=HarperCollins" \
  -F "synopsis=Uma épica jornada pela Terra-média..."
```

## 🚀 Pipeline CI/CD

O projeto inclui pipeline GitHub Actions que:
- Executa build e testes
- Verifica cobertura de código
- Executa análise de segurança
- Gera artefatos para deploy

## 📁 Estrutura do Projeto

```
desafio-ccaa/
├── src/
│   ├── DesafioCCAA.API/           # Camada de apresentação
│   ├── DesafioCCAA.Business/      # Camada de negócios
│   └── DesafioCCAA.Infrastructure/ # Camada de infraestrutura
├── tests/
│   └── DesafioCCAA.Tests/         # Testes unitários
├── .github/
│   └── workflows/                  # Pipeline CI/CD
├── DesafioCCAA.sln                # Solution file
└── README.md                      # Este arquivo
```

## 🔧 Configurações Adicionais

### Logging
O sistema utiliza logging estruturado com diferentes níveis:
- Information: Operações normais
- Warning: Situações que merecem atenção
- Error: Erros que precisam de investigação

### Validações
- FluentValidation para validação de entrada
- Validações customizadas para regras de negócio
- Mensagens de erro em português

### Mapeamento
- Mapster para mapeamento entre entidades e DTOs
- Configuração automática via reflection

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório ou entre em contato através do email: seu-email@exemplo.com

---

**Desenvolvido com ❤️ para o Desafio CCAA**
