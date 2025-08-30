import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.processAuth0Callback();
  }

  private async processAuth0Callback(): Promise<void> {
    try {
      console.log('🔄 Iniciando processamento do callback Auth0...');
      
      // Aguardar um pouco para o Auth0 estabelecer a sessão
      console.log('⏳ Aguardando Auth0 estabelecer sessão...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se está autenticado
      const isAuthenticated = await firstValueFrom(this.authService.isAuthenticated());
      console.log('🔍 Verificando autenticação após callback:', isAuthenticated);
      
      if (!isAuthenticated) {
        throw new Error('Usuário não foi autenticado após callback');
      }
      
      // Obter usuário do Auth0
      console.log('🔍 Obtendo usuário do Auth0...');
      const auth0User = await this.authService.getAuth0User();
      
      if (!auth0User) {
        throw new Error('Usuário Auth0 não encontrado');
      }
      
      console.log('✅ Usuário Auth0 obtido:', auth0User);

      // Sincronizar com sistema local
      console.log('🔄 Sincronizando com sistema local...');
      await this.syncUserWithLocalSystem(auth0User);

      // Aguardar um pouco para garantir que o estado seja atualizado
      console.log('⏳ Aguardando atualização do estado...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar novamente se está autenticado após sincronização
      const finalAuthCheck = await firstValueFrom(this.authService.isAuthenticated());
      console.log('🔍 Verificação final de autenticação:', finalAuthCheck);
      
      if (!finalAuthCheck) {
        throw new Error('Usuário não está autenticado após sincronização');
      }

      // Verificação final antes do redirecionamento
      const preRedirectCheck = await firstValueFrom(this.authService.isAuthenticated());
      console.log('🔍 Verificação pré-redirecionamento:', preRedirectCheck);
      
      if (!preRedirectCheck) {
        throw new Error('Usuário perdeu autenticação antes do redirecionamento');
      }

      // Verificar se já estamos na rota correta
      const currentUrl = this.router.url;
      console.log('🔍 URL atual:', currentUrl);
      
      if (currentUrl === '/books' || currentUrl === '/book-catalog') {
        console.log('✅ Já estamos na rota correta, não redirecionando');
        return;
      }

      // Redirecionar para o sistema da livraria
      console.log('🚀 Redirecionando para o sistema da livraria...');
      this.router.navigate(['/book-catalog']);

    } catch (error) {
      console.error('❌ Erro no callback Auth0:', error);
      this.handleError(error);
    }
  }

  private async syncUserWithLocalSystem(auth0User: any): Promise<void> {
    try {
      console.log('🔄 Tentando sincronização completa...');
      // Tentar sincronização completa primeiro
      await firstValueFrom(this.authService.syncAuth0User(auth0User));
      console.log('✅ Usuário sincronizado com sucesso');
      
    } catch (syncError) {
      console.warn('⚠️ Falha na sincronização completa, tentando fallback:', syncError);
      console.log('📊 Detalhes do erro de sincronização:', syncError);
      
      // Fallback: garantir que usuário existe
      try {
        console.log('🔄 Tentando fallback - garantir existência do usuário...');
        await firstValueFrom(this.authService.ensureUserExists(
          auth0User.email, 
          auth0User.sub
        ));
        console.log('✅ Usuário criado via fallback');
        
      } catch (fallbackError) {
        console.error('❌ Falha no fallback:', fallbackError);
        console.log('📊 Detalhes do erro de fallback:', fallbackError);
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
