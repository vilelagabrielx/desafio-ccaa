import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, LocalUser } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <div class="header">
          <h1>👤 Meu Perfil</h1>
          <p>Informações da sua conta</p>
        </div>

        <div *ngIf="userProfile$ | async as user" class="profile-info">
          <div class="profile-avatar">
            <img 
              *ngIf="user.picture" 
              [src]="user.picture" 
              [alt]="user.name"
              class="avatar">
            <div *ngIf="!user.picture" class="avatar-placeholder">
              {{ user.fullName.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Nome:</label>
              <span>{{ user.fullName }}</span>
            </div>

            <div class="info-item">
              <label>E-mail:</label>
              <span>{{ user.email }}</span>
            </div>

            <div class="info-item">
              <label>Data de Criação:</label>
              <span>{{ user.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="info-item">
              <label>Status:</label>
              <span [class]="user.isActive ? 'verified' : 'not-verified'">
                {{ user.isActive ? '✅ Ativo' : '❌ Inativo' }}
              </span>
            </div>

            <div class="info-item">
              <label>ID do Usuário:</label>
              <span class="user-id">{{ user.id }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button 
              routerLink="/" 
              class="btn btn-primary">
              <i class="fas fa-home"></i>
              Voltar ao Início
            </button>
            
            <button 
              (click)="logout()" 
              class="btn btn-logout">
              <i class="fas fa-sign-out-alt"></i>
              Sair
            </button>
          </div>
        </div>

        <div *ngIf="!(userProfile$ | async)" class="loading">
          <p>Carregando perfil...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: calc(100vh - 200px);
      padding: 2rem 1rem;
    }

    .profile-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 600px;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
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

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-avatar {
      text-align: center;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #007bff;
    }

    .avatar-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0 auto;
      border: 4px solid #007bff;
    }

    .info-grid {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .info-item label {
      font-weight: 600;
      color: #333;
      min-width: 150px;
    }

    .info-item span {
      color: #666;
      text-align: right;
      word-break: break-all;
    }

    .verified {
      color: #28a745 !important;
    }

    .not-verified {
      color: #dc3545 !important;
    }

    .user-id {
      font-family: monospace;
      font-size: 0.9rem;
      background-color: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #f8f9fa;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
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

    .btn-logout {
      background-color: #dc3545;
      color: white;
    }

    .btn-logout:hover {
      background-color: #c82333;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-card {
        padding: 1.5rem;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .info-item label {
        min-width: auto;
      }

      .info-item span {
        text-align: left;
      }

      .profile-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  userProfile$: Observable<LocalUser | null>;

  constructor(private authService: AuthService) {
    this.userProfile$ = this.authService.getUserProfile();
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}
