import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="password-strength" *ngIf="password">
      <div class="strength-label">
        <span>Força da senha:</span>
        <strong [style.color]="strength.color">{{ strength.label }}</strong>
      </div>
      
      <div class="strength-bars">
        <div 
          *ngFor="let bar of strengthBars; let i = index" 
          class="strength-bar"
          [class]="getBarClass(i)"
        ></div>
      </div>
      
      <div class="strength-tips" *ngIf="strength.score < 4">
        <small>
          <i class="fas fa-lightbulb"></i>
          {{ getStrengthTip() }}
        </small>
      </div>
    </div>
  `,
  styles: [`
    .password-strength {
      margin-top: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .strength-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.85rem;
      color: #666;

      strong {
        font-weight: 600;
      }
    }

    .strength-bars {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: #e0e0e0;
      transition: all 0.3s ease;

      &.weak {
        background: #ff4444;
      }

      &.medium {
        background: #ffaa00;
      }

      &.strong {
        background: #00aa00;
      }

      &.very-strong {
        background: #008800;
      }
    }

    .strength-tips {
      small {
        color: #666;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          color: #ff9800;
        }
      }
    }
  `]
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';
  
  strength = { score: 0, label: '', color: '#ccc' };
  strengthBars = [1, 2, 3, 4, 5];

  constructor(private validationService: ValidationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password'] && this.password) {
      this.strength = this.validationService.getPasswordStrength(this.password);
    }
  }

  getBarClass(index: number): string {
    if (this.strength.score === 0) return '';
    
    if (index < this.strength.score) {
      if (this.strength.score <= 2) return 'weak';
      if (this.strength.score <= 3) return 'medium';
      if (this.strength.score <= 4) return 'strong';
      return 'very-strong';
    }
    
    return '';
  }

  getStrengthTip(): string {
    const tips = [
      'Adicione letras maiúsculas e minúsculas',
      'Inclua números e caracteres especiais',
      'Use pelo menos 8 caracteres',
      'Evite informações pessoais',
      'Use uma senha única para cada conta'
    ];

    if (this.strength.score <= 1) {
      return tips[0] + ', ' + tips[1] + ' e ' + tips[2];
    } else if (this.strength.score <= 2) {
      return tips[1] + ' e ' + tips[2];
    } else if (this.strength.score <= 3) {
      return tips[2];
    }
    
    return tips[3];
  }
}
