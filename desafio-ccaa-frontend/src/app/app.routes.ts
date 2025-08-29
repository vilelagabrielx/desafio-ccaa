import { Routes } from '@angular/router';
import { LoginComponent, CallbackComponent } from './components';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
