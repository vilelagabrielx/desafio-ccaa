export const environment = {
  production: false,
  
  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: true, // true = Mock, false = API
    fallbackToMock: true, // Se true, usa mock em caso de erro da API
  },
  
  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'https://api.seudominio.com', // Altere para sua API real
    timeout: 30000, // Timeout em ms
    retryAttempts: 3, // Tentativas de retry
  },
  
  // 🔧 CONFIGURAÇÃO: Auth0
  auth0: {
    domain: 'dev-5uh7sugfyt00g0qf.us.auth0.com',
    clientId: 'YOUR_CLIENT_ID', // Substitua pelo Client ID da sua aplicação Angular no Auth0
    audience: 'https://dev-5uh7sugfyt00g0qf.us.auth0.com/api/v2/',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
    logoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
  },
  
  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
    enableConsole: true,
    enableRemote: false, // Para serviços como Sentry
  }
};
