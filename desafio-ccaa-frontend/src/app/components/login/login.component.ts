import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LocalUserLogin } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="header">
          <h1>🔐 Entrar</h1>
          <p>Faça login com sua conta</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- E-mail -->
          <div class="form-group">
            <label for="email">E-mail/Login *</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="Digite seu e-mail"
              [class.error]="isFieldInvalid('email')">
            <div *ngIf="isFieldInvalid('email')" class="error-message">
              <span *ngIf="loginForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
              <span *ngIf="loginForm.get('email')?.hasError('email')">E-mail inválido</span>
            </div>
          </div>

          <!-- Senha -->
          <div class="form-group">
            <label for="password">Senha *</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="Digite sua senha"
              [class.error]="isFieldInvalid('password')">
            <div *ngIf="isFieldInvalid('password')" class="error-message">
              Senha é obrigatória
            </div>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="loginForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Entrar</span>
              <span *ngIf="isSubmitting">Entrando...</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="goToRegister()"
              [disabled]="isSubmitting">
              Criar nova conta
            </button>
          </div>
        </form>

        <!-- Separador -->
        <div class="separator">
          <span>ou</span>
        </div>

        <!-- Login com Auth0 -->
        <div class="auth0-section">
          <button 
            type="button" 
            class="btn btn-auth0"
            (click)="loginWithAuth0()"
            [disabled]="isSubmitting">
            <i class="fas fa-external-link-alt"></i>
            Entrar com Auth0
          </button>
          
          <!-- Informações sobre verificação de email -->
          <div class="auth0-info">
            <small>
              <i class="fas fa-info-circle"></i>
              O Auth0 enviará um email de verificação para confirmar sua conta
            </small>
          </div>
        </div>

        <!-- Mensagens de erro/sucesso -->
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .header p {
      color: #666;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    input {
      padding: 0.75rem;
      border: 2px solid #e3e3e3;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .separator {
      text-align: center;
      margin: 2rem 0;
      position: relative;
    }

    .separator::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e3e3e3;
    }

    .separator span {
      background-color: white;
      padding: 0 1rem;
      color: #666;
      font-size: 0.9rem;
    }

    .auth0-section {
      text-align: center;
    }

    .auth0-info {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #e3f2fd;
      border-radius: 4px;
      border: 1px solid #bbdefb;
    }

    .auth0-info small {
      color: #1976d2;
      font-size: 0.8rem;
    }

    .auth0-info i {
      margin-right: 0.5rem;
    }

    .btn-auth0 {
      background-color: #f39c12;
      color: white;
      width: 100%;
    }

    .btn-auth0:hover:not(:disabled) {
      background-color: #e67e22;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      text-align: center;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    @media (max-width: 768px) {
      .login-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Submete o formulário de login
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials: LocalUserLogin = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.loginLocalUser(credentials).subscribe({
      next: (user) => {
        this.successMessage = 'Login realizado com sucesso! Redirecionando...';
        this.isSubmitting = false;
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Navega para a página de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Faz login via Auth0
   */
  loginWithAuth0(): void {
    this.authService.loginWithAuth0();
  }
}
