# 🚀 Desafio CCAA - Sistema de Gerenciamento de Livros

Sistema completo de gerenciamento de livros com autenticação Auth0, desenvolvido em .NET 8 (Backend) e Angular 17 (Frontend).

## 📋 **Visão Geral do Projeto**

O Desafio CCAA é uma aplicação web moderna que permite:
- 📚 **Gerenciar catálogo de livros** (CRUD completo)
- 👤 **Sistema de autenticação** integrado com Auth0
- 🔐 **Controle de acesso** baseado em roles
- 🌐 **API REST** com documentação Swagger
- 💻 **Interface responsiva** em Angular

## 🏗️ **Arquitetura do Sistema**

```
desafio-ccaa/
├── 📁 desafio-ccaa-backend/     # API .NET 8 + Entity Framework
├── 📁 desafio-ccaa-frontend/    # Aplicação Angular 17
└── 📄 README.md                 # Este arquivo
```

## 🛠️ **Tecnologias Utilizadas**

### **Backend (.NET 8)**
- **Framework:** ASP.NET Core 8.0
- **ORM:** Entity Framework Core 8.0
- **Banco de Dados:** PostgreSQL (Supabase)
- **Autenticação:** Auth0 + JWT
- **Validação:** FluentValidation
- **Arquitetura:** Clean Architecture (Business, Infrastructure, API)
- **Testes:** xUnit

### **Frontend (Angular 17)**
- **Framework:** Angular 17
- **UI Framework:** Angular Material
- **Estilização:** SCSS
- **Estado:** Angular Signals
- **Roteamento:** Angular Router
- **HTTP Client:** Angular HttpClient

### **Infraestrutura**
- **Banco:** PostgreSQL (Supabase)
- **Autenticação:** Auth0
- **Deploy:** Preparado para Azure/Heroku
- **Versionamento:** Git

## 🚀 **Como Executar o Projeto**

### **Pré-requisitos**
- **.NET 8 SDK** instalado
- **Node.js 18+** instalado
- **PostgreSQL** (ou conta Supabase)
- **Conta Auth0** configurada

### **1. Clone o Repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd desafio-ccaa
```

### **2. Configurar Backend**
```bash
cd desafio-ccaa-backend

# Configurar variáveis de ambiente
# Copiar appsettings.template.json para appsettings.Development.json
# Configurar string de conexão do Supabase
# Configurar Auth0

# Executar migration (usar arquivo .bat para facilitar)
EXECUTAR_MIGRATION.bat
```

### **3. Configurar Frontend**
```bash
cd desafio-ccaa-frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Configurar URL da API
# Configurar Auth0

# Executar em desenvolvimento
npm start
```

## 📚 **Guias Detalhados**

### **Backend (.NET)**
- **📖 [Migration Guide](desafio-ccaa-backend/MIGRATION_GUIDE.md)** - Como criar e executar migrations
- **📖 [Database Config](desafio-ccaa-backend/DATABASE_CONFIG.md)** - Configuração do banco PostgreSQL
- **📖 [Auth0 Setup](desafio-ccaa-backend/AUTH0_SETUP.md)** - Configuração de autenticação
- **📖 [Instruções de Execução](desafio-ccaa-backend/INSTRUCOES_EXECUCAO.md)** - Passo a passo completo

### **Frontend (Angular)**
- **📖 [README Frontend](desafio-ccaa-frontend/README.md)** - Guia específico do Angular
- **📖 [API Migration](desafio-ccaa-frontend/API_MIGRATION.md)** - Migração da API

### **Arquivos de Execução Rápida**
- **⚡ [EXECUTAR_MIGRATION.bat](desafio-ccaa-backend/EXECUTAR_MIGRATION.bat)** - Executa migration automaticamente
- **⚡ [COMANDOS_RAPIDOS.bat](desafio-ccaa-backend/COMANDOS_RAPIDOS.bat)** - Menu de comandos EF
- **⚡ [COMANDOS_MIGRATION.txt](desafio-ccaa-backend/COMANDOS_MIGRATION.txt)** - Comandos passo a passo

## 🔧 **Configurações Importantes**

### **Backend**
- **String de Conexão:** Use porta 5432 (Session Pooler) para migrations
- **Timeout:** Configure `Command Timeout=300;` para operações longas
- **Auth0:** Configure Domain, Audience e Issuer no appsettings.json

### **Frontend**
- **API URL:** Configure a URL da API no environment.ts
- **Auth0:** Configure Domain e Client ID
- **CORS:** Backend deve permitir origem do frontend

## 🚨 **Problemas Comuns e Soluções**

### **Migration não funciona**
- ✅ Use porta 5432 em vez de 6543
- ✅ Configure timeout de 300+ segundos
- ✅ Execute `$env:PATH += ";$env:USERPROFILE\.dotnet\tools"` no PowerShell

### **Auth0 não conecta**
- ✅ Verifique configurações no appsettings.json
- ✅ Confirme URLs de callback configuradas no Auth0
- ✅ Verifique se o domínio está correto

### **Frontend não acessa API**
- ✅ Verifique se a API está rodando
- ✅ Confirme URL da API no environment.ts
- ✅ Verifique configuração de CORS no backend

## 📊 **Estrutura do Banco de Dados**

### **Tabelas Principais**
- **`Books`** - Catálogo de livros
- **`AspNetUsers`** - Usuários do sistema
- **`AspNetRoles`** - Roles/perfis
- **`__EFMigrationsHistory`** - Controle de migrations

### **Relacionamentos**
- Usuários podem ter múltiplos roles
- Livros são gerenciados por usuários autenticados
- Sistema de claims para permissões granulares

## 🧪 **Testes**

### **Backend**
```bash
cd desafio-ccaa-backend
dotnet test
```

### **Frontend**
```bash
cd desafio-ccaa-frontend
npm test
```

## 📦 **Deploy**

### **Backend**
- Preparado para Azure App Service
- Configuração de variáveis de ambiente
- Migrations automáticas

### **Frontend**
- Build de produção: `npm run build`
- Deploy em qualquer servidor estático
- Configuração de rotas para SPA

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto é parte do Desafio CCAA.

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Consulte os guias específicos de cada área
2. Verifique os arquivos de configuração
3. Use os arquivos .bat para execução automática
4. Consulte a documentação oficial das tecnologias

---

**💡 Dica:** Comece sempre pelo backend - configure o banco e execute as migrations antes de rodar o frontend!
