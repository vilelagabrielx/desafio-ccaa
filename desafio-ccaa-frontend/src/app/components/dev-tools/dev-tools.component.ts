import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dev-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botão flutuante para abrir ferramentas de dev -->
    <div class="dev-tools-floating-btn" *ngIf="isDevelopment">
      <button 
        class="dev-btn"
        (click)="toggleModal()"
        [title]="'Ferramentas de Desenvolvimento'"
      >
        <span class="dev-icon">🛠️</span>
        <span class="dev-text">Dev</span>
      </button>
    </div>

    <!-- Modal de ferramentas de desenvolvimento -->
    <div class="dev-modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="dev-modal" (click)="$event.stopPropagation()">
        <div class="dev-modal-header">
          <h3>🛠️ Ferramentas de Desenvolvimento</h3>
          <p>Disponível apenas em ambiente de desenvolvimento</p>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>
      
      <div class="dev-tools-content">
        <!-- Informações do Ambiente -->
        <div class="info-section">
          <h4>📊 Informações do Ambiente</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Ambiente:</span>
              <span class="value" [class]="environmentInfo?.environment">{{ environmentInfo?.environment || 'Carregando...' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Desenvolvimento:</span>
              <span class="value" [class]="environmentInfo?.isDevelopment ? 'true' : 'false'">
                {{ environmentInfo?.isDevelopment ? 'Sim' : 'Não' }}
              </span>
            </div>
                         <div class="info-item">
               <span class="label">API URL:</span>
               <span class="value">{{ getApiUrl() }}</span>
             </div>
          </div>
        </div>

        <!-- Ferramentas de Email -->
        <div class="tools-section">
          <h4>📧 Ferramentas de Email</h4>
          <div class="tools-grid">
            <button 
              class="btn btn-primary"
              (click)="downloadEmailTemplate()"
              [disabled]="isDownloading"
            >
              <span *ngIf="!isDownloading">📥 Baixar Email de Reset</span>
              <span *ngIf="isDownloading">⏳ Baixando...</span>
            </button>
            
            <button 
              class="btn btn-secondary"
              (click)="refreshEnvironmentInfo()"
              [disabled]="isLoading"
            >
              <span *ngIf="!isLoading">🔄 Atualizar Info</span>
              <span *ngIf="isLoading">⏳ Carregando...</span>
            </button>
          </div>
          
          <!-- Teste de Reset -->
          <div class="test-section">
            <h5>🧪 Teste de Reset de Senha</h5>
            <div class="test-form">
              <input 
                type="email" 
                [(ngModel)]="testEmail"
                placeholder="Digite um email para testar reset"
                class="test-input"
              >
              <button 
                class="btn btn-warning"
                (click)="testPasswordReset()"
                [disabled]="!testEmail || isTestingReset"
              >
                <span *ngIf="!isTestingReset">🚀 Testar Reset</span>
                <span *ngIf="isTestingReset">⏳ Testando...</span>
              </button>
            </div>
            <div class="test-info">
              <p><strong>💡 Dica:</strong> Use <code>teste&#64;exemplo.com</code> (usuário de teste criado)</p>
            </div>
          </div>

          <!-- Teste de SMTP -->
          <div class="smtp-section">
            <h5>📧 Teste de SMTP</h5>
            <div class="smtp-actions">
              <button 
                class="btn btn-info"
                (click)="testSmtpConnection()"
                [disabled]="isTestingSmtp"
              >
                <span *ngIf="!isTestingSmtp">🔗 Testar Conexão SMTP</span>
                <span *ngIf="isTestingSmtp">⏳ Testando...</span>
              </button>
              
              <button 
                class="btn btn-success"
                (click)="sendTestEmail()"
                [disabled]="!testEmail || isSendingTestEmail"
              >
                <span *ngIf="!isSendingTestEmail">📤 Enviar Email de Teste</span>
                <span *ngIf="isSendingTestEmail">⏳ Enviando...</span>
              </button>
            </div>
            <div class="smtp-info">
              <p><strong>📋 Configuração SMTP:</strong></p>
              <ul>
                <li>Configure as credenciais no <code>appsettings.json</code></li>
                <li>Para Gmail: use "Senha de App" (não a senha normal)</li>
                <li>Se não configurado, usa PickupDirectory como fallback</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="status-section">
          <div *ngIf="lastAction" class="status-message" [class]="lastActionType">
            <span *ngIf="lastActionType === 'success'">✅</span>
            <span *ngIf="lastActionType === 'error'">❌</span>
            <span *ngIf="lastActionType === 'info'">ℹ️</span>
            {{ lastAction }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Botão flutuante */
    .dev-tools-floating-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .dev-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 16px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .dev-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .dev-icon {
      font-size: 16px;
    }

    .dev-text {
      font-size: 12px;
    }

    /* Modal */
    .dev-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .dev-modal {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .dev-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      position: relative;
    }

    .dev-modal-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .dev-modal-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dev-tools {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .dev-tools-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .dev-tools-header h3 {
      color: white;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .dev-tools-header p {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      font-size: 0.9rem;
    }

    .dev-tools-content {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-section, .tools-section {
      margin-bottom: 1.5rem;
    }

    .info-section h4, .tools-section h4 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .label {
      font-weight: 600;
      color: #495057;
    }

    .value {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .value.dev {
      background: #d4edda;
      color: #155724;
    }

    .value.true {
      background: #d4edda;
      color: #155724;
    }

    .value.false {
      background: #f8d7da;
      color: #721c24;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

         .btn-secondary:hover:not(:disabled) {
       background: #545b62;
       transform: translateY(-1px);
     }

     .btn-warning {
       background: #ffc107;
       color: #212529;
     }

     .btn-warning:hover:not(:disabled) {
       background: #e0a800;
       transform: translateY(-1px);
     }

     .test-section {
       margin-top: 1.5rem;
       padding: 1rem;
       background: #f8f9fa;
       border-radius: 6px;
       border-left: 4px solid #ffc107;
     }

     .test-section h5 {
       color: #333;
       margin: 0 0 1rem 0;
       font-size: 1rem;
       font-weight: 600;
     }

     .test-form {
       display: flex;
       gap: 0.5rem;
       margin-bottom: 1rem;
     }

     .test-input {
       flex: 1;
       padding: 0.5rem;
       border: 1px solid #ced4da;
       border-radius: 4px;
       font-size: 0.9rem;
     }

     .test-input:focus {
       outline: none;
       border-color: #ffc107;
       box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25);
     }

     .test-info {
       background: #e9ecef;
       padding: 0.75rem;
       border-radius: 4px;
       font-size: 0.85rem;
     }

     .test-info code {
       background: #fff;
       padding: 0.2rem 0.4rem;
       border-radius: 3px;
       font-family: 'Courier New', monospace;
       color: #e83e8c;
     }

     .smtp-section {
       margin-top: 1.5rem;
       padding: 1rem;
       background: #f8f9fa;
       border-radius: 6px;
       border-left: 4px solid #17a2b8;
     }

     .smtp-section h5 {
       color: #333;
       margin: 0 0 1rem 0;
       font-size: 1rem;
       font-weight: 600;
     }

     .smtp-actions {
       display: flex;
       gap: 0.5rem;
       margin-bottom: 1rem;
     }

     .btn-info {
       background: #17a2b8;
       color: white;
     }

     .btn-info:hover:not(:disabled) {
       background: #138496;
       transform: translateY(-1px);
     }

     .btn-success {
       background: #28a745;
       color: white;
     }

     .btn-success:hover:not(:disabled) {
       background: #218838;
       transform: translateY(-1px);
     }

     .smtp-info {
       background: #e9ecef;
       padding: 0.75rem;
       border-radius: 4px;
       font-size: 0.85rem;
     }

     .smtp-info ul {
       margin: 0.5rem 0 0 1rem;
       padding: 0;
     }

     .smtp-info li {
       margin-bottom: 0.25rem;
     }

     .smtp-info code {
       background: #fff;
       padding: 0.2rem 0.4rem;
       border-radius: 3px;
       font-family: 'Courier New', monospace;
       color: #e83e8c;
     }

     .status-section {
       margin-top: 1rem;
     }

    .status-message {
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-message.info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    @media (max-width: 768px) {
      .tools-grid {
        grid-template-columns: 1fr;
      }
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class DevToolsComponent implements OnInit {
  isDevelopment = true; // Assume desenvolvimento por padrão
  showModal = false; // Controla se o modal está aberto
  environmentInfo: any = null;
  isDownloading = false;
  isLoading = false;
  isTestingReset = false;
  isTestingSmtp = false;
  isSendingTestEmail = false;
  testEmail = 'teste@exemplo.com'; // Email padrão para teste
  lastAction = '';
  lastActionType: 'success' | 'error' | 'info' = 'info';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.log('🛠️ DevToolsComponent: Inicializando...');
    this.checkEnvironment();
    this.loadEnvironmentInfo();
  }

  /**
   * Abre ou fecha o modal de ferramentas de desenvolvimento
   */
  toggleModal() {
    this.showModal = !this.showModal;
    if (this.showModal) {
      // Recarregar informações quando abrir o modal
      this.loadEnvironmentInfo();
    }
  }

  /**
   * Fecha o modal de ferramentas de desenvolvimento
   */
  closeModal() {
    this.showModal = false;
  }

  private checkEnvironment() {
    try {
      this.isDevelopment = !environment.production;
    } catch (error) {
      console.warn('Erro ao verificar environment:', error);
      this.isDevelopment = true; // Assume desenvolvimento em caso de erro
    }
  }

  getApiUrl(): string {
    try {
      const url = environment?.api?.baseUrl || 'http://localhost:5000';
      console.log('🛠️ DevToolsComponent: API URL:', url);
      return url;
    } catch (error) {
      console.warn('Erro ao obter API URL:', error);
      return 'http://localhost:5000';
    }
  }

  loadEnvironmentInfo() {
    this.isLoading = true;
    this.authService.getEnvironmentInfo().subscribe({
      next: (info) => {
        this.environmentInfo = info;
        this.isLoading = false;
        this.showMessage('Informações do ambiente carregadas', 'success');
      },
      error: (error) => {
        console.error('Erro ao carregar informações do ambiente:', error);
        this.isLoading = false;
        this.showMessage('Erro ao carregar informações do ambiente', 'error');
      }
    });
  }

  refreshEnvironmentInfo() {
    this.loadEnvironmentInfo();
  }

  downloadEmailTemplate() {
    this.isDownloading = true;
    this.showMessage('Iniciando download do email...', 'info');

    this.authService.downloadEmailTemplate().subscribe({
      next: (blob) => {
        // Criar link para download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `email_reset_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.eml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isDownloading = false;
        this.showMessage('Email baixado com sucesso!', 'success');
      },
      error: (error) => {
        console.error('Erro ao baixar email:', error);
        this.isDownloading = false;
        this.showMessage('Erro ao baixar email. Verifique se há emails disponíveis.', 'error');
      }
    });
  }

  testPasswordReset() {
    if (!this.testEmail) {
      this.showMessage('Digite um email para testar', 'error');
      return;
    }

    this.isTestingReset = true;
    this.showMessage(`Verificando se usuário existe: ${this.testEmail}`, 'info');

    // Primeiro verificar se o usuário existe
    this.authService.checkEmailExists(this.testEmail).subscribe({
      next: (result) => {
        if (result.exists) {
          this.showMessage(`✅ Usuário encontrado! Solicitando reset...`, 'info');
          
          // Se existe, solicitar reset
          const body = { email: this.testEmail };
          
          fetch(`${this.getApiUrl()}/api/user/forgot-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
          .then(response => response.json())
          .then(data => {
            this.isTestingReset = false;
            this.showMessage(`🎉 Reset solicitado com sucesso! Agora baixe o email para ver o link.`, 'success');
          })
          .catch(error => {
            console.error('Erro ao testar reset:', error);
            this.isTestingReset = false;
            this.showMessage('Erro ao solicitar reset de senha', 'error');
          });
        } else {
          this.isTestingReset = false;
          this.showMessage(`❌ Usuário não encontrado: ${this.testEmail}`, 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao verificar email:', error);
        this.isTestingReset = false;
        this.showMessage('Erro ao verificar se usuário existe', 'error');
      }
    });
  }

  testSmtpConnection() {
    this.isTestingSmtp = true;
    this.showMessage('Testando conexão SMTP...', 'info');

    this.authService.testSmtpConnection().subscribe({
      next: (result) => {
        this.isTestingSmtp = false;
        if (result.success) {
          this.showMessage(`✅ ${result.message}`, 'success');
        } else {
          this.showMessage(`❌ ${result.message}`, 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao testar SMTP:', error);
        this.isTestingSmtp = false;
        this.showMessage('Erro ao testar conexão SMTP', 'error');
      }
    });
  }

  sendTestEmail() {
    if (!this.testEmail) {
      this.showMessage('Digite um email para enviar o teste', 'error');
      return;
    }

    this.isSendingTestEmail = true;
    this.showMessage(`Enviando email de teste para: ${this.testEmail}`, 'info');

    this.authService.sendTestEmail(this.testEmail).subscribe({
      next: (result) => {
        this.isSendingTestEmail = false;
        if (result.success) {
          this.showMessage(`🎉 ${result.message}`, 'success');
        } else {
          this.showMessage(`❌ ${result.message}`, 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao enviar email de teste:', error);
        this.isSendingTestEmail = false;
        this.showMessage('Erro ao enviar email de teste', 'error');
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.lastAction = message;
    this.lastActionType = type;
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => {
      this.lastAction = '';
    }, 5000);
  }
}
