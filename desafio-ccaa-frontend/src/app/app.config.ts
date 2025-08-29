import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './services/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    
    // Configuração das rotas
    provideRouter(routes),
    
    // Configuração do HTTP Client com interceptor de autenticação
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ),
    
    // Configuração do Auth0
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: environment.auth0.redirectUri,
        audience: environment.auth0.audience,
        // 🔐 Configurações de verificação de email
        scope: 'openid profile email',
        response_type: 'code',
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      // 📧 Configurações para verificação de email
      skipRedirectCallback: false,
      errorPath: '/callback',
    }),
  ]
};
