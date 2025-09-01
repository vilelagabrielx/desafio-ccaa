import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('🔒 AuthGuard: Verificando acesso à rota...');
    
    // Verificar autenticação
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔒 AuthGuard: Resultado da verificação:', isAuthenticated);
    console.log('🔒 AuthGuard: Token presente:', !!this.authService.getToken());
    console.log('🔒 AuthGuard: Usuário presente:', !!this.authService.getCurrentUser());
    
    if (isAuthenticated) {
      // Verificar se o token ainda é válido
      const token = this.authService.getToken();
      if (token && this.authService.validateToken(token)) {
        console.log('✅ AuthGuard: Token válido, acesso permitido');
        return of(true);
      } else {
        console.log('⚠️ AuthGuard: Token inválido ou expirado, fazendo logout');
        this.authService.logout();
        return of(this.router.createUrlTree(['/login']));
      }
    }
    
    console.log('❌ AuthGuard: Acesso negado, redirecionando para login');
    // Usar createUrlTree para evitar problemas de navegação
    return of(this.router.createUrlTree(['/login']));
  }
}

/**
 * Guarda para rotas que requerem permissões específicas
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> {
    const requiredPermission = route.data?.['permission'];
    
    if (!requiredPermission) {
      const isAuthenticated = this.authService.isAuthenticated();
      return of(isAuthenticated);
    }

    // Para JWT local, por enquanto todos os usuários autenticados têm todas as permissões
    // Em uma implementação mais avançada, você poderia verificar roles/permissões no token JWT
    const isAuthenticated = this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      return of(true);
    }
    
    // Se não tiver permissão, redireciona para página de acesso negado
    this.router.navigate(['/access-denied']);
    return of(false);
  }
}

/**
 * Guarda para rotas que devem ser acessíveis apenas por usuários NÃO autenticados
 * (ex: login, register, reset-password)
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('🚫 GuestGuard: Verificando se usuário está deslogado...');
    
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🚫 GuestGuard: Usuário autenticado:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('✅ GuestGuard: Usuário não autenticado, acesso permitido');
      return of(true);
    }
    
    console.log('❌ GuestGuard: Usuário já autenticado, redirecionando para books');
    // Usuário já está logado, redireciona para a página principal
    return of(this.router.createUrlTree(['/books']));
  }
}