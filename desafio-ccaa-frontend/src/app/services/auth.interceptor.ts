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
  
  // Se a URL da requisição começar com a URL da API, adiciona o token
  if (request.url.startsWith(apiUrl)) {
    return true;
  }
  
  // Se for uma requisição relativa (para o mesmo domínio), adiciona o token
  if (request.url.startsWith('/api/')) {
    return true;
  }
  
  return false;
}
