import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth0Service } from '../../services/auth0.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <div class="loading-spinner" *ngIf="!error"></div>
        <div class="error-icon" *ngIf="error">❌</div>
        
        <h2>{{ error ? 'Erro na Autenticação' : 'Autenticando...' }}</h2>
        <p>{{ error ? errorMessage : 'Por favor, aguarde enquanto processamos sua autenticação.' }}</p>
        
        <div *ngIf="error" class="error-actions">
          <button class="btn btn-primary" (click)="retrySync()">
            🔄 Tentar Novamente
          </button>
          <button class="btn btn-secondary" (click)="goToLogin()">
            🔙 Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #F06292 0%, #2196F3 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .callback-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2196F3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    .error-icon {
      font-size: 60px;
      margin: 0 auto 20px;
    }

    h2 {
      color: #424242;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    p {
      color: #757575;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }

    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: #2196F3;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1976D2;
    }

    .btn-secondary {
      background-color: #757575;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #616161;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class CallbackComponent implements OnInit {
  error = false;
  errorMessage = '';
  retryCount = 0;
  maxRetries = 3;

  constructor(
    private authService: AuthService,
    private auth0Service: Auth0Service,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.processAuth0Callback();
  }

  private async processAuth0Callback(): Promise<void> {
    try {
      // Aguardar um pouco para mostrar a tela de loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Obter usuário do Auth0
      const auth0User = await this.auth0Service.getUser();
      
      if (!auth0User) {
        throw new Error('Usuário Auth0 não encontrado');
      }

      // Sincronizar com sistema local
      await this.syncUserWithLocalSystem(auth0User);

      // Redirecionar para página principal
      this.router.navigate(['/']);

    } catch (error) {
      console.error('Erro no callback Auth0:', error);
      this.handleError(error);
    }
  }

  private async syncUserWithLocalSystem(auth0User: any): Promise<void> {
    try {
      // Tentar sincronização completa primeiro
      await this.authService.syncAuth0User(auth0User).toPromise();
      console.log('✅ Usuário sincronizado com sucesso');
      
    } catch (syncError) {
      console.warn('⚠️ Falha na sincronização completa, tentando fallback:', syncError);
      
      // Fallback: garantir que usuário existe
      try {
        await this.authService.ensureUserExists(
          auth0User.email, 
          auth0User.sub
        ).toPromise();
        console.log('✅ Usuário criado via fallback');
        
      } catch (fallbackError) {
        console.error('❌ Falha no fallback:', fallbackError);
        throw new Error('Não foi possível sincronizar usuário com o sistema local');
      }
    }
  }

  private handleError(error: any): void {
    this.error = true;
    this.errorMessage = this.getErrorMessage(error);
    
    // Log do erro para debugging
    console.error('Erro detalhado:', error);
  }

  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    
    if (error.status === 0) {
      return 'Erro de conexão com o servidor. Verifique sua internet.';
    }
    
    if (error.status === 500) {
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }
    
    return 'Erro inesperado na autenticação. Tente novamente.';
  }

  retrySync(): void {
    if (this.retryCount >= this.maxRetries) {
      this.errorMessage = 'Número máximo de tentativas excedido. Tente novamente mais tarde.';
      return;
    }

    this.retryCount++;
    this.error = false;
    this.errorMessage = '';
    
    // Aguardar um pouco antes de tentar novamente
    setTimeout(() => {
      this.processAuth0Callback();
    }, 2000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
