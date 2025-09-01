import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LocalUserLogin } from '../../services/auth.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { loginAnimations } from './login.animations';
import { DevToolsComponent } from '../dev-tools/dev-tools.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DevToolsComponent],
  animations: loginAnimations,
  template: `
    <div class="login-container">
      <div class="login-card" [@fadeInUp]>
        <!-- Logo e Título -->
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">📚</div>
            <h1>CCAA Books</h1>
          </div>
          <p class="subtitle">Sistema de Gerenciamento de Livros</p>
        </div>

        <!-- Formulário de Login -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <h2>Entrar na sua conta</h2>
          
          <!-- Campo E-mail -->
          <div class="form-group" [class.has-error]="isFieldInvalid('email')">
            <label for="email">
              E-mail
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                placeholder="Digite seu e-mail"
                class="form-input"
                [class.error]="isFieldInvalid('email')"
                [class.success]="isFieldValid('email')"
                autocomplete="email"
                (blur)="onFieldBlur('email')"
              >
              <div class="input-icon">
                <span *ngIf="isFieldValid('email')" class="icon-success">✓</span>
                <span *ngIf="isFieldInvalid('email')" class="icon-error">✗</span>
              </div>
            </div>
            <div *ngIf="isFieldInvalid('email')" class="error-message" [@slideDown]>
              <span *ngIf="loginForm.get('email')?.hasError('required')">
                <i class="fas fa-exclamation-circle"></i> E-mail é obrigatório
              </span>
              <span *ngIf="loginForm.get('email')?.hasError('email')">
                <i class="fas fa-exclamation-circle"></i> Formato de e-mail inválido
              </span>
            </div>
          </div>

          <!-- Campo Senha -->
          <div class="form-group" [class.has-error]="isFieldInvalid('password')">
            <label for="password">
              Senha
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                placeholder="Digite sua senha"
                class="form-input"
                [class.error]="isFieldInvalid('password')"
                [class.success]="isFieldValid('password')"
                autocomplete="current-password"
                (blur)="onFieldBlur('password')"
              >
              <div class="input-icon">
                <button 
                  type="button" 
                  class="password-toggle"
                  (click)="togglePassword()"
                  [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  <span *ngIf="!showPassword">👁️</span>
                  <span *ngIf="showPassword">🙈</span>
                </button>
              </div>
            </div>
            <div *ngIf="isFieldInvalid('password')" class="error-message" [@slideDown]>
              <span *ngIf="loginForm.get('password')?.hasError('required')">
                <i class="fas fa-exclamation-circle"></i> Senha é obrigatória
              </span>
              <span *ngIf="loginForm.get('password')?.hasError('minlength')">
                <i class="fas fa-exclamation-circle"></i> Senha deve ter pelo menos 6 caracteres
              </span>
            </div>
          </div>

          <!-- Lembrar de mim -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="rememberMe"
                class="checkbox-input"
              >
              <span class="checkmark"></span>
              Lembrar de mim
            </label>
          </div>

          <!-- Botões de ação -->
          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="loginForm.invalid || isSubmitting || isLockedOut"
            [class.loading]="isSubmitting"
            [class.locked]="isLockedOut"
            [@pulse]="isSubmitting ? 'pulse' : 'idle'"
          >
            <span *ngIf="!isSubmitting && !isLockedOut" class="btn-content">
              <i class="fas fa-sign-in-alt"></i>
              Entrar
            </span>
            <span *ngIf="isSubmitting" class="btn-content">
              <div class="spinner"></div>
              Entrando...
            </span>
            <span *ngIf="isLockedOut" class="btn-content">
              <i class="fas fa-lock"></i>
              Bloqueado
            </span>
          </button>

          <div class="divider">
            <span>ou</span>
          </div>

          <button 
            type="button"
            (click)="goToRegister()" 
            class="btn btn-secondary btn-full"
            [disabled]="isSubmitting"
          >
            <i class="fas fa-user-plus"></i>
            Criar nova conta
          </button>

          <!-- Links de ajuda -->
          <div class="form-footer">
            <a href="#" class="forgot-password" (click)="forgotPassword($event)">
              <i class="fas fa-key"></i>
              Esqueceu sua senha?
            </a>
          </div>
        </form>

        <!-- Informações adicionais -->
        <div class="login-info">
          <div class="info-header">
            <i class="fas fa-info-circle"></i>
            <strong>Não tem uma conta?</strong>
          </div>
          <p>
            Crie uma conta de acesso no site, informando seu nome, data de nascimento, e-mail/login e senha de acesso.
          </p>
        </div>

        <!-- Mensagens de feedback -->
        <div *ngIf="errorMessage" class="alert alert-error" [@slideDown]>
          <i class="fas fa-exclamation-triangle"></i>
          {{ errorMessage }}
          <button type="button" class="alert-close" (click)="clearError()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div *ngIf="successMessage" class="alert alert-success" [@slideDown]>
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </div>

      <!-- Ferramentas de Desenvolvimento -->
      <app-dev-tools></app-dev-tools>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  private destroy$ = new Subject<void>();
  
  // Controle de tentativas de login
  private loginAttempts = 0;
  private maxAttempts = 3;
  private lockoutTime = 5 * 60 * 1000; // 5 minutos em millisegundos
  private lockoutUntil: Date | null = null;
  isLockedOut = false;
  remainingTime = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Validação em tempo real com debounce
    this.loginForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.clearMessages();
      });

    // Restaurar dados salvos
    this.restoreFormData();
    
    // Verificar status de bloqueio
    this.checkLockoutStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Verifica se um campo é válido
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.valid && field.dirty : false;
  }

  /**
   * Manipula o evento blur dos campos
   */
  onFieldBlur(fieldName: string): void {
    const field = this.loginForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }

  /**
   * Alterna a visibilidade da senha
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Submete o formulário
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationErrors();
      return;
    }

    // Verificar se está bloqueado
    if (this.isLockedOut) {
      this.errorMessage = `Muitas tentativas de login. Tente novamente em ${Math.ceil(this.remainingTime / 1000)} segundos.`;
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();
    this.saveFormData();

    const credentials: LocalUserLogin = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('🔐 LoginComponent: Iniciando login...', credentials);

    this.authService.login(credentials).subscribe({
      next: (user) => {
        console.log('✅ LoginComponent: Login bem-sucedido, usuário:', user);
        this.successMessage = 'Login realizado com sucesso! Redirecionando...';
        this.isSubmitting = false;
        
        // Redirecionar imediatamente após login bem-sucedido
        console.log('✅ LoginComponent: Login bem-sucedido, redirecionando...');
        this.router.navigate(['/books']);
      },
      error: (error) => {
        console.error('❌ LoginComponent: Erro no login:', error);
        
        // Tratar especificamente credenciais inválidas
        if (error.message?.includes('Credenciais inválidas')) {
          this.handleInvalidCredentials();
        } else if (error.message?.includes('Erro de conexão')) {
          this.errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else {
          this.errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
        }
        
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Mostra erros de validação com animação
   */
  private showValidationErrors(): void {
    this.errorMessage = 'Por favor, corrija os erros no formulário.';
    // Adicionar animação shake nos campos com erro
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  /**
   * Adiciona animação de shake para credenciais inválidas
   */
  private addShakeAnimation(): void {
    setTimeout(() => {
      const loginCard = document.querySelector('.login-card');
      if (loginCard) {
        loginCard.classList.add('shake');
        setTimeout(() => loginCard.classList.remove('shake'), 600);
      }
      
      // Também adicionar shake nos campos de email e senha
      const emailField = document.querySelector('.form-group:has(#email)');
      const passwordField = document.querySelector('.form-group:has(#password)');
      
      [emailField, passwordField].forEach(field => {
        if (field) {
          field.classList.add('shake');
          setTimeout(() => field.classList.remove('shake'), 500);
        }
      });
    }, 100);
  }

  /**
   * Trata tentativas de credenciais inválidas
   */
  private handleInvalidCredentials(): void {
    this.loginAttempts++;
    
    if (this.loginAttempts >= this.maxAttempts) {
      this.lockoutUntil = new Date(Date.now() + this.lockoutTime);
      this.isLockedOut = true;
      this.startLockoutTimer();
      this.errorMessage = `Muitas tentativas de login. Tente novamente em ${Math.ceil(this.lockoutTime / 1000 / 60)} minutos.`;
    } else {
      const remainingAttempts = this.maxAttempts - this.loginAttempts;
      this.errorMessage = `E-mail ou senha incorretos. ${remainingAttempts} tentativa(s) restante(s).`;
    }
    
    this.addShakeAnimation();
  }

  /**
   * Inicia o timer de bloqueio
   */
  private startLockoutTimer(): void {
    const timer = setInterval(() => {
      if (!this.lockoutUntil) {
        clearInterval(timer);
        return;
      }
      
      this.remainingTime = this.lockoutUntil.getTime() - Date.now();
      
      if (this.remainingTime <= 0) {
        this.isLockedOut = false;
        this.lockoutUntil = null;
        this.loginAttempts = 0;
        this.remainingTime = 0;
        clearInterval(timer);
      }
    }, 1000);
  }

  /**
   * Verifica se está bloqueado ao inicializar
   */
  private checkLockoutStatus(): void {
    const savedLockout = localStorage.getItem('loginLockout');
    if (savedLockout) {
      const lockoutTime = new Date(savedLockout);
      if (lockoutTime > new Date()) {
        this.lockoutUntil = lockoutTime;
        this.isLockedOut = true;
        this.startLockoutTimer();
      } else {
        localStorage.removeItem('loginLockout');
      }
    }
  }

  /**
   * Navega para a página de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Esqueceu a senha
   */
  forgotPassword(event: Event): void {
    event.preventDefault();
    const email = this.loginForm.get('email')?.value;
    
    if (!email) {
      this.errorMessage = 'Digite seu e-mail para recuperar a senha.';
      return;
    }

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage = 'Instruções de recuperação enviadas para seu e-mail.';
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao solicitar recuperação de senha.';
      }
    });
  }

  /**
   * Marca todos os campos como tocados para mostrar erros
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Limpa mensagens de erro e sucesso
   */
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Limpa mensagem de erro
   */
  clearError(): void {
    this.errorMessage = '';
  }

  /**
   * Salva dados do formulário no localStorage
   */
  private saveFormData(): void {
    if (this.loginForm.get('rememberMe')?.value) {
      const formData = {
        email: this.loginForm.get('email')?.value,
        rememberMe: true
      };
      localStorage.setItem('loginFormData', JSON.stringify(formData));
    } else {
      localStorage.removeItem('loginFormData');
    }
  }

  /**
   * Restaura dados salvos do formulário
   */
  private restoreFormData(): void {
    const savedData = localStorage.getItem('loginFormData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.rememberMe && data.email) {
          this.loginForm.patchValue({
            email: data.email,
            rememberMe: true
          });
        }
      } catch (error) {
        console.warn('Erro ao restaurar dados do formulário:', error);
      }
    }
  }
}
