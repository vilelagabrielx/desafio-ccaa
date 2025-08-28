import { Component, signal } from '@angular/core';
import { BookCatalog } from './components/book-catalog/book-catalog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookCatalog],
  template: `
    <app-book-catalog></app-book-catalog>
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('CCAA Books - Catálogo de Livros');
}
