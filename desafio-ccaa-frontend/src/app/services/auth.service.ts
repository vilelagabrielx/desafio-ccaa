import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, map, switchMap, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  dateOfBirth?: string;
}

export interface LocalUserRegistration {
  name: string;
  dateOfBirth: string;
  email: string;
  password: string;
}

export interface LocalUserLogin {
  email: string;
  password: string;
}

export interface LocalUser {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentLocalUserSubject = new BehaviorSubject<LocalUser | null>(null);
  public currentLocalUser$ = this.currentLocalUserSubject.asObservable();

  constructor(
    private auth0: Auth0Service,
    private http: HttpClient
  ) {
    // Verificar se há usuário local salvo
    this.checkLocalUser();
  }

  /**
   * Verifica se há usuário local salvo no localStorage
   */
  private checkLocalUser(): void {
    const savedUser = localStorage.getItem('localUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentLocalUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('localUser');
      }
    }
  }

  /**
   * Registra um novo usuário localmente
   */
  registerLocalUser(userData: LocalUserRegistration): Observable<LocalUser> {
    // Em uma implementação real, isso seria uma chamada para a API
    // Por enquanto, simulamos o registro
    return new Observable(observer => {
      setTimeout(() => {
        const newUser: LocalUser = {
          id: Date.now().toString(),
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          email: userData.email,
          createdAt: new Date().toISOString()
        };

        // Salvar no localStorage (em produção, seria na API)
        localStorage.setItem('localUser', JSON.stringify(newUser));
        this.currentLocalUserSubject.next(newUser);

        observer.next(newUser);
        observer.complete();
      }, 1000); // Simular delay da API
    });
  }

  /**
   * Faz login com usuário local
   */
  loginLocalUser(credentials: LocalUserLogin): Observable<LocalUser> {
    // Em uma implementação real, isso seria uma chamada para a API
    return new Observable(observer => {
      setTimeout(() => {
        const savedUser = localStorage.getItem('localUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.email === credentials.email && user.password === credentials.password) {
            this.currentLocalUserSubject.next(user);
            observer.next(user);
            observer.complete();
          } else {
            observer.error('Credenciais inválidas');
          }
        } else {
          observer.error('Usuário não encontrado');
        }
      }, 1000);
    });
  }

  /**
   * Faz logout do usuário local
   */
  logoutLocalUser(): void {
    localStorage.removeItem('localUser');
    this.currentLocalUserSubject.next(null);
  }

  /**
   * Verifica se o usuário está autenticado (local ou Auth0)
   */
  isAuthenticated(): Observable<boolean> {
    return this.auth0.isAuthenticated$.pipe(
      map(auth0Authenticated => {
        const localAuthenticated = this.currentLocalUserSubject.value !== null;
        return auth0Authenticated || localAuthenticated;
      })
    );
  }

  /**
   * Obtém o perfil do usuário autenticado (local ou Auth0)
   */
  getUserProfile(): Observable<UserProfile | null> {
    return this.auth0.user$.pipe(
      map(auth0User => {
        if (auth0User) {
          // Usuário Auth0
          return {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            name: auth0User.name || '',
            picture: auth0User.picture || undefined,
            emailVerified: auth0User.email_verified || false
          };
        } else {
          // Usuário local
          const localUser = this.currentLocalUserSubject.value;
          if (localUser) {
            return {
              id: localUser.id,
              email: localUser.email,
              name: localUser.name,
              emailVerified: true,
              dateOfBirth: localUser.dateOfBirth
            };
          }
          return null;
        }
      })
    );
  }

  /**
   * Obtém o token de acesso (para Auth0) ou simula para usuário local
   */
  getAccessToken(): Observable<string | null> {
    return this.auth0.getAccessTokenSilently().pipe(
      map(token => token),
      switchMap(token => {
        if (token) return of(token);
        
        // Se não há token Auth0, verifica se é usuário local
        const localUser = this.currentLocalUserSubject.value;
        if (localUser) {
          // Para usuário local, retorna um token simulado
          // Em produção, você pode implementar JWT local
          return of(`local_${localUser.id}_${Date.now()}`);
        }
        return of(null);
      })
    );
  }

  /**
   * Obtém o token para usar nas requisições da API
   */
  getApiToken(): Observable<string | null> {
    return this.isAuthenticated().pipe(
      switchMap(isAuth => {
        if (isAuth) {
          return this.getAccessToken();
        }
        return of(null);
      })
    );
  }

  /**
   * Verifica se o usuário está carregando
   */
  isLoading(): Observable<boolean> {
    return this.auth0.isLoading$;
  }

  /**
   * Faz login via Auth0
   */
  loginWithAuth0(): void {
    this.auth0.loginWithRedirect({
      appState: { target: typeof window !== 'undefined' ? window.location.pathname : '/' },
      // 🔐 Configurações para verificação de email
      prompt: 'consent',
      scope: 'openid profile email'
    });
  }

  /**
   * Reenvia email de verificação
   */
  resendVerificationEmail(): void {
    this.auth0.loginWithRedirect({
      appState: { target: typeof window !== 'undefined' ? window.location.pathname : '/' },
      prompt: 'consent',
      scope: 'openid profile email'
    });
  }

  /**
   * Faz logout (Auth0 ou local)
   */
  logout(): void {
    const localUser = this.currentLocalUserSubject.value;
    if (localUser) {
      this.logoutLocalUser();
    } else {
      this.auth0.logout({
        logoutParams: {
          returnTo: environment.auth0.logoutRedirectUri
        }
      });
    }
  }

  /**
   * Verifica se o usuário tem uma determinada permissão
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.auth0.user$.pipe(
      map(user => {
        if (user && user['permissions']) {
          return user['permissions'].includes(permission);
        }
        // Para usuários locais, você pode implementar lógica de permissões
        return false;
      })
    );
  }

  /**
   * Obtém as permissões do usuário
   */
  getUserPermissions(): Observable<string[]> {
    return this.auth0.user$.pipe(
      map(user => user?.['permissions'] || [])
    );
  }

  /**
   * Verifica se o usuário atual é local
   */
  isLocalUser(): boolean {
    return this.currentLocalUserSubject.value !== null;
  }

  /**
   * Verifica se o usuário atual é do Auth0
   */
  isAuth0User(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }
}
