import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class]="'toast-' + toast.type"

      >
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="toast.type === 'success'">✅</span>
            <span *ngIf="toast.type === 'error'">❌</span>
            <span *ngIf="toast.type === 'warning'">⚠️</span>
            <span *ngIf="toast.type === 'info'">ℹ️</span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button class="toast-close" (click)="removeToast(toast.id)">
            <span>×</span>
          </button>
        </div>
        <div class="toast-progress" [style.animation-duration]="(toast.duration || 5000) + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      position: relative;
      animation: slideIn 0.3s ease-out;
    }

    .toast-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #333;
    }

    .toast-progress {
      height: 3px;
      background: #e0e0e0;
      position: relative;
      overflow: hidden;
    }

    .toast-progress::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      animation: progress 5s linear;
    }

    .toast-success {
      border-left: 4px solid #4caf50;
    }

    .toast-success .toast-progress::after {
      background: #4caf50;
    }

    .toast-error {
      border-left: 4px solid #f44336;
    }

    .toast-error .toast-progress::after {
      background: #f44336;
    }

    .toast-warning {
      border-left: 4px solid #ff9800;
    }

    .toast-warning .toast-progress::after {
      background: #ff9800;
    }

    .toast-info {
      border-left: 4px solid #2196f3;
    }

    .toast-info .toast-progress::after {
      background: #2196f3;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: number): void {
    this.toastService.removeToast(id);
  }
}
