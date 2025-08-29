import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth0-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <div class="header">
          <h1>🚀 Criar Conta</h1>
          <p>Crie sua conta com Auth0</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
          <!-- Nome -->
          <div class="form-group">
            <label for="name">Nome Completo *</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name"
              placeholder="Digite seu nome completo"
              [class.error]="isFieldInvalid('name')">
            <div *ngIf="isFieldInvalid('name')" class="error-message">
              Nome é obrigatório
            </div>
          </div>

          <!-- Data de Nascimento -->
          <div class="form-group">
            <label for="dateOfBirth">Data de Nascimento *</label>
            <input 
              type="date" 
              id="dateOfBirth" 
              formControlName="dateOfBirth"
              [class.error]="isFieldInvalid('dateOfBirth')">
            <div *ngIf="isFieldInvalid('dateOfBirth')" class="error-message">
              Data de nascimento é obrigatória
            </div>
          </div>

          <!-- E-mail -->
          <div class="form-group">
            <label for="email">E-mail *</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="Digite seu e-mail"
              [class.error]="isFieldInvalid('email')">
            <div *ngIf="isFieldInvalid('email')" class="error-message">
              <span *ngIf="signupForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
              <span *ngIf="signupForm.get('email')?.hasError('email')">E-mail inválido</span>
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
              <span *ngIf="signupForm.get('password')?.hasError('required')">Senha é obrigatória</span>
              <span *ngIf="signupForm.get('password')?.hasError('minlength')">Senha deve ter pelo menos 8 caracteres</span>
            </div>
          </div>

          <!-- Confirmar Senha -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword"
              placeholder="Confirme sua senha"
              [class.error]="isFieldInvalid('confirmPassword')">
            <div *ngIf="isFieldInvalid('confirmPassword')" class="error-message">
              <span *ngIf="signupForm.get('confirmPassword')?.hasError('required')">Confirmação de senha é obrigatória</span>
              <span *ngIf="signupForm.hasError('passwordMismatch')">Senhas não coincidem</span>
            </div>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="signupForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Criar Conta</span>
              <span *ngIf="isSubmitting">Criando...</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="goToLogin()"
              [disabled]="isSubmitting">
              Já tenho conta
            </button>
          </div>
        </form>

        <!-- Informações sobre verificação -->
        <div class="info-section">
          <div class="info-card">
            <i class="fas fa-envelope"></i>
            <h3>Verificação de Email</h3>
            <p>Após criar sua conta, você receberá um email de verificação. Confirme seu email para ativar sua conta.</p>
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
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .signup-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 500px;
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

    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
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

    .info-section {
      margin-top: 2rem;
    }

    .info-card {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }

    .info-card i {
      font-size: 2rem;
      color: #1976d2;
      margin-bottom: 1rem;
    }

    .info-card h3 {
      color: #1976d2;
      margin-bottom: 0.5rem;
    }

    .info-card p {
      color: #1976d2;
      margin: 0;
      line-height: 1.5;
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
      .signup-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class Auth0SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Valida se as senhas coincidem
   */
  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Submete o formulário de signup
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Redirecionar para Auth0 com dados do formulário
    this.authService.signupWithAuth0(this.signupForm.value);
  }

  /**
   * Navega para a página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
