# 🚀 Desafio CCAA - Sistema de Gestão de Livros

## 📋 Visão Geral

Sistema full-stack para gestão de livros com autenticação Auth0, desenvolvido em **Angular 17** (frontend) e **ASP.NET Core 8.0** (backend), utilizando **PostgreSQL** como banco de dados.

## 🏗️ Arquitetura

### **Frontend (Angular 17)**
- **Framework**: Angular 17 com TypeScript
- **UI Components**: Componentes reutilizáveis com Angular Material
- **State Management**: RxJS BehaviorSubject para gerenciamento de estado
- **Authentication**: Auth0 Angular SDK
- **Forms**: Reactive Forms com validações customizadas
- **Responsive Design**: Layout adaptável para diferentes dispositivos

### **Backend (ASP.NET Core 8.0)**
- **Framework**: ASP.NET Core 8.0 Web API
- **ORM**: Entity Framework Core 8.0
- **Authentication**: JWT + Auth0 Integration
- **Database**: PostgreSQL (Supabase)
- **Architecture**: Clean Architecture com separação de responsabilidades
- **API Design**: RESTful com padrão ServiceResult para respostas consistentes

### **Database (PostgreSQL)**
- **Provider**: Supabase (PostgreSQL as a Service)
- **Connection**: Session Pooler (porta 5432) para estabilidade
- **Migrations**: Entity Framework Core migrations para versionamento do schema
- **Indexes**: Índices otimizados para consultas frequentes

## 🔐 Sistema de Autenticação

### **Auth0 Integration**
- **Single Sign-On**: Login social e tradicional
- **User Management**: Gestão centralizada de usuários
- **Security**: MFA e políticas de senha configuráveis
- **Synchronization**: Sincronização automática entre Auth0 e banco local

### **Resilience Pattern**
- **Fallback Strategy**: Sistema continua funcionando mesmo com falhas de sincronização
- **Retry Mechanism**: Tentativas automáticas de sincronização
- **Error Handling**: Tratamento robusto de erros com fallback para mock services
- **User Experience**: Interface clara para usuários durante problemas de conectividade

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
    "Auth0Id" VARCHAR(255), -- ID único do Auth0
    "DateOfBirth" TIMESTAMP,
    "EmailConfirmed" BOOLEAN,
    "PhoneNumber" VARCHAR(20),
    "PhoneNumberConfirmed" BOOLEAN,
    "TwoFactorEnabled" BOOLEAN,
    "LockoutEnd" TIMESTAMP,
    "LockoutEnabled" BOOLEAN,
    "AccessFailedCount" INTEGER
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
- **Auth0Id**: Índice para busca rápida por usuário Auth0
- **Email**: Índice único para usuários
- **ISBN**: Índice para busca de livros
- **Title + Author**: Índice composto para busca textual

## 🔧 Configuração e Deploy

### **Pré-requisitos**
- .NET 8.0 SDK
- Node.js 18+ e npm
- PostgreSQL (ou Supabase)
- Conta Auth0

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

# Auth0
AUTH0_DOMAIN=seu-dominio.auth0.com
AUTH0_CLIENT_ID=seu-client-id
AUTH0_CLIENT_SECRET=seu-client-secret
AUTH0_AUDIENCE=sua-audience
AUTH0_ISSUER=seu-issuer

# JWT
JWT_SECRET_KEY=sua-chave-secreta
```

## 🚀 Funcionalidades

### **Gestão de Usuários**
- ✅ Registro e login via Auth0
- ✅ Perfil de usuário com dados pessoais
- ✅ Sincronização automática com sistema local
- ✅ Recuperação de senha

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

### **3. Resiliência e Fallback**
- Sistema continua funcionando com mock services em caso de falha
- Retry automático para operações críticas
- Fallback para funcionalidades essenciais

### **4. Configuração Centralizada**
- Arquivo único `database-config.json` para todas as configurações
- Script de atualização automática em todos os arquivos
- Consistência garantida entre ambientes

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
- **Auth0**: Gestão centralizada de identidade
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
- ✅ Sistema básico de autenticação
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
- **Cloud Architecture**: Supabase + Auth0
- **Database Design**: PostgreSQL com EF Core
- **Security**: Autenticação JWT + OAuth2
- **DevOps**: CI/CD, migrations, configuração
- **Best Practices**: Clean Architecture, SOLID, DRY

**Tecnologias**: Angular 17, ASP.NET Core 8.0, PostgreSQL, Entity Framework Core, Auth0, TypeScript, C#, Docker

**Arquitetura**: Clean Architecture, RESTful API, Microservices-ready, Cloud-native

**Qualidade**: Testes automatizados, documentação completa, padrões de código, segurança robusta
