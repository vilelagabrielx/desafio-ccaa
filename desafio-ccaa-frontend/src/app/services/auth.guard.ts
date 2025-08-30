import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
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
    
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        console.log('🔒 AuthGuard: Resultado da verificação:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('✅ AuthGuard: Acesso permitido');
          return true;
        }
        
        // IMPORTANTE: Aguardar um pouco antes de negar acesso
        // O usuário pode estar sendo sincronizado
        console.log('⏳ AuthGuard: Aguardando sincronização antes de negar acesso...');
        setTimeout(() => {
          this.authService.isAuthenticated().subscribe(finalAuth => {
            if (!finalAuth) {
              console.log('❌ AuthGuard: Acesso negado após timeout, redirecionando para login');
              this.router.navigate(['/login']);
            }
          });
        }, 2000); // Aguardar 2 segundos
        
        // Permitir acesso temporariamente
        console.log('⚠️ AuthGuard: Acesso temporariamente permitido (aguardando sincronização)');
        return true;
      })
    );
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
      return this.authService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => isAuthenticated)
      );
    }

    return this.authService.hasPermission(requiredPermission).pipe(
      take(1),
      map(hasPermission => {
        if (hasPermission) {
          return true;
        }
        
        // Se não tiver permissão, redireciona para página de acesso negado
        this.router.navigate(['/access-denied']);
        return false;
      })
    );
  }
}
