import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reset-container">
      <div class="reset-card">
        <div class="header">
          <h1>🔑 Reset de Senha</h1>
          <p>Digite seu email para receber o link de reset</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
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
              <span *ngIf="resetForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
              <span *ngIf="resetForm.get('email')?.hasError('email')">E-mail inválido</span>
            </div>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="resetForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Enviar Email de Reset</span>
              <span *ngIf="isSubmitting">Enviando...</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="goToLogin()"
              [disabled]="isSubmitting">
              Voltar ao Login
            </button>
            
            <button 
              type="button" 
              class="btn btn-info"
              (click)="goToResetWithToken()"
              [disabled]="isSubmitting">
              Já tenho o token
            </button>
          </div>
        </form>

        <!-- Informações sobre o processo -->
        <div class="info-section">
          <div class="info-card">
            <i class="fas fa-envelope"></i>
            <h3>Como Funciona</h3>
            <ol>
              <li>Digite seu email cadastrado</li>
              <li>Receba um email com token de reset</li>
              <li>Use o token para criar nova senha</li>
              <li>Faça login com a nova senha</li>
            </ol>
          </div>
          
          <div class="info-card development-mode">
            <i class="fas fa-code"></i>
            <h3>Modo Desenvolvimento</h3>
            <p>Em ambiente local, os emails são salvos em arquivos na pasta:</p>
            <code>C:\temp\emails\</code>
            <p>Procure por arquivos .eml com o token de reset.</p>
          </div>
        </div>

        <!-- Mensagens de erro/sucesso -->
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="alert alert-success" [innerHTML]="formatSuccessMessage()">
        </div>

        <!-- Botão para baixar template do email (apenas em desenvolvimento ou UAT) -->
        <div *ngIf="successMessage && environmentInfo?.isDevelopmentOrUAT" class="template-download-section">
          <div class="template-info">
            <h4>📧 Template do Email</h4>
            <p>Em ambiente local, você pode baixar o template do email para extrair o token de reset.</p>
            <p><strong>⚠️ Token expira em 1 hora!</strong></p>
          </div>
          <button 
            type="button" 
            class="btn btn-download"
            (click)="downloadEmailTemplate()"
            [disabled]="isDownloading">
            <span *ngIf="!isDownloading">📥 Baixar Template do Email</span>
            <span *ngIf="isDownloading">⏳ Baixando...</span>
          </button>
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

    .btn-info {
      background-color: #17a2b8;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background-color: #138496;
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

    .info-card.development-mode code {
      background-color: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #856404;
      border: 1px solid #dee2e6;
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

    .template-download-section {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background-color: #e8f4fd;
      border: 1px solid #b8daff;
      border-radius: 8px;
    }

    .template-info h4 {
      color: #0c5460;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .template-info p {
      color: #0c5460;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .btn-download {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s ease;
      width: 100%;
    }

    .btn-download:hover:not(:disabled) {
      background-color: #138496;
    }

    .btn-download:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
export class ResetPasswordComponent {
  resetForm: FormGroup;
  isSubmitting = false;
  isDownloading = false;
  environmentInfo: any = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Obter informações do ambiente
    this.authService.getEnvironmentInfo().subscribe(info => {
      this.environmentInfo = info;
    });
  }

  /**
   * Verifica se um campo é inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Formata a mensagem de sucesso para exibição com quebras de linha
   */
  formatSuccessMessage(): string {
    return this.successMessage.replace(/\n/g, '<br>');
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

    // Solicitar reset de senha
    this.authService.forgotPassword(this.resetForm.value.email).subscribe({
      next: () => {
        // Em ambiente local, mostrar instruções na tela
        this.successMessage = `
          ✅ Solicitação processada com sucesso!
          
          ⏰ IMPORTANTE: O token expira em 1 hora!
          
          🔧 MODO DESENVOLVIMENTO:
          Como você está em ambiente local, o email foi salvo em arquivo.
          
          📁 Verifique a pasta: C:\\temp\\emails\\
          📧 Procure por arquivos .eml com o token de reset.
          
          🔑 Ou use o token que apareceu no console do backend.
          
          ⚡ Em produção, você receberia o email automaticamente.
        `;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao solicitar recuperação de senha.';
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
   * Navega para a página de reset com token
   */
  goToResetWithToken(): void {
    const email = this.resetForm.get('email')?.value;
    if (email) {
      this.router.navigate(['/reset-password-token'], { queryParams: { email } });
    } else {
      this.router.navigate(['/reset-password-token']);
    }
  }

  /**
   * Baixa o template do email de reset
   */
  downloadEmailTemplate(): void {
    this.isDownloading = true;
    this.errorMessage = '';

    this.authService.downloadEmailTemplate().subscribe({
      next: (blob) => {
        // Criar um link temporário para download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email_reset_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.eml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isDownloading = false;
        
        // Mostrar instruções sobre como usar o template
        this.successMessage += `
        
        📥 Template baixado com sucesso!
        
        📋 INSTRUÇÕES:
        1. Abra o arquivo .eml baixado
        2. Procure pelo token de reset (uma string longa)
        3. Copie o token
        4. Use o botão "Já tenho o token" para resetar sua senha
        `;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao baixar template do email.';
        this.isDownloading = false;
      }
    });
  }
}
