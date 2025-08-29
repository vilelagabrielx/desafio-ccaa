import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from './environments/environment';

export const authConfig: AuthConfig = {
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: {
    redirect_uri: environment.auth0.redirectUri,
    audience: environment.auth0.audience || `https://${environment.auth0.domain}/api/v2/`,
    scope: environment.auth0.scope
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  // Configurações adicionais para melhor experiência
  skipRedirectCallback: false,
  errorPath: '/login'
};
