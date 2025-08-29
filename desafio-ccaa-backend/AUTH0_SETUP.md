# Configuração Auth0 no Backend

Este documento explica como configurar a autenticação Auth0 no backend .NET da aplicação Desafio CCAA.

## Pré-requisitos

1. Conta no [Auth0](https://auth0.com/)
2. Aplicação Angular configurada no Auth0
3. API registrada no Auth0

## Configuração no Auth0

### 1. Criar uma API no Auth0

1. Acesse o [Dashboard do Auth0](https://manage.auth0.com/)
2. Vá para "Applications" > "APIs"
3. Clique em "Create API"
4. Configure:
   - **Name**: `Desafio CCAA API`
   - **Identifier**: `https://api.desafio-ccaa.com` (ou seu domínio)
   - **Signing Algorithm**: `RS256`
   - **Token Expiration**: `86400` (24 horas)

### 2. Configurar Scopes (Opcional)

Na API criada, você pode configurar scopes personalizados:
- `read:books` - Para leitura de livros
- `write:books` - Para criação/edição de livros
- `delete:books` - Para exclusão de livros

### 3. Configurar Callback URLs

Na sua aplicação Angular, configure:
- **Allowed Callback URLs**: `http://localhost:4200/callback`
- **Allowed Logout URLs**: `http://localhost:4200`
- **Allowed Web Origins**: `http://localhost:4200`

## Configuração no Backend

### 1. Atualizar appsettings.json

```json
{
  "Auth0": {
    "Domain": "your-domain.auth0.com",
    "Audience": "https://api.desafio-ccaa.com",
    "Issuer": "https://your-domain.auth0.com/"
  }
}
```

### 2. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente:

```bash
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.desafio-ccaa.com
AUTH0_ISSUER=https://your-domain.auth0.com/
```

### 3. Como Funciona

O backend está configurado para:
- **Priorizar Auth0**: Se as configurações do Auth0 estiverem presentes, usa Auth0
- **Fallback para JWT local**: Se Auth0 não estiver configurado, usa JWT local
- **Validação automática**: Valida tokens JWT do Auth0 automaticamente

## Testando a Autenticação

### 1. Swagger UI

O Swagger UI está configurado para suportar Auth0:
- Use o botão "Authorize" no Swagger
- Configure com seu token do Auth0

### 2. Endpoints Protegidos

Todos os endpoints com `[Authorize]` agora aceitam tokens do Auth0:

```csharp
[HttpGet("me")]
[Authorize]
public async Task<IActionResult> GetCurrentUser()
{
    // O token do Auth0 é validado automaticamente
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    // ... resto do código
}
```

### 3. Claims do Usuário

O Auth0 fornece claims padrão que você pode acessar:

```csharp
var email = User.FindFirst(ClaimTypes.Email)?.Value;
var name = User.FindFirst(ClaimTypes.Name)?.Value;
var sub = User.FindFirst("sub")?.Value; // ID único do usuário no Auth0
```

## Migração de Usuários Existentes

Se você já tem usuários no sistema local:

1. **Mantenha o sistema local** como fallback
2. **Configure o Auth0** para novos usuários
3. **Migre gradualmente** os usuários existentes

## Troubleshooting

### Erro: "Invalid audience"

- Verifique se o `AUTH0_AUDIENCE` está correto
- Confirme se a API no Auth0 tem o mesmo identifier

### Erro: "Invalid issuer"

- Verifique se o `AUTH0_ISSUER` está correto
- Deve ser `https://your-domain.auth0.com/`

### Erro: "Token expired"

- O token do Auth0 expirou
- O usuário precisa fazer login novamente no frontend

## Segurança

- **HTTPS**: Sempre use HTTPS em produção
- **Scopes**: Configure scopes específicos para cada operação
- **Rate Limiting**: Considere implementar rate limiting
- **Logs**: Monitore tentativas de autenticação falhadas

## Próximos Passos

1. Configure o frontend Angular para usar Auth0
2. Teste a autenticação com endpoints protegidos
3. Configure scopes personalizados se necessário
4. Implemente refresh tokens se necessário
