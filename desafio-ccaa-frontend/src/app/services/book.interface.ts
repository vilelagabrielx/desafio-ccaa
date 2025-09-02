import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

export interface BookSearchParams {
  title?: string;
  isbn?: string;
  author?: string;
  genre?: string;
  publisher?: string;
  page?: number;
  pageSize?: number;
}

export interface BookSearchResult {
  books: Book[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IBookService {
  getAllBooks(): Observable<Book[]>;
  getBookById(id: number): Observable<Book | undefined>;
  createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Observable<Book>;
  updateBook(id: number, updates: Partial<Book>): Observable<Book | undefined>;
  deleteBook(id: number): Observable<boolean>;
  getAllCategories(): Observable<{ id: number; name: string; count: number }[]>;
  getMyCategories(): Observable<{ id: number; name: string; count: number }[]>;
  searchBooks(query: string): Observable<Book[]>;
  searchBooksAdvanced(params: BookSearchParams): Observable<BookSearchResult>;
  getBooksByCategory(category: string): Observable<Book[]>;
}
