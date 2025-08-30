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
    
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔒 AuthGuard: Resultado da verificação:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ AuthGuard: Acesso permitido');
      return of(true);
    }
    
    console.log('❌ AuthGuard: Acesso negado, redirecionando para login');
    this.router.navigate(['/login']);
    return of(false);
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
