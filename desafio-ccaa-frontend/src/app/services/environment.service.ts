import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EnvironmentInfo {
  name: string;
  isDevelopment: boolean;
  isUAT: boolean;
  isProduction: boolean;
  isDevelopmentOrUAT: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  constructor() { }

  /**
   * Obtém o nome do ambiente atual
   */
  getEnvironmentName(): string {
    return environment.environment.name;
  }

  /**
   * Verifica se está em ambiente de desenvolvimento
   */
  isDevelopment(): boolean {
    return this.getEnvironmentName() === 'dev' || this.getEnvironmentName() === 'development';
  }

  /**
   * Verifica se está em ambiente UAT
   */
  isUAT(): boolean {
    return this.getEnvironmentName() === 'uat';
  }

  /**
   * Verifica se está em ambiente de produção
   */
  isProduction(): boolean {
    return this.getEnvironmentName() === 'prod' || this.getEnvironmentName() === 'production';
  }

  /**
   * Verifica se está em ambiente de desenvolvimento ou UAT
   */
  isDevelopmentOrUAT(): boolean {
    return this.isDevelopment() || this.isUAT();
  }

  /**
   * Obtém informações completas sobre o ambiente
   */
  getEnvironmentInfo(): EnvironmentInfo {
    return {
      name: this.getEnvironmentName(),
      isDevelopment: this.isDevelopment(),
      isUAT: this.isUAT(),
      isProduction: this.isProduction(),
      isDevelopmentOrUAT: this.isDevelopmentOrUAT()
    };
  }

  /**
   * Obtém informações sobre o ambiente do backend
   */
  getBackendEnvironmentInfo(): Promise<EnvironmentInfo> {
    // Esta função será implementada quando o AuthService for atualizado
    return Promise.resolve(this.getEnvironmentInfo());
  }
}
