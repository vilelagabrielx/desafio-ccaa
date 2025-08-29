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
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        
        // Se não estiver autenticado, redireciona para login
        this.router.navigate(['/login']);
        return false;
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
