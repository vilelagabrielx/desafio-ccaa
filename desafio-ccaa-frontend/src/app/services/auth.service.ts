import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, map, switchMap, of, BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  dateOfBirth?: string;
}

export interface LocalUserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LocalUserLogin {
  email: string;
  password: string;
}

export interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  createdAt: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentLocalUserSubject = new BehaviorSubject<LocalUser | null>(null);
  public currentLocalUser$ = this.currentLocalUserSubject.asObservable();
  private authToken: string | null = null;

  constructor(
    private auth0: Auth0Service,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar se há token salvo apenas no browser
    if (isPlatformBrowser(this.platformId)) {
      this.checkSavedToken();
    }
  }

  /**
   * Verifica se há token salvo no localStorage
   */
  private checkSavedToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      this.authToken = savedToken;
      this.getCurrentUserFromApi().subscribe({
        next: (user) => {
          if (user) {
            this.currentLocalUserSubject.next(user);
          } else {
            this.clearAuthData();
          }
        },
        error: () => {
          this.clearAuthData();
        }
      });
    }
  }

  /**
   * Salva o token de autenticação
   */
  private saveAuthToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authToken = token;
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
    }
    this.authToken = null;
    this.currentLocalUserSubject.next(null);
  }

  /**
   * Obtém os headers de autenticação
   */
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return headers;
  }

  /**
   * Registra um novo usuário via API
   */
  registerLocalUser(userData: LocalUserRegistration): Observable<LocalUser> {
    return this.http.post<ApiResponse<LocalUser>>(
      `${environment.api.baseUrl}/api/user/register`,
      userData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        } else if (response.error) {
          throw new Error(response.error);
        } else if (response.errors && response.errors.length > 0) {
          throw new Error(response.errors.join(', '));
        } else {
          throw new Error('Erro desconhecido no registro');
        }
      }),
      catchError(error => {
        console.error('Erro no registro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Faz login via API
   */
  loginLocalUser(credentials: LocalUserLogin): Observable<LocalUser> {
    return this.http.post<{ token: string }>(
      `${environment.api.baseUrl}/api/user/login`,
      credentials,
      { headers: this.getAuthHeaders() }
    ).pipe(
      switchMap(response => {
        if (response.token) {
          this.saveAuthToken(response.token);
          return this.getCurrentUserFromApi();
        } else {
          throw new Error('Token não recebido');
        }
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém o usuário atual da API
   */
  private getCurrentUserFromApi(): Observable<LocalUser> {
    if (!this.authToken) {
      return throwError(() => new Error('Token não disponível'));
    }

    return this.http.get<ApiResponse<LocalUser>>(
      `${environment.api.baseUrl}/api/user/me`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          this.currentLocalUserSubject.next(response.data);
          return response.data;
        } else if (response.error) {
          throw new Error(response.error);
        } else {
          throw new Error('Usuário não encontrado');
        }
      }),
      catchError(error => {
        console.error('Erro ao obter usuário atual:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Faz logout do usuário local
   */
  logoutLocalUser(): void {
    this.clearAuthData();
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
              name: localUser.fullName,
              emailVerified: true
            };
          }
          return null;
        }
      })
    );
  }

  /**
   * Obtém o token de acesso (para Auth0) ou retorna o token local
   */
  getAccessToken(): Observable<string | null> {
    return this.auth0.getAccessTokenSilently().pipe(
      map(token => token),
      switchMap(token => {
        if (token) return of(token);
        
        // Se não há token Auth0, retorna o token local
        return of(this.authToken);
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
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.auth0.loginWithRedirect({
      appState: { 
        target: '/'
      }
    });
  }

  /**
   * Reenvia email de verificação
   */
  resendVerificationEmail(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.auth0.loginWithRedirect({
      appState: { 
        target: '/'
      }
    });
  }

  /**
   * Faz signup via Auth0
   */
  signupWithAuth0(userData: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.auth0.loginWithRedirect({
      appState: { 
        target: '/',
        mode: 'signup',
        userData: userData
      }
    });
  }

  /**
   * Reset de senha via Auth0
   */
  resetPasswordWithAuth0(email: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.auth0.loginWithRedirect({
      appState: { 
        target: '/'
      }
    });
  }

  /**
   * Faz logout (Auth0 ou local)
   */
  logout(): void {
    const localUser = this.currentLocalUserSubject.value;
    if (localUser) {
      this.logoutLocalUser();
    } else if (isPlatformBrowser(this.platformId)) {
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

  /**
   * Altera senha do usuário via API
   */
  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<boolean> {
    const changePasswordData = {
      currentPassword,
      newPassword,
      confirmNewPassword
    };

    return this.http.post<ApiResponse<{ message: string }>>(
      `${environment.api.baseUrl}/api/user/change-password`,
      changePasswordData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          return true;
        } else if (response.error) {
          throw new Error(response.error);
        } else if (response.errors && response.errors.length > 0) {
          throw new Error(response.errors.join(', '));
        } else {
          throw new Error('Erro desconhecido na alteração de senha');
        }
      }),
      catchError(error => {
        console.error('Erro na alteração de senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Solicita reset de senha via API
   */
  forgotPassword(email: string): Observable<boolean> {
    const forgotPasswordData = { email };

    return this.http.post<ApiResponse<{ message: string }>>(
      `${environment.api.baseUrl}/api/user/forgot-password`,
      forgotPasswordData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          return true;
        } else if (response.error) {
          throw new Error(response.error);
        } else {
          throw new Error('Erro desconhecido na solicitação de reset de senha');
        }
      }),
      catchError(error => {
        console.error('Erro na solicitação de reset de senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reseta senha com token via API
   */
  resetPassword(email: string, token: string, newPassword: string, confirmNewPassword: string): Observable<boolean> {
    const resetPasswordData = {
      email,
      token,
      newPassword,
      confirmNewPassword
    };

    return this.http.post<ApiResponse<{ message: string }>>(
      `${environment.api.baseUrl}/api/user/reset-password`,
      resetPasswordData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          return true;
        } else if (response.error) {
          throw new Error(response.error);
        } else if (response.errors && response.errors.length > 0) {
          throw new Error(response.errors.join(', '));
        } else {
          throw new Error('Erro desconhecido no reset de senha');
        }
      }),
      catchError(error => {
        console.error('Erro no reset de senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza perfil do usuário via API
   */
  updateProfile(profileData: Partial<LocalUser>): Observable<LocalUser> {
    return this.http.put<ApiResponse<LocalUser>>(
      `${environment.api.baseUrl}/api/user/profile`,
      profileData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.data) {
          this.currentLocalUserSubject.next(response.data);
          return response.data;
        } else if (response.error) {
          throw new Error(response.error);
        } else if (response.errors && response.errors.length > 0) {
          throw new Error(response.errors.join(', '));
        } else {
          throw new Error('Erro desconhecido na atualização do perfil');
        }
      }),
      catchError(error => {
        console.error('Erro na atualização do perfil:', error);
        return throwError(() => error);
      })
    );
  }
}
