import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingState = new BehaviorSubject<LoadingState>({ isLoading: false });
  private loadingCount = 0;

  getLoadingState(): Observable<LoadingState> {
    return this.loadingState.asObservable();
  }

  show(message?: string): void {
    this.loadingCount++;
    this.loadingState.next({ isLoading: true, message });
  }

  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    
    if (this.loadingCount === 0) {
      this.loadingState.next({ isLoading: false });
    }
  }

  showWithMessage(message: string): void {
    this.show(message);
  }

  hideAll(): void {
    this.loadingCount = 0;
    this.loadingState.next({ isLoading: false });
  }

  isLoading(): boolean {
    return this.loadingState.value.isLoading;
  }
}
