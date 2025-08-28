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
  
  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
    enableConsole: true,
    enableRemote: false, // Para serviços como Sentry
  }
};
