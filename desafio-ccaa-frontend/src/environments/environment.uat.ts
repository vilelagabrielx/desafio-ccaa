export const environment = {
  production: false,
  
  // 🔧 CONFIGURAÇÃO: Ambiente
  environment: {
    name: 'uat', // 'dev', 'uat', 'prod'
  },
  
  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: false, // Em UAT, usar API real
    fallbackToMock: true, // Em UAT, pode usar fallback para mock
  },
  
  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'https://api-uat.seudominio.com', // Altere para sua API de UAT
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
    level: 'info', // Em UAT, logs mais detalhados
    enableConsole: true,
    enableRemote: true, // Para monitoramento
  }
};
