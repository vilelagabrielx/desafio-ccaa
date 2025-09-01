import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingService, LoadingState } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingState.isLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <div *ngIf="loadingState.message" class="loading-message">
          {{ loadingState.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      backdrop-filter: blur(2px);
    }

    .loading-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      text-align: center;
      min-width: 200px;
    }

    .loading-spinner {
      margin-bottom: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2196f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    .loading-message {
      color: #333;
      font-size: 16px;
      font-weight: 500;
      margin-top: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .loading-container {
        margin: 20px;
        padding: 24px;
      }
      
      .loading-message {
        font-size: 14px;
      }
    }
  `]
})
export class LoadingComponent implements OnInit, OnDestroy {
  loadingState: LoadingState = { isLoading: false };
  private subscription: Subscription = new Subscription();

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.subscription = this.loadingService.getLoadingState().subscribe(state => {
      this.loadingState = state;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
