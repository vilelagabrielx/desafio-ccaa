import { Routes } from '@angular/router';
import { BookCatalog } from './components/book-catalog/book-catalog';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { CallbackComponent } from './components/callback/callback.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { Auth0SignupComponent } from './components/auth0-signup/auth0-signup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: BookCatalog,
    title: 'Desafio CCAA - Catálogo de Livros'
  },
  {
    path: 'books',
    component: BookCatalog,
    title: 'Desafio CCAA - Catálogo de Livros'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Desafio CCAA - Criar Conta'
  },
  {
    path: 'auth0-signup',
    component: Auth0SignupComponent,
    title: 'Desafio CCAA - Criar Conta Auth0'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Desafio CCAA - Entrar'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Desafio CCAA - Reset de Senha'
  },
  {
    path: 'callback',
    component: CallbackComponent,
    title: 'Desafio CCAA - Autenticando'
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    title: 'Desafio CCAA - Acesso Negado'
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: 'Desafio CCAA - Meu Perfil'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
