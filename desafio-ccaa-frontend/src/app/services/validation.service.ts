import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Validador personalizado para força da senha
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;

      const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
        .filter(Boolean).length;

      if (strength < 3) {
        return { weakPassword: { strength, message: 'Senha muito fraca' } };
      }

      return null;
    };
  }

  /**
   * Validador para confirmar senha
   */
  static confirmPassword(passwordControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      if (control.value !== passwordControl.value) {
        return { passwordMismatch: { message: 'As senhas não coincidem' } };
      }

      return null;
    };
  }

  /**
   * Validador para formato de telefone brasileiro
   */
  static phoneFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
      
      if (!phoneRegex.test(control.value)) {
        return { invalidPhone: { message: 'Formato de telefone inválido' } };
      }

      return null;
    };
  }

  /**
   * Validador para CPF
   */
  static cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const cpf = control.value.replace(/[^\d]/g, '');
      
      if (cpf.length !== 11) {
        return { invalidCpf: { message: 'CPF deve ter 11 dígitos' } };
      }

      if (this.isCpfValid(cpf)) {
        return null;
      }

      return { invalidCpf: { message: 'CPF inválido' } };
    };
  }

  /**
   * Validador para data de nascimento (idade mínima)
   */
  static minimumAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < minAge) {
        return { 
          minimumAge: { 
            message: `Idade mínima é ${minAge} anos`,
            currentAge: age,
            requiredAge: minAge
          } 
        };
      }

      return null;
    };
  }

  /**
   * Validador para formato de e-mail corporativo
   */
  static corporateEmail(domains: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const email = control.value.toLowerCase();
      const domain = email.split('@')[1];

      if (!domains.includes(domain)) {
        return { 
          corporateEmail: { 
            message: `E-mail deve ser de um dos domínios: ${domains.join(', ')}`,
            allowedDomains: domains
          } 
        };
      }

      return null;
    };
  }

  /**
   * Verifica se CPF é válido
   */
  private static isCpfValid(cpf: string): boolean {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cpf.charAt(9)) !== digit1) {
      return false;
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf.charAt(10)) === digit2;
  }

  /**
   * Obtém mensagem de erro personalizada
   */
  getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (!control.errors) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return `${fieldName} é obrigatório`;
    }
    
    if (errors['email']) {
      return 'Formato de e-mail inválido';
    }
    
    if (errors['minlength']) {
      return `${fieldName} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `${fieldName} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['weakPassword']) {
      return errors['weakPassword'].message;
    }
    
    if (errors['passwordMismatch']) {
      return errors['passwordMismatch'].message;
    }
    
    if (errors['invalidPhone']) {
      return errors['invalidPhone'].message;
    }
    
    if (errors['invalidCpf']) {
      return errors['invalidCpf'].message;
    }
    
    if (errors['minimumAge']) {
      return errors['minimumAge'].message;
    }
    
    if (errors['corporateEmail']) {
      return errors['corporateEmail'].message;
    }

    return 'Campo inválido';
  }

  /**
   * Obtém a força da senha
   */
  getPasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) {
      return { score: 0, label: 'Vazio', color: '#ccc' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    switch (strength) {
      case 0:
      case 1:
        return { score: 1, label: 'Muito Fraca', color: '#ff4444' };
      case 2:
        return { score: 2, label: 'Fraca', color: '#ff8800' };
      case 3:
        return { score: 3, label: 'Média', color: '#ffaa00' };
      case 4:
        return { score: 4, label: 'Forte', color: '#00aa00' };
      case 5:
        return { score: 5, label: 'Muito Forte', color: '#008800' };
      default:
        return { score: 0, label: 'Desconhecida', color: '#ccc' };
    }
  }

  /**
   * Formata CPF
   */
  formatCpf(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    
    return cpf;
  }

  /**
   * Formata telefone
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
  }
}
