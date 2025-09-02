import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Book, BookGenre, BookPublisher } from '../models/book.model';
import { IBookService, BookSearchParams, BookSearchResult } from './book.interface';
import { environment } from '../../environments/environment';
import { translateGenre } from '../utils/genre-translations';

@Injectable()
export class BookApiService implements IBookService {
  private readonly API_BASE_URL = `${environment.api.baseUrl}/api/book`;
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient) {}

  // CRUD Operations
  getAllBooks(): Observable<Book[]> {
    return this.http.get<{ data: Book[] }>(`${this.API_BASE_URL}/my`, this.httpOptions)
      .pipe(
        map(response => {
          // Garantir que sempre retorne um array válido
          if (response && Array.isArray(response.data)) {
            return response.data;
          }
          console.warn('API retornou formato inesperado para livros:', response);
          return [];
        }),
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
    return this.http.get<{ data: { id: number; name: string; count: number }[] }>(`${this.API_BASE_URL}/categories-with-count`, this.httpOptions)
      .pipe(
        map(response => {
          // Garantir que sempre retorne um array válido
          if (response && Array.isArray(response.data)) {
            // Traduzir os nomes das categorias de inglês para português
            return response.data.map(category => ({
              ...category,
              name: this.translateCategoryName(category.name)
            }));
          }
          console.warn('API retornou formato inesperado para categorias:', response);
          return [];
        }),
        catchError(this.handleError<{ id: number; name: string; count: number }[]>('getAllCategories', []))
      );
  }

  // Categories do usuário logado
  getMyCategories(): Observable<{ id: number; name: string; count: number }[]> {
    return this.http.get<{ data: { id: number; name: string; count: number }[] }>(`${this.API_BASE_URL}/my/categories-with-count`, this.httpOptions)
      .pipe(
        map(response => {
          // Garantir que sempre retorne um array válido
          if (response && Array.isArray(response.data)) {
            // Traduzir os nomes das categorias de inglês para português
            return response.data.map(category => ({
              ...category,
              name: this.translateCategoryName(category.name)
            }));
          }
          console.warn('API retornou formato inesperado para categorias do usuário:', response);
          return [];
        }),
        catchError(this.handleError<{ id: number; name: string; count: number }[]>('getMyCategories', []))
      );
  }

  // Método auxiliar para traduzir nomes de categorias
  private translateCategoryName(englishName: string): string {
    // Mapear nomes em inglês para português
    const translations: { [key: string]: string } = {
      'Fiction': 'Ficção',
      'NonFiction': 'Não Ficção',
      'Mystery': 'Mistério',
      'Romance': 'Romance',
      'ScienceFiction': 'Ficção Científica',
      'Fantasy': 'Fantasia',
      'Horror': 'Terror',
      'Thriller': 'Suspense',
      'Biography': 'Biografia',
      'History': 'História',
      'Science': 'Ciência',
      'Technology': 'Tecnologia',
      'Philosophy': 'Filosofia',
      'Religion': 'Religião',
      'SelfHelp': 'Autoajuda',
      'Business': 'Negócios',
      'Economics': 'Economia',
      'Politics': 'Política',
      'Travel': 'Viagem',
      'Cookbook': 'Culinária',
      'Poetry': 'Poesia',
      'Drama': 'Drama',
      'Other': 'Outro',
      'Todas as Categorias': 'Todas as Categorias'
    };
    
    return translations[englishName] || englishName;
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

  // Advanced Search
  searchBooksAdvanced(params: BookSearchParams): Observable<BookSearchResult> {
    let httpParams = new HttpParams();
    
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.isbn) httpParams = httpParams.set('isbn', params.isbn);
    if (params.author) httpParams = httpParams.set('author', params.author);
    if (params.genre) httpParams = httpParams.set('genre', params.genre);
    if (params.publisher) httpParams = httpParams.set('publisher', params.publisher);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<{ data: BookSearchResult }>(`${this.API_BASE_URL}/search`, { 
      ...this.httpOptions, 
      params: httpParams
    })
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data;
          }
          console.warn('API retornou formato inesperado para busca avançada:', response);
          return {
            books: [],
            totalCount: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0
          };
        }),
        catchError(this.handleError<BookSearchResult>('searchBooksAdvanced', {
          books: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }))
      );
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    const params = new HttpParams().set('genre', category);
    return this.http.get<Book[]>(`${this.API_BASE_URL}/all`, { 
      ...this.httpOptions, 
      params 
    })
      .pipe(
        catchError(this.handleError<Book[]>('getBooksByCategory', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
