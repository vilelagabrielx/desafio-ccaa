import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Book } from '../models/book.model';
import { IBookService } from './book.interface';

@Injectable()
export class BookApiService implements IBookService {
  // 🔧 CONFIGURAÇÃO: Altere a URL base conforme sua API
  private readonly API_BASE_URL = 'https://api.seudominio.com/books'; // Exemplo
  
  // 🔧 CONFIGURAÇÃO: Headers para autenticação (se necessário)
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Descomente se precisar de auth
    })
  };

  constructor(private http: HttpClient) {}

  // CRUD Operations
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.API_BASE_URL, this.httpOptions)
      .pipe(
        catchError(this.handleError<Book[]>('getAllBooks', []))
      );
  }

  getBookById(id: number): Observable<Book | undefined> {
    return this.http.get<Book>(`${this.API_BASE_URL}/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError<Book | undefined>('getBookById', undefined))
      );
  }

  createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Observable<Book> {
    return this.http.post<Book>(this.API_BASE_URL, book, this.httpOptions)
      .pipe(
        catchError(this.handleError<Book>('createBook'))
      );
  }

  updateBook(id: number, updates: Partial<Book>): Observable<Book | undefined> {
    return this.http.put<Book>(`${this.API_BASE_URL}/${id}`, updates, this.httpOptions)
      .pipe(
        catchError(this.handleError<Book | undefined>('updateBook', undefined))
      );
  }

  deleteBook(id: number): Observable<boolean> {
    return this.http.delete(`${this.API_BASE_URL}/${id}`, this.httpOptions)
      .pipe(
        map(() => true),
        catchError(this.handleError<boolean>('deleteBook', false))
      );
  }

  // Categories (baseado no enum BookGenre)
  getAllCategories(): Observable<{ id: number; name: string; count: number }[]> {
    return this.http.get<{ id: number; name: string; count: number }[]>(`${this.API_BASE_URL}/categories`, this.httpOptions)
      .pipe(
        catchError(this.handleError<{ id: number; name: string; count: number }[]>('getAllCategories', []))
      );
  }

  // Search and Filter
  searchBooks(query: string): Observable<Book[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Book[]>(`${this.API_BASE_URL}/search`, { 
      ...this.httpOptions, 
      params 
    })
      .pipe(
        catchError(this.handleError<Book[]>('searchBooks', []))
      );
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    const params = new HttpParams().set('genre', category);
    return this.http.get<Book[]>(`${this.API_BASE_URL}`, { 
      ...this.httpOptions, 
      params 
    })
      .pipe(
        catchError(this.handleError<Book[]>('getBooksByCategory', []))
      );
  }

  // 🔧 MÉTODO AUXILIAR: Tratamento de erros
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // 🔧 CONFIGURAÇÃO: Aqui você pode implementar:
      // - Logging para serviços externos (Sentry, LogRocket, etc.)
      // - Notificações para o usuário
      // - Fallback para dados mock em caso de erro
      
      // Por enquanto, retorna o resultado padrão
      return of(result as T);
    };
  }
}
