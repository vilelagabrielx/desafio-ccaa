export const environment = {
  production: true,
  
  // 🔧 CONFIGURAÇÃO: Ambiente
  environment: {
    name: 'prod', // 'dev', 'uat', 'prod'
  },
  
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
  

  
  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'warn', // Em produção, apenas warnings e erros
    enableConsole: false, // Em produção, não logar no console
    enableRemote: true, // Para serviços como Sentry
  }
};
