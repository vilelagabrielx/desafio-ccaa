import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './components/auth/auth.component';
import { AuthService } from './services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, AuthComponent],
  template: `
    <div class="app-container">
      <!-- Header com autenticação -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">📚</span>
            <h1>CCAA Books</h1>
          </div>
          
          <!-- Navegação condicional baseada na autenticação -->
          <nav class="nav-menu" *ngIf="isAuthenticated$ | async">
            <a routerLink="/books" class="nav-link">Livros</a>
            <a routerLink="/profile" class="nav-link">Perfil</a>
          </nav>
          
          <div class="auth-section">
            <app-auth></app-auth>
          </div>
        </div>
      </header>

      <!-- Conteúdo principal -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>&copy; 2024 Desafio CCAA. Todos os direitos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, #F06292 0%, #2196F3 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .logo h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .auth-section {
      display: flex;
      align-items: center;
    }

    .app-main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .app-footer {
      background: #f8f9fa;
      text-align: center;
      padding: 2rem;
      margin-top: auto;
      border-top: 1px solid #e9ecef;
    }

    .app-footer p {
      margin: 0;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .nav-menu {
        gap: 1rem;
      }

      .app-main {
        padding: 1rem;
      }
    }
  `]
})
export class App {
  isAuthenticated$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }
}
