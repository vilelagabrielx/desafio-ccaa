import { Routes } from '@angular/router';
import { LoginComponent, CallbackComponent } from './components';
import { BookCatalog } from './components/book-catalog/book-catalog';
import { AuthGuard } from './services/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  // Rota raiz - redireciona para catálogo (protegida)
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  },

  // Rotas públicas (não requerem autenticação)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
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
