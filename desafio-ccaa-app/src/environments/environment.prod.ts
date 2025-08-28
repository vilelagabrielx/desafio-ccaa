export const environment = {
  production: true,
  
  // 🔧 CONFIGURAÇÃO: Serviços
  services: {
    useMock: false, // false = API real em produção
    fallbackToMock: true, // true = Usa mock como fallback em caso de erro
  },
  
  // 🔧 CONFIGURAÇÃO: API
  api: {
    baseUrl: 'https://api.seudominio.com', // Altere para sua API real de produção
    timeout: 30000,
    retryAttempts: 3,
  },
  
  // 🔧 CONFIGURAÇÃO: Logging
  logging: {
    level: 'error', // Apenas erros em produção
    enableConsole: false,
    enableRemote: true, // Habilita logging remoto em produção
  }
};
