import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastMessage[]>([]);
  private nextId = 1;

  getToasts(): Observable<ToastMessage[]> {
    return this.toasts.asObservable();
  }

  showSuccess(message: string, duration: number = 5000): void {
    this.showToast(message, 'success', duration);
  }

  showError(message: string, duration: number = 7000): void {
    this.showToast(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 6000): void {
    this.showToast(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 5000): void {
    this.showToast(message, 'info', duration);
  }

  private showToast(message: string, type: ToastMessage['type'], duration: number): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  removeToast(id: number): void {
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toasts.next([]);
  }
}
