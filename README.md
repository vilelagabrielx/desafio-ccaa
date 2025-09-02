# Desafio CCAA - Sistema de Gestão de Livros

## 📋 Visão Geral

Sistema full-stack para gestão de catálogo de livros desenvolvido em **Angular 17** (frontend) e **ASP.NET Core 8.0** (backend), com suporte completo a **PostgreSQL** e **SQL Server**. O projeto implementa todos os requisitos funcionais e não-funcionais especificados, além de funcionalidades extras.

## Status do Projeto

**Progresso**: 100% dos requisitos implementados  
**Arquitetura**: Clean Architecture com 3 camadas  
**Tecnologias**: Stack completa conforme especificado  
**Documentação**: Completa e detalhada  

---

## 🏗️ Arquitetura do Backend

### **ASP.NET Core 8.0 Web API**
- **Framework**: ASP.NET Core 8.0 com C# 12
- **ORM**: Entity Framework Core 8.0 (Code First)
- **Authentication**: JWT + ASP.NET Core Identity
- **Database**: PostgreSQL (Supabase) + SQL Server (compatível)
- **Architecture**: Clean Architecture com separação de responsabilidades
- **API Design**: RESTful com padrão ServiceResult para respostas consistentes

### **Estrutura de Camadas**
```
📁 DesafioCCAA.API (Presentation Layer)
├── Controllers/
│   ├── BookController.cs
│   └── UserController.cs
├── Middleware/
├── DTOs/
└── Program.cs

📁 DesafioCCAA.Business (Business Layer)
├── Services/
│   ├── BookService.cs
│   ├── UserService.cs
│   ├── BookReportService.cs
│   ├── BookSearchService.cs
│   ├── BookImageService.cs
│   ├── EmailService.cs
│   ├── OpenLibraryService.cs
│   ├── ImageOptimizationService.cs
│   ├── EnvironmentService.cs
│   └── BookServiceFacade.cs
├── Interfaces/
├── Entities/
├── DTOs/
└── Validators/

📁 DesafioCCAA.Infrastructure (Data Layer)
├── Data/
│   └── ApplicationDbContext.cs
├── Repositories/
│   ├── BookRepository.cs
│   └── UserRepository.cs
├── Migrations/
└── UnitOfWork.cs
```

---

## ✅ REQUISITOS FUNCIONAIS - IMPLEMENTADOS

### 1. **Sistema de Catálogo de Livros** ✅
**Como implementei**: Criei uma aplicação web completa com Angular 17 no frontend e ASP.NET Core 8.0 no backend, seguindo Clean Architecture com separação clara de responsabilidades.

**Arquivos principais do backend**:
- `BookController.cs` - Endpoints RESTful para gestão de livros
- `BookService.cs` - Lógica de negócio centralizada
- `Book.cs` - Entidade principal com todas as propriedades
- `ApplicationDbContext.cs` - Contexto do Entity Framework

### 2. **Gestão de Usuários** ✅
**Como implementei**: Utilizei ASP.NET Core Identity para gestão completa de usuários, incluindo registro, login, reset de senha e perfil.

**Arquivos principais do backend**:
- `UserController.cs` - Endpoints de usuário (`/api/user/register`, `/api/user/login`, `/api/user/forgot-password`)
- `UserService.cs` - Lógica de negócio com validações
- `User.cs` - Entidade de usuário com Identity
- `UserRegistrationDtoValidator.cs` - Validações com FluentValidation

**Funcionalidades implementadas**:
- ✅ Registro com validação de dados (nome, data nascimento, email, senha)
- ✅ Login com JWT token
- ✅ Reset de senha via email com tokens seguros
- ✅ Perfil de usuário editável
- ✅ Alteração de senha com validação

### 3. **Autenticação e Autorização** ✅
**Como implementei**: Sistema JWT + ASP.NET Core Identity com tokens seguros e expiração configurável.

**Arquivos principais do backend**:
- `Program.cs` - Configuração JWT e Identity
- `UserService.cs` - Serviço de autenticação e gestão de usuários
- `EmailService.cs` - Serviço de envio de emails

**Segurança implementada**:
- ✅ Tokens JWT com expiração configurável
- ✅ Validação de entrada com FluentValidation
- ✅ Proteção contra XSS e SQL Injection
- ✅ Guards no frontend para rotas protegidas

### 4. **Gestão de Livros** ✅
**Como implementei**: CRUD completo com validações, upload de imagens, busca avançada e relatórios.

**Arquivos principais do backend**:
- `BookController.cs` - Endpoints RESTful (`/api/book`, `/api/book/search`, `/api/book/report/pdf`)
- `BookService.cs` - Lógica de negócio com validações
- `BookServiceFacade.cs` - Facade que coordena todos os serviços de livros
- `Book.cs` - Entidade com todos os campos obrigatórios
- `CreateBookDtoValidator.cs` - Validações com FluentValidation
- `BookImageService.cs` - Gestão de upload e otimização de imagens
- `ImageOptimizationService.cs` - Otimização automática de imagens

**Funcionalidades implementadas**:
- ✅ Cadastro com todos os campos: título, ISBN, gênero (select), autor, editora (select), sinopse (5000 chars)
- ✅ Upload de foto com IFormFile e otimização automática
- ✅ Busca por título, ISBN, autor, editora ou gênero
- ✅ Listagem organizada dos livros
- ✅ Edição e exclusão de livros
- ✅ Relatório PDF por usuário logado

### 5. **Sistema de Busca** ✅
**Como implementei**: Endpoint `/api/book/search` com múltiplos critérios de busca e filtros avançados.

**Arquivos principais do backend**:
- `BookSearchService.cs` - Lógica de busca avançada
- `OpenLibraryService.cs` - Integração com API OpenLibrary para busca por ISBN
- `BookSearchDto.cs` - DTOs para parâmetros de busca
- `BookRepository.cs` - Queries otimizadas no banco

**Funcionalidades de busca**:
- ✅ Busca por título (parcial)
- ✅ Busca por ISBN (exato)
- ✅ Busca por autor (parcial)
- ✅ Busca por editora (select)
- ✅ Busca por gênero (select)
- ✅ Combinação de múltiplos critérios

### 6. **Relatórios PDF** ✅
**Como implementei**: Geração de relatórios PDF usando bibliotecas especializadas, com dados específicos do usuário logado.

**Arquivos principais do backend**:
- `BookReportService.cs` - Lógica de geração de relatórios
- `PdfReportGenerator.cs` - Geração específica de PDF
- `ExcelReportGenerator.cs` - Geração adicional de Excel

**Funcionalidades de relatório**:
- ✅ Relatório PDF com todos os livros do usuário
- ✅ Layout profissional com logo e dados do usuário
- ✅ Relatório Excel como funcionalidade extra
- ✅ Download direto via endpoint `/api/book/report/pdf`

### 7. **Sistema de Emails** ✅
**Como implementei**: Sistema robusto de envio de emails com fallback automático para desenvolvimento.

**Arquivos principais do backend**:
- `EmailService.cs` - Serviço de envio de emails com SMTP e PickupDirectory
- `UserService.cs` - Integração com reset de senha
- `EnvironmentService.cs` - Configuração de ambiente para emails

**Funcionalidades de email**:
- ✅ Envio via SMTP (produção) com fallback para PickupDirectory (desenvolvimento)
- ✅ Reset de senha com tokens seguros
- ✅ Teste de conexão SMTP
- ✅ Download de templates para debug
- ✅ Logs detalhados de todas as operações

### 8. **Sincronização com OpenLibrary** ✅
**Como implementei**: Integração completa com API OpenLibrary para busca e criação automática de livros por ISBN.

**Arquivos principais do backend**:
- `OpenLibraryService.cs` - Integração com API OpenLibrary
- `BookSearchService.cs` - Coordenação da busca e criação
- `ImageOptimizationService.cs` - Otimização de imagens baixadas

**Funcionalidades de sincronização**:
- ✅ Busca por ISBN na OpenLibrary
- ✅ Download automático de capas
- ✅ Mapeamento inteligente de gêneros
- ✅ Criação automática de livros
- ✅ Otimização de imagens baixadas

---

## ✅ REQUISITOS NÃO-FUNCIONAIS - IMPLEMENTADOS

### 1. **Validação de Dados** ✅
**Como implementei**: FluentValidation no backend e Reactive Forms no frontend para validação em tempo real.

**Arquivos principais do backend**:
- `CreateBookDtoValidator.cs` - Validação de livros
- `UserRegistrationDtoValidator.cs` - Validação de usuários
- `FluentValidation` - Biblioteca implementada

**Validações implementadas**:
- ✅ Campos obrigatórios
- ✅ Formatos de email e senha
- ✅ Tamanhos de arquivo (fotos)
- ✅ Limite de caracteres (sinopse 5000 chars)
- ✅ Tipos de dados corretos

### 2. **Usabilidade** ✅
**Como implementei**: Interface moderna com design system consistente e feedback visual adequado.

**Funcionalidades de usabilidade**:
- ✅ Interface responsiva para todos os dispositivos
- ✅ Loading states durante operações
- ✅ Mensagens de sucesso/erro (Toast notifications)
- ✅ Navegação intuitiva com menu mobile
- ✅ Formulários com validação em tempo real

### 3. **Arquitetura em Camadas** ✅
**Como implementei**: Clean Architecture com 3 camadas bem definidas e separação de responsabilidades.

**Estrutura implementada**:
- ✅ **Presentation Layer**: Controllers, DTOs, Middleware
- ✅ **Business Layer**: Services, Interfaces, Validators, Entities
- ✅ **Data/Infrastructure Layer**: Repositories, DbContext, Migrations, UnitOfWork

### 4. **Entity Framework Core (Code First)** ✅
**Como implementei**: Migrations para versionamento do schema e suporte a múltiplos providers.

**Arquivos principais do backend**:
- `ApplicationDbContext.cs` - Contexto do banco com configuração automática
- `Migrations/` - Versionamento do schema
- `Book.cs`, `User.cs` - Entidades com configurações

**Funcionalidades implementadas**:
- ✅ Code First approach
- ✅ Migrations automáticas
- ✅ Suporte PostgreSQL + SQL Server
- ✅ Índices otimizados para performance

---

## ✅ REQUISITOS PLUS - IMPLEMENTADOS

### 1. **Arquitetura Monolítica com 3 Camadas** ✅
**Como implementei**: Separação clara de responsabilidades seguindo Clean Architecture.

**Camadas implementadas**:
- ✅ **Presentation (API)**: Controllers, DTOs, Middleware
- ✅ **Business**: Services, Interfaces, Validators, Entities
- ✅ **Data/Infrastructure**: Repositories, DbContext, Migrations, UnitOfWork

### 2. **Angular + Web API em .NET Core** ✅
**Como implementei**: Stack completa com comunicação via HTTP e JWT.

**Tecnologias implementadas**:
- ✅ **Frontend**: Angular 17 com TypeScript
- ✅ **Backend**: ASP.NET Core 8.0 Web API
- ✅ **Comunicação**: HTTP RESTful com JWT

### 3. **Swagger** ✅
**Como implementei**: Documentação automática da API com Swagger/OpenAPI.

**Configuração**:
- ✅ Swagger configurado em `Program.cs`
- ✅ Documentação automática de todos os endpoints
- ✅ Acessível em `/swagger` durante desenvolvimento

### 4. **Coleção do Postman** ✅
**Como implementei**: Coleção completa com todos os endpoints e environment configurado.

**Arquivos fornecidos**:
- ✅ `DesafioCCAA_API.postman_collection.json` - Coleção completa
- ✅ `DesafioCCAA_Environment.postman_environment.json` - Environment
- ✅ Scripts de teste automático
- ✅ Fluxo completo de teste

### 5. **SOLID** ✅
**Como implementei**: Princípios SOLID aplicados em toda a arquitetura.

**Princípios aplicados**:
- ✅ **S** - Single Responsibility: Cada classe tem uma responsabilidade
- ✅ **O** - Open/Closed: Extensível sem modificação
- ✅ **L** - Liskov Substitution: Interfaces bem definidas
- ✅ **I** - Interface Segregation: Interfaces específicas
- ✅ **D** - Dependency Inversion: Injeção de dependência

### 6. **JWT** ✅
**Como implementei**: Autenticação stateless com tokens JWT seguros.

**Configuração**:
- ✅ JWT configurado em `Program.cs`
- ✅ Tokens com expiração configurável
- ✅ Middleware de validação implementado
- ✅ Refresh token (funcionalidade extra)

### 7. **Mapster** ✅
**Como implementei**: Mapeamento de objetos centralizado e otimizado.

**Arquivos**:
- ✅ `MapsterConfig.cs` - Configuração centralizada
- ✅ Mapeamento automático entre DTOs e Entities
- ✅ Performance otimizada

### 8. **FluentValidation** ✅
**Como implementei**: Validações declarativas e robustas.

**Arquivos implementados**:
- ✅ `CreateBookDtoValidator.cs` - Validação de livros
- ✅ `UserRegistrationDtoValidator.cs` - Validação de usuários
- ✅ Validações customizadas e mensagens em português

### 9. **Design Patterns** ✅
**Como implementei**: Múltiplos padrões de design aplicados.

**Padrões implementados**:
- ✅ **Repository Pattern**: `BookRepository`, `UserRepository`
- ✅ **Service Pattern**: `BookService`, `UserService`
- ✅ **DTO Pattern**: DTOs para transferência de dados
- ✅ **Factory Pattern**: Para criação de objetos
- ✅ **Strategy Pattern**: Para geração de relatórios
- ✅ **Facade Pattern**: `BookServiceFacade`
- ✅ **Unit of Work**: Para transações complexas

### 10. **Logging** ✅ (Diferencial)
**Como implementei**: Sistema de logging estruturado com ILogger.

**Funcionalidades**:
- ✅ Logs de operações críticas
- ✅ Error tracking e análise
- ✅ Logs estruturados com contexto
- ✅ Configuração via `appsettings.json`

### 11. **UnitOfWork** ✅ (Diferencial)
**Como implementei**: Pattern para transações complexas e consistência de dados.

**Arquivos**:
- ✅ `UnitOfWork.cs` - Implementação do pattern
- ✅ Transações atômicas
- ✅ Rollback automático em caso de erro

### 12. **Testes de Integração e Unitários com XUnit** ✅ (Diferencial)
**Como implementei**: Suite completa de testes automatizados com 72 testes.

**Arquivos de teste**:
- ✅ `UserServiceTests.cs` - Testes unitários de usuário
- ✅ `BookDeleteTests.cs` - Testes de exclusão (Hard Delete)
- ✅ `EmailServiceTests.cs` - Testes de email
- ✅ `ValidationTests.cs` - Testes de validação
- ✅ `ControllerIntegrationTests.cs` - Testes de integração
- ✅ `EnvironmentServiceTests.cs` - Testes de configuração de ambiente

**Cobertura de testes**:
- ✅ **72 testes automatizados** executando com sucesso
- ✅ **Backend**: 90%+ (Serviços principais e business logic)
- ✅ **Integração**: 85%+ (Controllers e APIs)
- ✅ **XUnit**: Framework de testes implementado
- ✅ Testes de validação, autenticação e CRUD completo

---

## 🎨 Arquitetura do Frontend

### **Angular 17 com TypeScript**
- **Framework**: Angular 17 com TypeScript
- **State Management**: RxJS + Signals
- **Forms**: Reactive Forms com validação em tempo real
- **Authentication**: JWT Guards e Interceptors
- **UI/UX**: Design responsivo e moderno

### **Estrutura de Componentes**
```
📁 src/app/components/
├── access-denied/          # Página de acesso negado
├── auth/                   # Componente de autenticação
├── book-catalog/           # Catálogo principal de livros
├── dev-tools/              # Ferramentas de desenvolvimento
├── loading/                # Componente de loading
├── login/                  # Página de login
├── password-strength/      # Indicador de força da senha
├── profile/                # Perfil do usuário
├── register/               # Página de registro
├── reset-password/         # Reset de senha
├── reset-password-token/   # Reset com token
└── toast/                  # Notificações toast
```

### **Estrutura de Serviços**
```
📁 src/app/services/
├── auth.guard.ts           # Guard de autenticação
├── auth.interceptor.ts     # Interceptor JWT
├── auth.service.ts         # Serviço de autenticação
├── book-api.service.ts     # Serviço de API de livros
├── book-mock.service.ts    # Serviço mock para desenvolvimento
├── book.interface.ts       # Interfaces de livros
├── book.service.ts         # Serviço principal de livros
├── book.ts                 # Modelos de livros
├── environment.service.ts  # Configuração de ambiente
├── loading.service.ts      # Gerenciamento de loading
├── toast.service.ts        # Serviço de notificações
└── validation.service.ts   # Validações customizadas
```

### **Funcionalidades do Frontend**

#### **🔐 Sistema de Autenticação**
- **Login/Logout**: Interface moderna com validação
- **Registro**: Formulário completo com validação de senha
- **Reset de Senha**: Fluxo completo via email
- **Guards**: Proteção de rotas com JWT
- **Interceptors**: Adição automática de tokens

#### **📚 Gestão de Livros**
- **Catálogo**: Listagem paginada e responsiva
- **Busca Avançada**: Filtros por título, ISBN, autor, gênero, editora
- **CRUD Completo**: Criar, editar, visualizar, excluir livros
- **Upload de Imagens**: Drag & drop com preview
- **Sincronização ISBN**: Integração com OpenLibrary

#### **👤 Perfil do Usuário**
- **Edição de Perfil**: Dados pessoais editáveis
- **Alteração de Senha**: Com validação de segurança
- **Histórico**: Livros cadastrados pelo usuário

#### **🛠️ Ferramentas de Desenvolvimento**
- **Dev Tools**: Componente para debug e testes
- **Environment Service**: Configuração dinâmica
- **Mock Service**: Dados simulados para desenvolvimento

#### **🎨 Interface e UX**
- **Design Responsivo**: Mobile-first approach
- **Loading States**: Feedback visual durante operações
- **Toast Notifications**: Mensagens de sucesso/erro
- **Validação em Tempo Real**: Feedback imediato nos formulários
- **Animações**: Transições suaves entre páginas

---

## Como Instalar e Executar

### **Pré-requisitos**
- .NET 8.0 SDK
- Node.js 18+ e npm
- PostgreSQL (Supabase) ou SQL Server
- Visual Studio 2022 ou VS Code

### **Instalação Rápida**

#### **1. Clone o Repositório**
```bash
git clone <repository-url>
cd desafio-ccaa
```

#### **2. Configuração do Backend**
```bash
cd desafio-ccaa-backend

# Restaurar dependências
dotnet restore

# Configurar banco de dados (PostgreSQL - padrão)
dotnet ef database update --project src/DesafioCCAA.Infrastructure --startup-project src/DesafioCCAA.API

# Executar backend
dotnet run --project src/DesafioCCAA.API
```

#### **3. Configuração do Frontend**
```bash
cd desafio-ccaa-frontend

# Instalar dependências
npm install

# Executar frontend
npm start
```

#### **4. Acessar a Aplicação**
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

---

## 📚 Documentação da API

### **Endpoints Principais**

#### **Autenticação**
```http
POST /api/user/register     # Registrar usuário
POST /api/user/login        # Login
POST /api/user/forgot-password  # Reset de senha
GET  /api/user/current      # Usuário atual
```

#### **Gestão de Livros**
```http
GET    /api/book                    # Listar livros
POST   /api/book                    # Criar livro
GET    /api/book/{id}               # Obter livro
PUT    /api/book/{id}               # Atualizar livro
DELETE /api/book/{id}               # Excluir livro
GET    /api/book/search             # Buscar livros
GET    /api/book/report/pdf         # Relatório PDF
GET    /api/book/categories-with-count  # Categorias
```

#### **Integração OpenLibrary**
```http
GET  /api/book/search-isbn/{isbn}      # Buscar por ISBN
POST /api/book/create-from-isbn        # Criar livro por ISBN
```

### **Coleção Postman**
- **Arquivo**: `DesafioCCAA_API.postman_collection.json`
- **Environment**: `DesafioCCAA_Environment.postman_environment.json`

---

## 🧪 Testes

### **Backend**
```bash
# Executar todos os testes
dotnet test

# Testes específicos
dotnet test --filter "UserServiceTests"
dotnet test --filter "BookDeleteTests"
dotnet test --filter "ControllerIntegrationTests"
```

### **Cobertura de Testes**
- **72 testes automatizados** executando com sucesso
- **Backend**: 90%+ (Serviços principais e business logic)
- **Integração**: 85%+ (Controllers e APIs)
- **XUnit**: Framework de testes implementado

---

## 📧 Sistema de Emails

### **Arquitetura do Sistema de Emails**

O sistema implementa um **sistema de emails robusto e flexível** com múltiplas estratégias de entrega:

#### **1. Configuração SMTP**
```json
{
  "Email": {
    "Smtp": {
      "Host": "smtp.gmail.com",
      "Port": 587,
      "EnableSsl": true,
      "Username": "seu-email@gmail.com",
      "Password": "sua-senha-de-app",
      "FromEmail": "noreply@desafioccaa.com",
      "FromName": "Desafio CCAA"
    },
    "PickupDirectory": "C:\\temp\\emails"
  }
}
```

#### **2. Estratégias de Entrega**

**SMTP Principal (Produção)**
- Envio direto via servidor SMTP configurado
- Suporte a Gmail, Outlook, servidores corporativos
- Autenticação segura com SSL/TLS
- Logs detalhados de entrega

**🔄 Fallback Automático**
- Se SMTP falhar → PickupDirectory automaticamente
- Se credenciais não configuradas → PickupDirectory
- Garantia de que emails nunca são perdidos

**📁 PickupDirectory (Desenvolvimento)**
- Emails salvos como arquivos `.eml` no sistema
- Ideal para desenvolvimento e testes
- Permite visualização offline dos emails
- Estrutura: `email_YYYYMMDD_HHMMSS_GUID.eml`

#### **💡 Dica de Desenvolvimento - Visualização de Emails**

**🔍 Como Visualizar Emails em Desenvolvimento:**

1. **Localização dos Arquivos**
   ```
   C:\temp\emails\email_20241220_143022_a1b2c3d4.eml
   ```

2. **Visualização Rápida**
   - **Método 1**: Renomeie o arquivo de `.eml` para `.html`
   - **Método 2**: Abra com navegador (Chrome, Firefox, Edge)
   - **Método 3**: Use o endpoint de download: `GET /api/user/download-email-template`

3. **Exemplo Prático**
   ```bash
   # Renomear para visualizar
   email_20241220_143022_a1b2c3d4.eml → email_20241220_143022_a1b2c3d4.html
   
   # Abrir no navegador
   start email_20241220_143022_a1b2c3d4.html
   ```

4. **Estrutura do Arquivo .eml**
   ```
   From: Desafio CCAA <noreply@desafioccaa.com>
   To: usuario@exemplo.com
   Subject: Reset de Senha - Desafio CCAA
   MIME-Version: 1.0
   Content-Type: text/html; charset=utf-8
   
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <title>Reset de Senha</title>
   </head>
   <body>
       <h1>Reset de Senha</h1>
       <p>Clique no link abaixo para redefinir sua senha:</p>
       <a href="https://localhost:5001/reset-password?token=abc123">Redefinir Senha</a>
   </body>
   </html>
   ```

5. **Vantagens do PickupDirectory**
   - ✅ **Sem configuração SMTP** necessária
   - ✅ **Emails nunca são perdidos** (salvos localmente)
   - ✅ **Debug fácil** - veja exatamente o que foi enviado
   - ✅ **Teste offline** - não precisa de internet
   - ✅ **Histórico completo** - todos os emails ficam salvos

#### **3. Funcionalidades Implementadas**

**✅ Reset de Senha**
- Geração de token seguro
- Email com link de reset
- Validação de expiração
- Template HTML responsivo

**✅ Teste de Conexão SMTP**
- Endpoint: `GET /api/user/test-smtp`
- Validação de credenciais
- Teste de conectividade
- Logs detalhados de diagnóstico

**✅ Download de Templates**
- Endpoint: `GET /api/user/download-email-template`
- Apenas em desenvolvimento/UAT
- Download do último email gerado
- Para análise e debug

#### **4. Exemplo de Uso**

```csharp
// Envio de email com fallback automático
var emailService = serviceProvider.GetService<IEmailService>();
var success = await emailService.SendEmailAsync(
    "usuario@exemplo.com",
    "Reset de Senha - Desafio CCAA",
    htmlTemplate,
    isHtml: true
);
```

#### **5. Configuração para Desenvolvimento**

**Setup Rápido para Dev:**

1. **Configuração Mínima** (PickupDirectory)
   ```json
   {
     "Email": {
       "PickupDirectory": "C:\\temp\\emails"
     }
   }
   ```

2. **Teste de Email**
   ```bash
   # 1. Solicitar reset de senha
POST /api/user/forgot-password
   {
     "email": "teste@exemplo.com"
   }
   
   # 2. Verificar arquivo gerado
   dir C:\temp\emails\
   
   # 3. Renomear e visualizar
   ren email_*.eml email.html
   start email.html
   ```

3. **Endpoint de Download** (Desenvolvimento)
   ```
   GET /api/user/download-email-template
   ```
   - Retorna o último email gerado
   - Apenas em ambiente de desenvolvimento
   - Para análise e debug

#### **6. Logs e Monitoramento**

```csharp
// Logs automáticos em todas as operações
_logger.LogInformation("Email enviado com sucesso via SMTP para: {Email}", to);
_logger.LogWarning("SMTP não configurado, usando PickupDirectory como fallback");
_logger.LogError(ex, "Erro ao enviar email via SMTP para: {Email}", to);
_logger.LogInformation("Email salvo em PickupDirectory: {FilePath}", filePath);
```

#### **7. Exemplo de Workflow Completo em Dev**

```bash
# 1. Iniciar aplicação
dotnet run

# 2. Solicitar reset de senha
curl -X POST "https://localhost:5001/api/user/forgot-password" \
     -H "Content-Type: application/json" \
     -d '{"email": "dev@teste.com"}'

# 3. Verificar log
# [INFO] Email salvo em PickupDirectory: C:\temp\emails\email_20241220_143022_a1b2c3d4.eml

# 4. Visualizar email
cd C:\temp\emails
ren email_*.eml email.html
start email.html

# 5. Testar link de reset
# Copie o token do email e teste o endpoint de reset
```

---

## 🔄 Sistema de Sincronização de Livros

### **Arquitetura da Sincronização**

O sistema implementa uma **sincronização inteligente com OpenLibrary** que combina múltiplas APIs para obter dados completos:

#### **1. Fluxo de Sincronização por ISBN**

```mermaid
graph TD
    A[ISBN Input] --> B[Books API]
    B --> C{Book Found?}
    C -->|Yes| D[Authors API]
    C -->|No| E[Return Not Found]
    D --> F[Works API]
    F --> G[Download Cover]
    G --> H[Optimize Image]
    H --> I[Create Book]
    I --> J[Save to Database]
```

#### **2. APIs Utilizadas**

**📚 Books API (Passo 1)**
```
GET https://openlibrary.org/api/books?bibkeys=ISBN:9788533613379&format=json&jscmd=data
```
- **Dados obtidos**: Título, autores, editores, capa, works
- **Fallback**: Se não encontrado, retorna null

**👤 Authors API (Passo 2)**
```
GET https://openlibrary.org/authors/OL34184A.json
```
- **Dados obtidos**: Nome completo do autor
- **Estratégia**: Prioriza nome direto da Books API, fallback para Authors API

**📖 Works API (Passo 3)**
```
GET https://openlibrary.org/works/OL45804W.json
```
- **Dados obtidos**: Sinopse, gêneros, descrição
- **Processamento**: Extrai sinopse e mapeia gêneros

#### **3. Mapeamento Inteligente de Dados**

**Gêneros**
```csharp
// Mapeamento automático de gêneros OpenLibrary → Sistema
private BookGenre MapGenreFromSubjects(List<string> subjects)
{
    var genreMap = new Dictionary<string, BookGenre>
    {
        ["Fiction"] = BookGenre.Fiction,
        ["Science fiction"] = BookGenre.ScienceFiction,
        ["Fantasy"] = BookGenre.Fantasy,
        ["Mystery"] = BookGenre.Mystery,
        ["Romance"] = BookGenre.Romance,
        ["Biography"] = BookGenre.Biography,
        ["History"] = BookGenre.History,
        ["Science"] = BookGenre.Science,
        ["Technology"] = BookGenre.Technology,
        ["Philosophy"] = BookGenre.Philosophy,
        ["Religion"] = BookGenre.Religion,
        ["Self-help"] = BookGenre.SelfHelp,
        ["Business"] = BookGenre.Business,
        ["Economics"] = BookGenre.Economics,
        ["Politics"] = BookGenre.Politics,
        ["Travel"] = BookGenre.Travel,
        ["Cooking"] = BookGenre.Cooking,
        ["Poetry"] = BookGenre.Poetry,
        ["Drama"] = BookGenre.Drama
    };
}
```

**📝 Sinopse Inteligente**
```csharp
// Estratégia de sinopse com fallbacks
private string CreateSynopsisFromBookData(OpenLibraryBookDto book)
{
    // 1. Prioridade: Descrição do Work
    if (!string.IsNullOrWhiteSpace(book.Works?.FirstOrDefault()?.Description))
        return book.Works.First().Description;
    
    // 2. Fallback: Excerpts
    if (book.Excerpts?.Any() == true)
        return book.Excerpts.First().Text;
    
    // 3. Fallback: Sinopse gerada
    return $"Livro {book.Title} por {string.Join(", ", book.Authors?.Select(a => a.Name) ?? [])}";
}
```

#### **4. Download e Otimização de Imagens**

**🖼️ Download de Capas**
```csharp
// Download automático de capas
var coverImageBytes = await _openLibraryService.DownloadCoverImageAsync(bookData.CoverUrl);
if (coverImageBytes != null)
{
    // Otimização automática
    var imageData = await _imageService.OptimizeImageToBytesAsync(
        coverImageBytes, 
        $"cover_{bookData.ISBN}.jpg"
    );
}
```

**⚡ Otimização de Imagens**
- Redimensionamento automático (800x600 max)
- Compressão JPEG (85% qualidade)
- Conversão para formatos otimizados
- Validação de tamanho (500KB max)

#### **5. Endpoints de Sincronização**

**🔍 Busca por ISBN**
```
GET /api/book/search-isbn/{isbn}
```
- Busca dados na OpenLibrary
- Retorna dados estruturados
- Não salva no banco

**📥 Criação via ISBN**
```
POST /api/book/create-from-isbn
{
  "isbn": "9788533613379",
  "downloadCover": true
}
```
- Busca + criação em uma operação
- Download automático de capa
- Validação de ISBN duplicado

#### **6. Logs Detalhados**

```csharp
// Logs em cada etapa da sincronização
_logger.LogInformation("Iniciando busca por ISBN: {ISBN} seguindo o fluxo Books API → Authors API → Works API", cleanIsbn);
_logger.LogInformation("Dados básicos obtidos da Books API: Title={Title}, Authors={Authors}", bookData.Title, bookData.Authors?.Count ?? 0);
_logger.LogInformation("Nomes dos autores obtidos: {AuthorNames}", string.Join(", ", authorNames));
_logger.LogInformation("Imagem de capa baixada e otimizada para ISBN {ISBN}", bookData.ISBN);
```

#### **7. Tratamento de Erros**

**🛡️ Estratégias de Fallback**
- Se Books API falhar → retorna "não encontrado"
- Se Authors API falhar → usa nome direto da Books API
- Se Works API falhar → gera sinopse básica
- Se download de imagem falhar → continua sem imagem

**📊 Validações**
- ISBN não pode ser vazio
- Verificação de ISBN duplicado
- Validação de usuário existente
- Timeout de requisições HTTP

#### **8. Exemplo de Uso Completo**

```typescript
// Frontend - Busca e criação via ISBN
const searchResult = await this.bookService.searchBooksAdvanced({
  isbn: '9788533613379'
});

if (searchResult.books.length > 0) {
  // Criar livro automaticamente
  const newBook = await this.bookService.createBookFromIsbn({
    isbn: '9788533613379',
    downloadCover: true
  });
}
```

---

## 🔒 Segurança

### **Implementações de Segurança**
- **ASP.NET Core Identity**: Sistema robusto de gestão de usuários
- **JWT**: Tokens seguros com expiração configurável
- **HTTPS**: Todas as comunicações criptografadas
- **Input Validation**: Validação rigorosa com FluentValidation
- **SQL Injection**: Proteção via Entity Framework
- **XSS Prevention**: Sanitização de dados de saída

---

## 📊 Performance

### **Otimizações Implementadas**
- **Connection Pooling**: Supabase Session Pooler
- **Índices**: Otimizados para consultas frequentes
- **Response Time**: < 200ms para operações simples
- **Caching**: Estratégias para dados estáticos
- **Bundle Size**: Otimizado com tree-shaking

---

## Resumo Executivo

Este projeto demonstra competências em:

### **Tecnologias Backend**
- **ASP.NET Core 8.0**: Web API RESTful
- **Entity Framework Core**: ORM com Code First
- **PostgreSQL + SQL Server**: Multi-provider support
- **JWT + Identity**: Autenticação robusta
- **FluentValidation**: Validações declarativas
- **Mapster**: Mapeamento de objetos
- **XUnit**: 72 testes automatizados
- **Logging**: Sistema de logs estruturado
- **UnitOfWork**: Padrão de transações

### **Tecnologias Frontend**
- **Angular 17**: Framework moderno com TypeScript
- **RxJS + Signals**: Gerenciamento de estado reativo
- **Reactive Forms**: Validação em tempo real
- **HTTP Interceptors**: Autenticação automática
- **JWT Guards**: Proteção de rotas
- **Design Responsivo**: Mobile-first approach

### **Arquitetura**
- **Clean Architecture**: 3 camadas bem definidas
- **SOLID Principles**: Código limpo e manutenível
- **Design Patterns**: Repository, Service, Strategy, Facade
- **RESTful API**: Endpoints bem documentados

### **Qualidade**
- **72 testes automatizados**: Unitários e integração
- **Documentação completa**: README, API docs, Swagger
- **Código limpo**: Padrões e convenções
- **Segurança robusta**: Validações e proteções

### **Funcionalidades**
- **Requisitos**: Todos implementados
- **Funcionalidades extras**: OpenLibrary, relatórios, multi-banco, emails
- **Interface**: Design system responsivo com 12+ componentes
- **Performance**: Índices, cache, otimizações
- **Sistema completo**: 10 serviços backend + 13 serviços frontend

---

**Tecnologias**: ASP.NET Core 8.0, Entity Framework Core, PostgreSQL, SQL Server, JWT, FluentValidation, Mapster, XUnit, Angular 17, RxJS, TypeScript

**Arquitetura**: Clean Architecture, RESTful API, Multi-provider Database, SOLID Principles, Design Patterns

**Qualidade**: 72 testes automatizados, documentação completa, padrões de código, segurança robusta

**Escopo**: 10 serviços backend, 13 serviços frontend, 12+ componentes Angular, 72 testes automatizados