import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

export interface IBookService {
  getAllBooks(): Observable<Book[]>;
  getBookById(id: number): Observable<Book | undefined>;
  createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Observable<Book>;
  updateBook(id: number, updates: Partial<Book>): Observable<Book | undefined>;
  deleteBook(id: number): Observable<boolean>;
  getAllCategories(): Observable<{ id: number; name: string; count: number }[]>;
  searchBooks(query: string): Observable<Book[]>;
  getBooksByCategory(category: string): Observable<Book[]>;
}
