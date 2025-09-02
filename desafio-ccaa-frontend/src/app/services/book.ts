import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Book, BookGenre, BookPublisher } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books: Book[] = [
    {
      id: 1,
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      author: 'J.R.R. Tolkien',
      isbn: '9788533613379',
      genre: BookGenre.Fantasy,
      publisher: BookPublisher.Other,
      synopsis: 'A primeira parte da trilogia épica de J.R.R. Tolkien sobre a Terra-média.',
      photoPath: 'https://via.placeholder.com/150x200/4CAF50/FFFFFF?text=Senhor+dos+Aneis',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),

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
      photoPath: 'https://via.placeholder.com/150x200/2196F3/FFFFFF?text=Dom+Casmurro',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),

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
      photoPath: 'https://via.placeholder.com/150x200/FF9800/FFFFFF?text=Poder+do+Habito',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),

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
      photoPath: 'https://via.placeholder.com/150x200/9C27B0/FFFFFF?text=Steve+Jobs',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),

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
      photoPath: 'https://via.placeholder.com/150x200/607D8B/FFFFFF?text=Batman+Ano+Um',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),

      userId: '1',
      userFullName: 'João Silva'
    }
  ];

  constructor() { }

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

  // Categories (baseado no enum BookGenre)
  getAllCategories(): Observable<{ id: number; name: string; count: number }[]> {
    const categories = Object.values(BookGenre).map((genre, index) => ({
      id: index + 1,
      name: genre,
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
