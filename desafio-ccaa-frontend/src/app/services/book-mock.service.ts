import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Book, BookCategory } from '../models/book.model';
import { IBookService } from './book.interface';

@Injectable()
export class BookMockService implements IBookService {
  private books: Book[] = [
    {
      id: 1,
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      author: 'J.R.R. Tolkien',
      isbn: '9788533613379',
      publisher: 'Martins Fontes',
      publicationYear: 2000,
      category: 'Literatura Internacional',
      subcategory: 'Fantasia',
      price: 89.90,
      description: 'A primeira parte da trilogia épica de J.R.R. Tolkien sobre a Terra-média.',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNENBRjUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk8gU2VuaG9yIGRvcyBBbsOpaXM8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkYuUi5SLiBUb2xraWVuPC90ZXh0Pjwvc3ZnPg==',
      stockQuantity: 15,
      isAvailable: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '9788535902778',
      publisher: 'Nova Fronteira',
      publicationYear: 1999,
      category: 'Literatura Brasileira',
      subcategory: 'Romance',
      price: 45.50,
      description: 'Um dos maiores clássicos da literatura brasileira, narrando a história de Bentinho e Capitu.',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjE5NkYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvbSBDYXNtdXJybzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TWFjaGFkbyBkZSBBc2lzPC90ZXh0Pjwvc3ZnPg==',
      stockQuantity: 8,
      isAvailable: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 3,
      title: 'O Poder do Hábito',
      author: 'Charles Duhigg',
      isbn: '9788543102399',
      publisher: 'Objetiva',
      publicationYear: 2012,
      category: 'Autoajuda',
      subcategory: 'Desenvolvimento Pessoal',
      price: 59.90,
      description: 'Como transformar hábitos pode transformar sua vida pessoal e profissional.',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY5ODAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBvZGVyIGRvIEhhYml0bzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2hhcmxlcyBEdWhpZ2c8L3RleHQ+PC9zdmc+',
      stockQuantity: 12,
      isAvailable: true,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: 4,
      title: 'Steve Jobs: A Biografia',
      author: 'Walter Isaacson',
      isbn: '9788543102399',
      publisher: 'Companhia das Letras',
      publicationYear: 2011,
      category: 'Biografias',
      subcategory: 'Empresários',
      price: 79.90,
      description: 'A biografia autorizada de um dos maiores visionários da tecnologia.',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEMyN0IwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0ZXZlIEpvYnM8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldhbHRlciBJc2FhY3NvbjwvdGV4dD48L3N2Zz4=',
      stockQuantity: 6,
      isAvailable: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08')
    },
    {
      id: 5,
      title: 'Batman: Ano Um',
      author: 'Frank Miller',
      isbn: '9788543102399',
      publisher: 'Panini Comics',
      publicationYear: 2005,
      category: 'HQs',
      subcategory: 'Super-heróis',
      price: 69.90,
      description: 'Uma das mais importantes histórias do Batman, redefinindo a origem do herói.',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjA3RDhCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhdG1hbiBBbm8gVW08L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZyYW5rIE1pbGxlcjwvdGV4dD48L3N2Zz4=',
      stockQuantity: 10,
      isAvailable: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  private categories: BookCategory[] = [
    { id: 1, name: 'Literatura Brasileira', subcategories: ['Romance', 'Poesia', 'Contos', 'Teatro'] },
    { id: 2, name: 'Literatura Internacional', subcategories: ['Fantasia', 'Ficção Científica', 'Romance', 'Suspense'] },
    { id: 3, name: 'Infantojuvenis', subcategories: ['Infantil', 'Juvenil', 'Educativo'] },
    { id: 4, name: 'Autoajuda', subcategories: ['Desenvolvimento Pessoal', 'Motivação', 'Psicologia'] },
    { id: 5, name: 'Biografias', subcategories: ['Empresários', 'Artistas', 'Políticos', 'Cientistas'] },
    { id: 6, name: 'HQs', subcategories: ['Super-heróis', 'Mangá', 'Graphic Novel'] },
    { id: 7, name: 'Negócios', subcategories: ['Administração', 'Marketing', 'Finanças', 'Empreendedorismo'] },
    { id: 8, name: 'Novidades', subcategories: ['Lançamentos', 'Pré-venda'] },
    { id: 9, name: 'Mais Vendidos', subcategories: ['Ficção', 'Não-ficção', 'Técnicos'] }
  ];

  // CRUD Operations
  getAllBooks(): Observable<Book[]> {
    return of(this.books);
  }

  getBookById(id: number): Observable<Book | undefined> {
    const book = this.books.find(b => b.id === id);
    return of(book);
  }

  createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Observable<Book> {
    const newBook: Book = {
      ...book,
      id: Math.max(...this.books.map(b => b.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.books.push(newBook);
    return of(newBook);
  }

  updateBook(id: number, updates: Partial<Book>): Observable<Book | undefined> {
    const index = this.books.findIndex(b => b.id === id);
    if (index !== -1) {
      this.books[index] = { ...this.books[index], ...updates, updatedAt: new Date() };
      return of(this.books[index]);
    }
    return of(undefined);
  }

  deleteBook(id: number): Observable<boolean> {
    const index = this.books.findIndex(b => b.id === id);
    if (index !== -1) {
      this.books.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Categories
  getAllCategories(): Observable<BookCategory[]> {
    return of(this.categories);
  }

  // Search and Filter
  searchBooks(query: string): Observable<Book[]> {
    const filtered = this.books.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.category.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    const filtered = this.books.filter(book => book.category === category);
    return of(filtered);
  }
}
