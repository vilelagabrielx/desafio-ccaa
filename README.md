# 🚀 Desafio CCAA - Sistema de Gestão de Livros

## 📋 Visão Geral

Sistema full-stack para gestão de livros com autenticação local, desenvolvido em **Angular 17** (frontend) e **ASP.NET Core 8.0** (backend), utilizando **PostgreSQL** como banco de dados.

## 🏗️ Arquitetura

### **Frontend (Angular 17)**
- **Framework**: Angular 17 com TypeScript
- **UI Components**: Componentes reutilizáveis com Angular Material
- **State Management**: RxJS BehaviorSubject para gerenciamento de estado
- **Authentication**: JWT + ASP.NET Core Identity
- **Forms**: Reactive Forms com validações customizadas
- **Responsive Design**: Layout adaptável para diferentes dispositivos

### **Backend (ASP.NET Core 8.0)**
- **Framework**: ASP.NET Core 8.0 Web API
- **ORM**: Entity Framework Core 8.0
- **Authentication**: JWT + ASP.NET Core Identity
- **Database**: PostgreSQL (Supabase)
- **Architecture**: Clean Architecture com separação de responsabilidades
- **API Design**: RESTful com padrão ServiceResult para respostas consistentes

### **Database (PostgreSQL)**
- **Provider**: Supabase (PostgreSQL as a Service)
- **Connection**: Session Pooler (porta 5432) para estabilidade
- **Migrations**: Entity Framework Core migrations para versionamento do schema
- **Indexes**: Índices otimizados para consultas frequentes

## 🔐 Sistema de Autenticação

### **ASP.NET Core Identity + JWT**
- **Local Authentication**: Sistema de autenticação próprio
- **User Management**: Gestão local de usuários com Identity
- **Security**: JWT tokens com expiração configurável
- **Password Policies**: Políticas de senha configuráveis via Identity

### **Email System**
- **PickupDirectory**: Sistema de envio de e-mails via arquivos .eml locais
- **Password Reset**: Recuperação de senha com tokens seguros
- **Email Templates**: Templates HTML para notificações

**Nota**: O envio de e-mail está configurado via PickupDirectory, que grava arquivos .eml localmente. Em produção bastaria trocar para um provedor real como SendGrid/SMTP.

## 🗄️ Estrutura do Banco

### **Entidades Principais**
```sql
-- Tabela de Usuários
CREATE TABLE "AspNetUsers" (
    "Id" VARCHAR(450) PRIMARY KEY,
    "UserName" VARCHAR(256),
    "Email" VARCHAR(256),
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "DateOfBirth" TIMESTAMP,
    "EmailConfirmed" BOOLEAN,
    "PhoneNumber" VARCHAR(20),
    "PhoneNumberConfirmed" BOOLEAN,
    "TwoFactorEnabled" BOOLEAN,
    "LockoutEnd" TIMESTAMP,
    "LockoutEnabled" BOOLEAN,
    "AccessFailedCount" INTEGER,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP,
    "IsActive" BOOLEAN DEFAULT true
);

-- Tabela de Livros
CREATE TABLE "Books" (
    "Id" INTEGER PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Author" VARCHAR(200) NOT NULL,
    "ISBN" VARCHAR(20),
    "PublicationYear" INTEGER,
    "Genre" VARCHAR(100),
    "Description" TEXT,
    "Available" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Índices e Performance**
- **Email**: Índice único para usuários
- **ISBN**: Índice para busca de livros
- **Title + Author**: Índice composto para busca textual

## 🔧 Configuração e Deploy

### **Pré-requisitos**
- .NET 8.0 SDK
- Node.js 18+ e npm
- PostgreSQL (ou Supabase)

### **Configuração Rápida**
```bash
# 1. Clone o repositório
git clone <repository-url>
cd desafio-ccaa

# 2. Backend
cd desafio-ccaa-backend/src/DesafioCCAA.API
dotnet restore
dotnet ef database update
dotnet run

# 3. Frontend
cd desafio-ccaa-frontend
npm install
npm start
```

### **🚀 Arquivos de Execução Rápida (.bat)**

Para facilitar o desenvolvimento, o projeto inclui arquivos .bat organizados por funcionalidade:

#### **Backend (desafio-ccaa-backend/)**
- **`start-backend.bat`** - Inicia a API .NET Core
- **`stop-backend.bat`** - Finaliza todos os processos .NET
- **`run-migration.bat`** - Executa migrations do banco de dados
- **`sync-config.bat`** - Sincroniza configurações em todos os arquivos

#### **Frontend (desafio-ccaa-frontend/)**
- **`start-frontend.bat`** - Inicia a aplicação Angular
- **`stop-frontend.bat`** - Finaliza todos os processos Node.js

#### **Como Usar:**
```bash
# 1. Executar migration (sempre primeiro)
cd desafio-ccaa-backend
run-migration.bat

# 2. Iniciar backend
start-backend.bat

# 3. Em outro terminal, iniciar frontend
cd desafio-ccaa-frontend
start-frontend.bat

# 4. Para finalizar
stop-backend.bat    # em um terminal
stop-frontend.bat   # em outro terminal
```

#### **⚠️ Importante:**
- **Sempre execute a migration primeiro** antes de iniciar o sistema
- **Use terminais separados** para backend e frontend
- **Execute como administrador** se houver problemas de permissão

### **Variáveis de Ambiente**
```bash
# Database
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=postgres.dhzqrasofzdjfpfhhnqm
DB_PASSWORD=sua-senha

# JWT
JWT_SECRET_KEY=sua-chave-secreta
JWT_ISSUER=DesafioCCAA
JWT_AUDIENCE=DesafioCCAAUsers
JWT_EXPIRY_DAYS=7

# Email
EMAIL_PICKUP_DIRECTORY=C:\temp\emails
```

## 🚀 Funcionalidades

### **Gestão de Usuários**
- ✅ Registro e login local
- ✅ Perfil de usuário com dados pessoais
- ✅ Recuperação de senha via e-mail
- ✅ Alteração de senha
- ✅ Atualização de perfil

### **Gestão de Livros**
- ✅ Cadastro de livros com metadados completos
- ✅ Busca por título, autor e ISBN
- ✅ Controle de disponibilidade
- ✅ Histórico de operações

### **Sistema de Reservas**
- ✅ Reserva de livros disponíveis
- ✅ Devolução com validações
- ✅ Histórico de empréstimos
- ✅ Notificações de status

## 🎯 Decisões Arquiteturais

### **1. Separação de Responsabilidades**
- **Frontend**: Apenas apresentação e interação
- **Backend**: Lógica de negócio e acesso a dados
- **Database**: Persistência e integridade dos dados

### **2. Padrão ServiceResult**
```csharp
public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
}
```

### **3. Autenticação Local**
- Sistema próprio de autenticação com Identity
- JWT tokens para sessões seguras
- Controle total sobre políticas de segurança

### **4. Sistema de E-mails**
- PickupDirectory para desenvolvimento
- Fácil migração para provedores reais
- Templates HTML para notificações

## 📊 Métricas e Performance

### **Database**
- **Connection Pooling**: Supabase Session Pooler para estabilidade
- **Timeout**: 300 segundos para operações longas
- **SSL**: Conexões criptografadas obrigatórias

### **API**
- **Response Time**: < 200ms para operações simples
- **Throughput**: Suporte a múltiplas requisições simultâneas
- **Caching**: Estratégias de cache para dados estáticos

### **Frontend**
- **Bundle Size**: Otimizado com tree-shaking
- **Lazy Loading**: Carregamento sob demanda de módulos
- **PWA Ready**: Preparado para Progressive Web App

## 🔒 Segurança

### **Autenticação e Autorização**
- **ASP.NET Core Identity**: Sistema robusto de gestão de usuários
- **JWT**: Tokens seguros com expiração configurável
- **HTTPS**: Todas as comunicações criptografadas

### **Proteção de Dados**
- **Input Validation**: Validação rigorosa de entrada
- **SQL Injection**: Proteção via Entity Framework
- **XSS Prevention**: Sanitização de dados de saída

### **Auditoria**
- **Logs**: Registro de todas as operações críticas
- **User Tracking**: Rastreamento de ações do usuário
- **Error Monitoring**: Captura e análise de erros

## 🧪 Testes

### **Backend**
- **Unit Tests**: Testes unitários para serviços
- **Integration Tests**: Testes de integração com banco
- **API Tests**: Testes de endpoints da API

### **Frontend**
- **Component Tests**: Testes de componentes Angular
- **Service Tests**: Testes de serviços e lógica de negócio
- **E2E Tests**: Testes end-to-end com Cypress

## 📈 Roadmap

### **Fase 1 (Atual)**
- ✅ Sistema básico de autenticação local
- ✅ CRUD de usuários e livros
- ✅ Sistema de reservas

### **Fase 2 (Próxima)**
- 🔄 Sistema de notificações
- 🔄 Relatórios e analytics
- 🔄 API para integração externa

### **Fase 3 (Futura)**
- 📚 Sistema de categorias e tags
- 📚 Recomendações inteligentes
- 📚 Mobile app nativo

## 🤝 Contribuição

### **Padrões de Código**
- **C#**: Seguir convenções Microsoft
- **TypeScript**: ESLint + Prettier
- **Git**: Conventional Commits

### **Processo de Desenvolvimento**
1. Fork do repositório
2. Criação de branch para feature
3. Desenvolvimento com testes
4. Pull Request com descrição detalhada
5. Code Review obrigatório

## 📞 Suporte

### **Documentação**
- **API Docs**: Swagger/OpenAPI
- **Code Comments**: Documentação inline
- **Architecture Decisions**: ADRs para mudanças importantes

### **Contato**
- **Issues**: GitHub Issues para bugs e features
- **Discussions**: GitHub Discussions para dúvidas
- **Wiki**: Documentação detalhada no repositório

---

## 🎯 **Resumo Executivo**

Este projeto demonstra competências em:
- **Full-Stack Development**: Angular + ASP.NET Core
- **Cloud Architecture**: Supabase
- **Database Design**: PostgreSQL com EF Core
- **Security**: Autenticação JWT + Identity
- **DevOps**: CI/CD, migrations, configuração
- **Best Practices**: Clean Architecture, SOLID, DRY

**Tecnologias**: Angular 17, ASP.NET Core 8.0, PostgreSQL, Entity Framework Core, ASP.NET Core Identity, TypeScript, C#, Docker

**Arquitetura**: Clean Architecture, RESTful API, Microservices-ready, Cloud-native

**Qualidade**: Testes automatizados, documentação completa, padrões de código, segurança robusta
