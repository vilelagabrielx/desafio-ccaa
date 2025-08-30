// src/environments/environment.ts
export const environment = {
  production: false,

  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: false, // true = Mock, false = API
    fallbackToMock: true, // ✅ HABILITADO: Usa mock em caso de erro da API
  },

  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'http://localhost:5000', // API local do backend
    timeout: 30000, // Timeout em ms
    retryAttempts: 3, // Tentativas de retry
  },

  // 🔧 CONFIGURAÇÃO: Auth0
  auth0: {
    domain: 'dev-5uh7sugfyt00g0qf.us.auth0.com',
    clientId: '6WLBR8IcBjgjAcg7ItbEa62WRkVIXedn', // Client ID da aplicação Auth0
    audience: 'https://dev-5uh7sugfyt00g0qf.us.auth0.com/api/v2/',
    redirectUri: 'http://localhost:4200/callback',
    logoutRedirectUri: 'http://localhost:4200/login',
    // 🔐 Configurações para verificação de email e reset de senha
    scope: 'openid profile email',
  },

  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
    enableConsole: true,
    enableRemote: false, // Para serviços como Sentry
  }
};
