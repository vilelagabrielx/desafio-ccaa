import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password-token',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reset-container">
      <div class="reset-card">
        <div class="header">
          <h1>🔑 Nova Senha</h1>
          <p>Digite o token recebido e sua nova senha</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">E-mail *</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="Digite seu e-mail"
              [class.error]="isFieldInvalid('email')">
            <div *ngIf="isFieldInvalid('email')" class="error-message">
              <span *ngIf="resetForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
              <span *ngIf="resetForm.get('email')?.hasError('email')">E-mail inválido</span>
            </div>
          </div>

          <!-- Token -->
          <div class="form-group">
            <label for="token">Token de Reset *</label>
            <div class="token-input-wrapper">
              <input 
                type="text" 
                id="token" 
                formControlName="token"
                [placeholder]="environmentInfo?.isDevelopmentOrUAT ? 'Digite o token recebido ou carregue o arquivo .eml' : 'Digite o token recebido'"
                [class.error]="isFieldInvalid('token')">
              <button 
                *ngIf="environmentInfo?.isDevelopmentOrUAT"
                type="button" 
                class="btn btn-upload"
                (click)="fileInput.click()"
                [disabled]="isProcessingFile">
                <span *ngIf="!isProcessingFile">📁</span>
                <span *ngIf="isProcessingFile">⏳</span>
              </button>
            </div>
            <input 
              *ngIf="environmentInfo?.isDevelopmentOrUAT"
              #fileInput
              type="file" 
              accept=".eml"
              (change)="onFileSelected($event)"
              style="display: none;">
            <div *ngIf="isFieldInvalid('token')" class="error-message">
              <span *ngIf="resetForm.get('token')?.hasError('required')">Token é obrigatório</span>
            </div>
            <div *ngIf="environmentInfo?.isDevelopmentOrUAT" class="file-help">
              <small>💡 Dica: Você pode carregar o arquivo .eml baixado para extrair o token automaticamente</small>
            </div>
          </div>

          <!-- Nova Senha -->
          <div class="form-group">
            <label for="newPassword">Nova Senha *</label>
            <div class="password-input-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="newPassword" 
                formControlName="newPassword"
                placeholder="Digite sua nova senha"
                [class.error]="isFieldInvalid('newPassword')">
              <button 
                type="button" 
                class="password-toggle"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <span *ngIf="!showPassword">👁️</span>
                <span *ngIf="showPassword">🙈</span>
              </button>
            </div>
            <div *ngIf="isFieldInvalid('newPassword')" class="error-message">
              <span *ngIf="resetForm.get('newPassword')?.hasError('required')">Nova senha é obrigatória</span>
              <span *ngIf="resetForm.get('newPassword')?.hasError('minlength')">Senha deve ter pelo menos 6 caracteres</span>
            </div>
            
            <!-- Requisitos de senha -->
            <div class="password-requirements">
              <h4>Requisitos da senha:</h4>
              <ul>
                <li [class.valid]="hasLowercase()">Pelo menos 1 letra minúscula (a-z)</li>
                <li [class.valid]="hasUppercase()">Pelo menos 1 letra maiúscula (A-Z)</li>
                <li [class.valid]="hasDigit()">Pelo menos 1 dígito (0-9)</li>
                <li [class.valid]="hasMinLength()">Mínimo de 6 caracteres</li>
              </ul>
            </div>
          </div>

          <!-- Confirmar Nova Senha -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar Nova Senha *</label>
            <div class="password-input-wrapper">
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword"
                placeholder="Confirme sua nova senha"
                [class.error]="isFieldInvalid('confirmPassword')">
              <button 
                type="button" 
                class="password-toggle"
                (click)="toggleConfirmPassword()"
                [attr.aria-label]="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <span *ngIf="!showConfirmPassword">👁️</span>
                <span *ngIf="showConfirmPassword">🙈</span>
              </button>
            </div>
            <div *ngIf="isFieldInvalid('confirmPassword')" class="error-message">
              <span *ngIf="resetForm.get('confirmPassword')?.hasError('required')">Confirmação de senha é obrigatória</span>
              <span *ngIf="resetForm.get('confirmPassword')?.hasError('passwordMismatch')">Senhas não coincidem</span>
            </div>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="resetForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Redefinir Senha</span>
              <span *ngIf="isSubmitting">Redefinindo...</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="goToLogin()"
              [disabled]="isSubmitting">
              Voltar ao Login
            </button>
          </div>
        </form>

        <!-- Informações sobre o token -->
        <div class="info-section">
          <div class="info-card">
            <i class="fas fa-key"></i>
            <h3>Como obter o token?</h3>
            <ol>
              <li>Vá para a página "Esqueceu sua senha?"</li>
              <li>Digite seu email e solicite o reset</li>
              <li *ngIf="environmentInfo?.isDevelopmentOrUAT"><strong>Opção 1:</strong> Baixe o template do email e carregue aqui</li>
              <li *ngIf="environmentInfo?.isDevelopmentOrUAT"><strong>Opção 2:</strong> Verifique o console do backend</li>
              <li *ngIf="environmentInfo?.isDevelopmentOrUAT"><strong>Opção 3:</strong> Procure na pasta C:\temp\emails\</li>
              <li *ngIf="!environmentInfo?.isDevelopmentOrUAT"><strong>Opção 1:</strong> Verifique sua caixa de email</li>
              <li *ngIf="!environmentInfo?.isDevelopmentOrUAT"><strong>Opção 2:</strong> Verifique a pasta de spam/lixo eletrônico</li>
              <li>Copie o token e cole aqui{{ environmentInfo?.isDevelopmentOrUAT ? ' ou carregue o arquivo .eml' : '' }}</li>
            </ol>
            <div class="token-warning">
              <strong>⚠️ IMPORTANTE: O token expira em 1 hora!</strong>
            </div>
          </div>
          
          <div *ngIf="environmentInfo?.isDevelopmentOrUAT" class="info-card development-mode">
            <i class="fas fa-download"></i>
            <h3>💡 Dica Rápida</h3>
            <p>Após solicitar o reset, use o botão "Baixar Template do Email" na página anterior e depois carregue o arquivo aqui para extrair o token automaticamente!</p>
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
    .reset-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .reset-card {
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

    .reset-form {
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

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper input {
      flex: 1;
      padding-right: 3rem;
    }

    .token-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .token-input-wrapper input {
      flex: 1;
      padding-right: 3rem;
    }

    .btn-upload {
      position: absolute;
      right: 0.75rem;
      background: #17a2b8;
      color: white;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 1rem;
      transition: background-color 0.2s ease;
    }

    .btn-upload:hover:not(:disabled) {
      background: #138496;
    }

    .btn-upload:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .file-help {
      margin-top: 0.5rem;
      color: #6c757d;
      font-size: 0.8rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      font-size: 1rem;
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
    }

    .info-card i {
      font-size: 2rem;
      color: #1976d2;
      margin-bottom: 1rem;
      display: block;
      text-align: center;
    }

    .info-card h3 {
      color: #1976d2;
      margin-bottom: 1rem;
      text-align: center;
    }

    .info-card ol {
      color: #1976d2;
      margin: 0;
      padding-left: 1.5rem;
      line-height: 1.8;
    }

    .info-card li {
      margin-bottom: 0.5rem;
    }

    .token-warning {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      color: #856404;
      text-align: center;
    }

    .info-card.development-mode {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      margin-top: 1rem;
    }

    .info-card.development-mode i {
      color: #856404;
    }

    .info-card.development-mode h3 {
      color: #856404;
    }

    .info-card.development-mode p {
      color: #856404;
      margin: 0.5rem 0;
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

    .password-requirements {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .password-requirements h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #495057;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 1.2rem;
      list-style: none;
    }

    .password-requirements li {
      margin-bottom: 0.25rem;
      font-size: 0.8rem;
      color: #6c757d;
      position: relative;
    }

    .password-requirements li:before {
      content: "❌";
      position: absolute;
      left: -1.2rem;
    }

    .password-requirements li.valid {
      color: #28a745;
    }

    .password-requirements li.valid:before {
      content: "✅";
    }

    @media (max-width: 768px) {
      .reset-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ResetPasswordTokenComponent implements OnInit {
  resetForm: FormGroup;
  isSubmitting = false;
  isProcessingFile = false;
  environmentInfo: any = null;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Verificar se há parâmetros na URL
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resetForm.patchValue({ email: params['email'] });
      }
      if (params['token']) {
        this.resetForm.patchValue({ token: params['token'] });
      }
    });

    // Obter informações do ambiente
    this.authService.getEnvironmentInfo().subscribe(info => {
      this.environmentInfo = info;
    });
  }

  /**
   * Validador personalizado para verificar se as senhas coincidem
   */
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna visibilidade da confirmação de senha
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Verifica se a senha tem pelo menos uma letra minúscula
   */
  hasLowercase(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  /**
   * Verifica se a senha tem pelo menos uma letra maiúscula
   */
  hasUppercase(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  /**
   * Verifica se a senha tem pelo menos um dígito
   */
  hasDigit(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return /[0-9]/.test(password);
  }

  /**
   * Verifica se a senha tem pelo menos 6 caracteres
   */
  hasMinLength(): boolean {
    const password = this.resetForm.get('newPassword')?.value || '';
    return password.length >= 6;
  }

  /**
   * Submete o formulário de reset
   */
  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, token, newPassword } = this.resetForm.value;

    // Resetar senha com token
    this.authService.resetPassword(email, token, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Senha redefinida com sucesso! Redirecionando para o login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao redefinir senha. Verifique o token e tente novamente.';
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

  /**
   * Processa arquivo .eml selecionado para extrair o token
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.eml')) {
      this.errorMessage = 'Por favor, selecione um arquivo .eml válido.';
      return;
    }

    this.isProcessingFile = true;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const token = this.extractTokenFromEmail(content);
        
        if (token) {
          this.resetForm.patchValue({ token });
          this.successMessage = 'Token extraído com sucesso do arquivo .eml!';
          // Limpar a mensagem de sucesso após 3 segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = 'Não foi possível encontrar o token no arquivo .eml. Verifique se o arquivo está correto.';
        }
      } catch (error) {
        this.errorMessage = 'Erro ao processar o arquivo .eml.';
        console.error('Erro ao processar arquivo:', error);
      } finally {
        this.isProcessingFile = false;
        // Limpar o input de arquivo
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      this.errorMessage = 'Erro ao ler o arquivo.';
      this.isProcessingFile = false;
      event.target.value = '';
    };

    reader.readAsText(file);
  }

  /**
   * Extrai o token de reset do conteúdo do email
   */
  private extractTokenFromEmail(content: string): string | null {
    try {
      // Procurar por padrões comuns de token no email
      // O token geralmente está entre tags <h3> ou em uma linha específica
      
      // Padrão 1: Token entre tags <h3>
      const h3Match = content.match(/<h3[^>]*>(.*?)<\/h3>/i);
      if (h3Match && h3Match[1].trim().length > 20) {
        return h3Match[1].trim();
      }

      // Padrão 2: Token em uma linha que contém "token" ou similar
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Procurar por linhas que contenham uma string longa (provavelmente o token)
        if (trimmedLine.length > 20 && 
            (trimmedLine.includes('token') || 
             trimmedLine.includes('reset') || 
             /^[A-Za-z0-9+/=_-]+$/.test(trimmedLine))) {
          return trimmedLine;
        }
      }

      // Padrão 3: Procurar por qualquer string longa que pareça um token
      const tokenMatch = content.match(/[A-Za-z0-9+/=_-]{20,}/);
      if (tokenMatch) {
        return tokenMatch[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao extrair token:', error);
      return null;
    }
  }
}
