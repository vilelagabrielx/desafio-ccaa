import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { loginAnimations } from './login.animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
            [disabled]="loginForm.invalid || isSubmitting"
            [class.loading]="isSubmitting"
            [@pulse]="isSubmitting ? 'pulse' : 'idle'"
          >
            <span *ngIf="!isSubmitting" class="btn-content">
              <i class="fas fa-sign-in-alt"></i>
              Entrar com Auth0
            </span>
            <span *ngIf="isSubmitting" class="btn-content">
              <div class="spinner"></div>
              Entrando...
            </span>
          </button>

          <div class="divider">
            <span>ou</span>
          </div>

          <button 
            type="button"
            (click)="signupWithAuth0()" 
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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

    this.isSubmitting = true;
    this.clearMessages();
    this.saveFormData();

    // Simular delay para melhor UX
    setTimeout(() => {
      this.loginWithAuth0();
    }, 500);
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
   * Faz login via Auth0
   */
  loginWithAuth0(): void {
    this.authService.loginWithAuth0();
  }

  /**
   * Faz signup via Auth0
   */
  signupWithAuth0(): void {
    this.authService.signupWithAuth0({
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    });
  }

  /**
   * Esqueceu a senha
   */
  forgotPassword(event: Event): void {
    event.preventDefault();
    this.successMessage = 'Redirecionando para recuperação de senha...';
    // Implementar lógica de recuperação
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
