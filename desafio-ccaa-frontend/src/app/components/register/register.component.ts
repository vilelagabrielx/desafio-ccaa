import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LocalUserRegistration } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="header">
          <h1>📝 Criar Conta</h1>
          <p>Preencha os dados para criar sua conta de acesso</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
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
            <label for="email">E-mail/Login *</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="Digite seu e-mail"
              [class.error]="isFieldInvalid('email')">
            <div *ngIf="isFieldInvalid('email')" class="error-message">
              <span *ngIf="registerForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
              <span *ngIf="registerForm.get('email')?.hasError('email')">E-mail inválido</span>
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
              <span *ngIf="registerForm.get('password')?.hasError('required')">Senha é obrigatória</span>
              <span *ngIf="registerForm.get('password')?.hasError('minlength')">Senha deve ter pelo menos 6 caracteres</span>
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
              <span *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirmação de senha é obrigatória</span>
              <span *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Senhas não coincidem</span>
            </div>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="registerForm.invalid || isSubmitting">
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
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .register-card {
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

    .register-form {
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
      .register-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validador personalizado para verificar se as senhas coincidem
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Submete o formulário de registro
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData: LocalUserRegistration = {
      name: this.registerForm.value.name,
      dateOfBirth: this.registerForm.value.dateOfBirth,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.registerLocalUser(userData).subscribe({
      next: (user) => {
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        this.isSubmitting = false;
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Navega para a página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
