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
