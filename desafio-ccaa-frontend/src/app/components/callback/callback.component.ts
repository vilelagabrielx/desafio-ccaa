import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Autenticando...</p>
        <p class="subtitle">Aguarde enquanto processamos seu login</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .loading-spinner {
      text-align: center;
      padding: 2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e3e3e3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      margin: 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .subtitle {
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class CallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // O Auth0 Angular SDK automaticamente processa o callback
    // e redireciona para a página original ou para a home
    // Este componente é apenas para mostrar o loading
  }
}
