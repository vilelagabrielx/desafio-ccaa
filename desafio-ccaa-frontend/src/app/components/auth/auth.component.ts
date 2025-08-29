import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <!-- Estado de carregamento -->
      <div *ngIf="isLoading$ | async" class="loading">
        <span>Carregando...</span>
      </div>

      <!-- Usuário não autenticado -->
      <div *ngIf="!(isAuthenticated$ | async) && !(isLoading$ | async)" class="not-authenticated">
        <div class="auth-options">
          <button 
            routerLink="/login" 
            class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i>
            Entrar
          </button>
          
          <button 
            routerLink="/register" 
            class="btn btn-secondary">
            <i class="fas fa-user-plus"></i>
            Criar Conta
          </button>
        </div>
      </div>

      <!-- Usuário autenticado -->
      <div *ngIf="isAuthenticated$ | async" class="authenticated">
        <div class="user-info">
          <img 
            *ngIf="(userProfile$ | async)?.picture" 
            [src]="(userProfile$ | async)?.picture" 
            [alt]="(userProfile$ | async)?.name"
            class="user-avatar">
          
          <div class="user-details">
            <span class="user-name">{{ (userProfile$ | async)?.name }}</span>
            <span class="user-email">{{ (userProfile$ | async)?.email }}</span>
            <span *ngIf="(userProfile$ | async)?.dateOfBirth" class="user-dob">
              📅 {{ (userProfile$ | async)?.dateOfBirth | date:'dd/MM/yyyy' }}
            </span>
          </div>
        </div>

        <button 
          (click)="logout()" 
          class="btn btn-logout"
          [disabled]="isLoading$ | async">
          <i class="fas fa-sign-out-alt"></i>
          Sair
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .loading {
      color: #666;
      font-style: italic;
    }

    .not-authenticated {
      display: flex;
      align-items: center;
    }

    .auth-options {
      display: flex;
      gap: 0.5rem;
    }

    .authenticated {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-email {
      font-size: 0.8rem;
      color: #666;
    }

    .user-dob {
      font-size: 0.7rem;
      color: #888;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      text-decoration: none;
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
      background-color: #28a745;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-logout {
      background-color: #dc3545;
      color: white;
    }

    .btn-logout:hover:not(:disabled) {
      background-color: #c82333;
    }

    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        gap: 0.5rem;
      }

      .authenticated {
        flex-direction: column;
        gap: 0.5rem;
      }

      .user-info {
        flex-direction: column;
        text-align: center;
      }

      .auth-options {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AuthComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  userProfile$: Observable<UserProfile | null>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.isLoading$ = this.authService.isLoading();
    this.userProfile$ = this.authService.getUserProfile();
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}
