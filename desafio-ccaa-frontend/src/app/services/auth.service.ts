import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { EnvironmentService, EnvironmentInfo } from './environment.service';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  isActive: boolean;
}

export interface LocalUserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

export interface LocalUserLogin {
  email: string;
  password: string;
}

export interface LocalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: string[];
}

// Interface específica para resposta de login
export interface LoginApiResponse {
  token: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LocalUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authToken: string | null = null;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
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
    
    const token = localStorage.getItem(environment.jwt.tokenKey);
    const userData = localStorage.getItem(environment.jwt.userKey);
    
    if (token && userData) {
      try {
        this.authToken = token;
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        console.log('🔐 AuthService: Token e usuário restaurados do localStorage');
        console.log('🔐 AuthService: Estado atualizado - Token:', !!this.authToken, 'User:', !!this.currentUserSubject.value);
      } catch (error) {
        console.warn('❌ Erro ao restaurar dados do usuário:', error);
        this.clearAuthData();
      }
    } else {
      console.log('🔐 AuthService: Nenhum token ou usuário encontrado no localStorage');
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    // Verificar se há token E usuário
    const hasToken = !!this.authToken;
    const hasUser = !!this.currentUserSubject.value;
    
    // Se há token mas não há usuário, tentar restaurar do localStorage
    if (hasToken && !hasUser) {
      console.log('⚠️ AuthService: Token encontrado mas usuário não, tentando restaurar...');
      this.checkSavedToken();
      // Verificar novamente após tentativa de restauração
      const hasUserAfterRestore = !!this.currentUserSubject.value;
      const isAuth = hasToken && hasUserAfterRestore;
      console.log('🔐 AuthService: isAuthenticated() após restauração =', isAuth, 'Token:', hasToken, 'User:', hasUserAfterRestore);
      return isAuth;
    }
    
    const isAuth = hasToken && hasUser;
    console.log('🔐 AuthService: isAuthenticated() =', isAuth, 'Token:', hasToken, 'User:', hasUser);
    
    return isAuth;
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): LocalUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém o token de autenticação
   */
  getToken(): string | null {
    return this.authToken;
  }



  /**
   * Valida e decodifica o token JWT para debug
   */
  private validateToken(token: string): boolean {
    try {
      // Verificar se o token tem o formato correto (3 partes separadas por ponto)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token JWT inválido: formato incorreto');
        return false;
      }

      // Decodificar o payload (segunda parte)
      const payload = JSON.parse(atob(parts[1]));
      console.log('🔐 Token JWT decodificado:', payload);

      // Verificar se não expirou
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.error('❌ Token JWT expirado:', new Date(payload.exp * 1000));
        return false;
      }

      console.log('✅ Token JWT válido');
      return true;
    } catch (error) {
      console.error('❌ Erro ao validar token JWT:', error);
      return false;
    }
  }

  /**
   * Faz login local
   */
  login(credentials: LocalUserLogin): Observable<LocalUser> {
    console.log('🔐 AuthService: Iniciando login...', credentials);
    
    return this.http.post<LoginApiResponse>(`${environment.api.baseUrl}/api/user/login`, credentials)
      .pipe(
        tap(response => console.log('🔐 AuthService: Resposta do login recebida:', response)),
        switchMap(response => {
          if (response.error) {
            console.error('❌ AuthService: Erro na resposta:', response.error);
            throw new Error(response.error);
          }
          
          // A API retorna { token: "..." } diretamente, não { data: { token: "..." } }
          if (!response.token) {
            console.error('❌ AuthService: Token não recebido');
            throw new Error('Token não recebido');
          }

          console.log('✅ AuthService: Token recebido, validando...');
          
          // Validar token antes de salvar
          if (!this.validateToken(response.token)) {
            throw new Error('Token JWT inválido');
          }
          
          // Salvar token
          this.authToken = response.token;
          this.saveAuthData();
          console.log('✅ AuthService: Token salvo, buscando dados do usuário...');
          
          // Buscar dados do usuário atual
          return this.getCurrentUserData();
        }),
        tap(user => {
          console.log('✅ AuthService: Dados do usuário recebidos:', user);
          // IMPORTANTE: Atualizar o estado ANTES de retornar
          this.currentUserSubject.next(user);
          this.saveUserData(user);
          console.log('✅ AuthService: Usuário salvo, estado atualizado');
        }),
        map(user => user), // Retorna o usuário sem alterações
        catchError(error => {
          console.error('❌ AuthService: Erro no login:', error);
          return throwError(() => new Error(error.error?.error || 'Erro ao fazer login'));
        })
      );
  }

  /**
   * Registra um novo usuário
   */
  register(userData: LocalUserRegistration): Observable<LocalUser> {
    return this.http.post<ApiResponse<LocalUser>>(`${environment.api.baseUrl}/api/user/register`, userData)
      .pipe(
        map(response => {
          if (response.error) {
            throw new Error(response.error);
          }
          
          if (!response.data) {
            throw new Error('Dados do usuário não recebidos');
          }

          return response.data;
        }),
        catchError(error => {
          console.error('Erro no registro:', error);
          return throwError(() => new Error(error.error?.error || 'Erro ao criar conta'));
        })
      );
  }

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUserData(): Observable<LocalUser> {
    console.log('🔐 AuthService: getCurrentUserData() - Token:', !!this.authToken);
    
    if (!this.authToken) {
      console.error('❌ AuthService: Sem token para buscar dados do usuário');
      return throwError(() => new Error('Usuário não autenticado'));
    }

    return this.http.get<ApiResponse<LocalUser>>(`${environment.api.baseUrl}/api/user/current`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('🔐 AuthService: Resposta do /current:', response)),
      map(response => {
        if (response.error) {
          console.error('❌ AuthService: Erro na resposta do /current:', response.error);
          throw new Error(response.error);
        }
        
        if (!response.data) {
          console.error('❌ AuthService: Dados do usuário não encontrados');
          throw new Error('Dados do usuário não encontrados');
        }

        console.log('✅ AuthService: Dados do usuário obtidos com sucesso:', response.data);
        this.currentUserSubject.next(response.data);
        this.saveUserData(response.data);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ AuthService: Erro ao buscar dados do usuário:', error);
        this.logout();
        return throwError(() => new Error('Erro ao buscar dados do usuário'));
      })
    );
  }

  /**
   * Faz logout
   */
  logout(): void {
    console.log('🔐 AuthService: Fazendo logout...');
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.authToken = null;
    console.log('✅ AuthService: Logout concluído');
  }

  /**
   * Altera a senha do usuário
   */
  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    if (!this.authToken) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    return this.http.post<ApiResponse<{ message: string }>>(`${environment.api.baseUrl}/api/user/change-password`, {
      currentPassword,
      newPassword,
      confirmNewPassword: newPassword
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error);
        }
        return true;
      }),
      catchError(error => {
        console.error('Erro ao alterar senha:', error);
        return throwError(() => new Error(error.error?.error || 'Erro ao alterar senha'));
      })
    );
  }

  /**
   * Solicita reset de senha
   */
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<ApiResponse<{ message: string }>>(`${environment.api.baseUrl}/api/user/forgot-password`, {
      email
    }).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error);
        }
        return true;
      }),
      catchError(error => {
        console.error('Erro ao solicitar reset de senha:', error);
        return throwError(() => new Error(error.error?.error || 'Erro ao solicitar reset de senha'));
      })
    );
  }

  /**
   * Reseta a senha com token
   */
  resetPassword(email: string, token: string, newPassword: string): Observable<boolean> {
    return this.http.post<ApiResponse<{ message: string }>>(`${environment.api.baseUrl}/api/user/reset-password`, {
      email,
      token,
      newPassword,
      confirmNewPassword: newPassword
    }).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error);
        }
        return true;
      }),
      catchError(error => {
        console.error('Erro ao resetar senha:', error);
        
        // Tratar erros de validação do backend
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const errorMessages = error.error.errors.join(', ');
          return throwError(() => new Error(errorMessages));
        }
        
        // Tratar outros tipos de erro
        return throwError(() => new Error(error.error?.error || error.error?.message || 'Erro ao resetar senha'));
      })
    );
  }

  /**
   * Obtém informações sobre o ambiente atual
   */
  getEnvironmentInfo(): Observable<EnvironmentInfo> {
    return this.http.get<EnvironmentInfo>(`${environment.api.baseUrl}/api/user/environment-info`).pipe(
      catchError(error => {
        console.error('Erro ao obter informações do ambiente:', error);
        // Fallback para informações locais em caso de erro
        return of(this.environmentService.getEnvironmentInfo());
      })
    );
  }

  /**
   * Verifica se o sistema está em modo de desenvolvimento
   */
  isDevelopmentMode(): Observable<boolean> {
    return this.getEnvironmentInfo().pipe(
      map(info => info.isDevelopment)
    );
  }

  /**
   * Verifica se o sistema está em modo de desenvolvimento ou UAT
   */
  isDevelopmentOrUATMode(): Observable<boolean> {
    return this.getEnvironmentInfo().pipe(
      map(info => info.isDevelopmentOrUAT)
    );
  }

  /**
   * Baixa o template do email de reset mais recente
   */
  downloadEmailTemplate(): Observable<Blob> {
    return this.http.get(`${environment.api.baseUrl}/api/user/download-email-template`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Erro ao baixar template do email:', error);
        return throwError(() => new Error(error.error?.error || 'Erro ao baixar template do email'));
      })
    );
  }

  /**
   * Verifica se um email de usuário existe (apenas para desenvolvimento)
   */
  checkEmailExists(email: string): Observable<{email: string, exists: boolean, message: string}> {
    return this.http.get<{email: string, exists: boolean, message: string}>(`${environment.api.baseUrl}/api/user/check-email-exists?email=${encodeURIComponent(email)}`);
  }

  /**
   * Testa a conexão SMTP (apenas para desenvolvimento)
   */
  testSmtpConnection(): Observable<{success: boolean, message: string, smtpConfig?: any}> {
    return this.http.post<{success: boolean, message: string, smtpConfig?: any}>(`${environment.api.baseUrl}/api/user/test-smtp`, {});
  }

  /**
   * Envia email de teste (apenas para desenvolvimento)
   */
  sendTestEmail(email: string): Observable<{success: boolean, message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${environment.api.baseUrl}/api/user/send-test-email`, { email });
  }

  /**
   * Atualiza o perfil do usuário
   */
  updateProfile(firstName: string, lastName: string): Observable<LocalUser> {
    if (!this.authToken) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    return this.http.put<ApiResponse<{ message: string }>>(`${environment.api.baseUrl}/api/user/profile`, {
      firstName,
      lastName
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => {
        // Atualizar dados locais
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim()
          };
          this.currentUserSubject.next(updatedUser);
          this.saveUserData(updatedUser);
          return updatedUser;
        }
        throw new Error('Usuário não encontrado');
      }),
      catchError(error => {
        console.error('Erro ao atualizar perfil:', error);
        return throwError(() => new Error(error.error?.error || 'Erro ao atualizar perfil'));
      })
    );
  }

  /**
   * Obtém headers de autenticação
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Salva dados de autenticação no localStorage
   */
  private saveAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.authToken) {
      localStorage.setItem(environment.jwt.tokenKey, this.authToken);
      console.log('💾 AuthService: Token salvo no localStorage');
    }
  }

  /**
   * Salva dados do usuário no localStorage
   */
  private saveUserData(user: LocalUser): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    localStorage.setItem(environment.jwt.userKey, JSON.stringify(user));
    console.log('💾 AuthService: Dados do usuário salvos no localStorage');
  }

  /**
   * Limpa dados de autenticação do localStorage
   */
  private clearAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    localStorage.removeItem(environment.jwt.tokenKey);
    localStorage.removeItem(environment.jwt.userKey);
    console.log('🗑️ AuthService: Dados de autenticação limpos do localStorage');
  }

  /**
   * Verifica se o usuário está carregando (sempre false para JWT local)
   */
  isLoading(): Observable<boolean> {
    return of(false);
  }

  /**
   * Obtém o perfil do usuário (compatibilidade)
   */
  getUserProfile(): Observable<LocalUser | null> {
    return this.currentUser$;
  }

  /**
   * Logout simples (compatibilidade)
   */
  simpleLogout(): void {
    this.logout();
  }

  /**
   * Reset de senha com Auth0 (compatibilidade - não suportado)
   */
  resetPasswordWithAuth0(): void {
    console.warn('resetPasswordWithAuth0 não é mais suportado. Use resetPassword() em vez disso.');
  }

  /**
   * Métodos de compatibilidade (não usados mais)
   */
  loginWithAuth0(): void {
    console.warn('loginWithAuth0 não é mais suportado. Use login() em vez disso.');
  }

  loginWithGoogle(): void {
    console.warn('loginWithGoogle não é mais suportado. Use login() em vez disso.');
  }

  signupWithAuth0(): void {
    console.warn('signupWithAuth0 não é mais suportado. Use register() em vez disso.');
  }

  registerLocalUser(userData: LocalUserRegistration): Observable<LocalUser> {
    return this.register(userData);
  }
}