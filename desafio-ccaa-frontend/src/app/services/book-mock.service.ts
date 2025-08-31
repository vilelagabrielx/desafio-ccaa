import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Book, BookGenre, BookPublisher } from '../models/book.model';
import { translateGenre } from '../utils/genre-translations';
import { IBookService } from './book.interface';

@Injectable()
export class BookMockService implements IBookService {
  private books: Book[] = [
    {
      id: 1,
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      author: 'J.R.R. Tolkien',
      isbn: '9788533613379',
      genre: BookGenre.Fantasy,
      publisher: BookPublisher.Other,
      synopsis: 'A primeira parte da trilogia épica de J.R.R. Tolkien sobre a Terra-média.',
      photoPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNENBRjUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk8gU2VuaG9yIGRvcyBBbsOpaXM8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9IkYuUi5SLiBUb2xraWVuPC90ZXh0Pjwvc3ZnPg==',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isActive: true,
      userId: '1',
      userFullName: 'João Silva'
    },
    {
      id: 2,
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '9788535902778',
      genre: BookGenre.Romance,
      publisher: BookPublisher.Other,
      synopsis: 'Um dos maiores clássicos da literatura brasileira, narrando a história de Bentinho e Capitu.',
      photoPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjE5NkYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvbSBDYXNtdXJybzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TWFjaGFkbyBkZSBBc2lzPC90ZXh0Pjwvc3ZnPg==',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      isActive: true,
      userId: '1',
      userFullName: 'João Silva'
    },
    {
      id: 3,
      title: 'O Poder do Hábito',
      author: 'Charles Duhigg',
      isbn: '9788543102399',
      genre: BookGenre.SelfHelp,
      publisher: BookPublisher.Other,
      synopsis: 'Como transformar hábitos pode transformar sua vida pessoal e profissional.',
      photoPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY5ODAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBvZGVyIGRvIEhhYml0bzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2hhcmxlcyBEdWhpZ2c8L3RleHQ+PC9zdmc+',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      isActive: true,
      userId: '1',
      userFullName: 'João Silva'
    },
    {
      id: 4,
      title: 'Steve Jobs: A Biografia',
      author: 'Walter Isaacson',
      isbn: '9788543102398',
      genre: BookGenre.Biography,
      publisher: BookPublisher.Other,
      synopsis: 'A biografia autorizada de um dos maiores visionários da tecnologia.',
      photoPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEMyN0IwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0ZXZlIEpvYnM8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldhbHRlciBJc2FhY3NvbjwvdGV4dD48L3N2Zz4=',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
      isActive: true,
      userId: '1',
      userFullName: 'João Silva'
    },
    {
      id: 5,
      title: 'Batman: Ano Um',
      author: 'Frank Miller',
      isbn: '9788543102397',
      genre: BookGenre.Fiction,
      publisher: BookPublisher.Other,
      synopsis: 'Uma das mais importantes histórias do Batman, redefinindo a origem do herói.',
      photoPath: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjA3RDhCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhdG1hbiBBbm8gVW08L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZyYW5rIE1pbGxlcjwvdGV4dD48L3N2Zz4=',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      isActive: true,
      userId: '1',
      userFullName: 'João Silva'
    }
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

  // Categories (agora baseado no enum BookGenre)
  getAllCategories(): Observable<{ id: number; name: string; count: number }[]> {
    const categories = Object.values(BookGenre).map((genre, index) => ({
      id: index + 1,
      name: translateGenre(genre), // Traduz para português
      count: this.books.filter(book => book.genre === genre).length
    }));
    return of(categories);
  }

  // Search and Filter
  searchBooks(query: string): Observable<Book[]> {
    const filtered = this.books.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.genre.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    const filtered = this.books.filter(book => book.genre === category);
    return of(filtered);
  }
}
