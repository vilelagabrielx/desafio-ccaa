import { Routes } from '@angular/router';
import { LoginComponent, CallbackComponent } from './components';
import { BookCatalog } from './components/book-catalog/book-catalog';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/book-catalog',
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
    path: 'book-catalog',
    component: BookCatalog
  },
  {
    path: 'home',
    redirectTo: '/book-catalog',
    pathMatch: 'full'
  }
];
