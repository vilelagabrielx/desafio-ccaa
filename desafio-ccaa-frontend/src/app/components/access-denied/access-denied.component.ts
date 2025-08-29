import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-denied-container">
      <div class="content">
        <div class="icon">
          <i class="fas fa-ban"></i>
        </div>
        
        <h1>Acesso Negado</h1>
        
        <p class="message">
          Você não tem permissão para acessar esta página.
        </p>
        
        <p class="subtitle">
          Entre em contato com o administrador se acredita que isso é um erro.
        </p>
        
        <div class="actions">
          <button 
            routerLink="/" 
            class="btn btn-primary">
            <i class="fas fa-home"></i>
            Voltar ao Início
          </button>
          
          <button 
            (click)="goBack()" 
            class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Voltar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .content {
      text-align: center;
      max-width: 500px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .icon {
      font-size: 4rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .message {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    @media (max-width: 768px) {
      .actions {
        flex-direction: column;
      }
      
      .content {
        padding: 1.5rem;
      }
    }
  `]
})
export class AccessDeniedComponent {
  constructor() {}

  goBack(): void {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
}
