import { Routes } from '@angular/router';
import { LoginComponent } from './components';
import { BookCatalog } from './components/book-catalog/book-catalog';
import { AuthGuard, GuestGuard } from './services/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ResetPasswordTokenComponent } from './components/reset-password-token/reset-password-token.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  // Rota raiz - redireciona para catálogo (protegida)
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  },

  // Rotas públicas (apenas para usuários NÃO autenticados)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'reset-password-token',
    component: ResetPasswordTokenComponent,
    canActivate: [GuestGuard]
  },
  
  // Rota de acesso negado (acessível por todos)
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },

  // Rotas protegidas (requerem autenticação)
  {
    path: 'books',
    component: BookCatalog,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  // Rota de fallback - redireciona para login se não autenticado
  {
    path: '**',
    redirectTo: '/login'
  }
];
