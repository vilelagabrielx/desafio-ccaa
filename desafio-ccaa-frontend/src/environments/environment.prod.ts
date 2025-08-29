export const environment = {
  production: true,
  
  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: false, // Em produção, sempre usar API real
    fallbackToMock: false, // Em produção, não usar fallback para mock
  },
  
  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'https://api.seudominio.com', // Altere para sua API real de produção
    timeout: 30000, // Timeout em ms
    retryAttempts: 3, // Tentativas de retry
  },
  
  // 🔧 CONFIGURAÇÃO: Auth0
  auth0: {
    domain: 'dev-5uh7sugfyt00g0qf.us.auth0.com',
    clientId: 'YOUR_CLIENT_ID', // Substitua pelo Client ID da sua aplicação Angular no Auth0
    audience: 'https://dev-5uh7sugfyt00g0qf.us.auth0.com/api/v2/',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com',
    logoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com',
  },
  
  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'warn', // Em produção, apenas warnings e erros
    enableConsole: false, // Em produção, não logar no console
    enableRemote: true, // Para serviços como Sentry
  }
};
