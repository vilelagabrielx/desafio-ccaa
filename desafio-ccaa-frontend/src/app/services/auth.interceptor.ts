import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // Se a requisição não for para a API, não adiciona o token
  if (!shouldAddToken(request)) {
    return next(request);
  }

  // Obtém o token JWT local
  const token = authService.getToken();
  
  if (token) {
    console.log('🔐 AuthInterceptor: Adicionando token à requisição:', request.url);
    console.log('🔐 AuthInterceptor: Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    
    // Adiciona o token de autorização no header
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('🔐 AuthInterceptor: Headers da requisição:', authReq.headers);
    return next(authReq);
  } else {
    console.log('⚠️ AuthInterceptor: Sem token para requisição:', request.url);
  }
  
  // Se não há token, continua sem autorização
  return next(request);
};

/**
 * Verifica se deve adicionar o token na requisição
 */
function shouldAddToken(request: any): boolean {
  // Adiciona token apenas para requisições da API
  const apiUrl = environment.api.baseUrl;
  
  // Verifica se é uma requisição para a API
  const isApiRequest = request.url.startsWith(apiUrl) || request.url.startsWith('/api/');
  
  if (!isApiRequest) {
    return false;
  }
  
  // Lista de endpoints públicos que NÃO precisam de token
  const publicEndpoints = [
    '/api/user/login',
    '/api/user/register',
    '/api/user/forgot-password',
    '/api/user/reset-password',
    '/api/user/environment-info',
    '/api/user/download-email-template',
    '/api/user/check-email-exists',
    '/api/user/test-smtp',
    '/api/user/send-test-email'
  ];
  
  // Verifica se a requisição é para um endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    request.url.includes(endpoint)
  );
  
  // Se for um endpoint público, não adiciona o token
  if (isPublicEndpoint) {
    return false;
  }
  
  // Para todos os outros endpoints da API, adiciona o token
  return true;
}
