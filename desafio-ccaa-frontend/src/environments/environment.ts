// src/environments/environment.ts
export const environment = {
  production: false,

  // 🔧 CONFIGURAÇÃO: Ambiente
  environment: {
    name: 'dev', // 'dev', 'uat', 'prod'
  },

  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: false, // true = Mock, false = API
    fallbackToMock: true, // ✅ HABILITADO: Usa mock em caso de erro da API
  },

  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'https://localhost:5001', // API local do backend (HTTPS)
    timeout: 30000, // Timeout em ms
    retryAttempts: 3, // Tentativas de retry
  },

  // 🔧 CONFIGURAÇÃO: JWT
  jwt: {
    tokenKey: 'auth_token',
    userKey: 'current_user',
  },

  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
    enableConsole: true,
    enableRemote: false, // Para serviços como Sentry
  }
};
