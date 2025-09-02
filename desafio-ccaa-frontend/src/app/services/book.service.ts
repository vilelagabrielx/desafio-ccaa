import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBookService, BookSearchParams, BookSearchResult } from './book.interface';
import { BookMockService } from './book-mock.service';
import { BookApiService } from './book-api.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interface para resposta da API de busca por ISBN
export interface BookFromIsbnResponse {
  title: string;
  isbn: string;
  genre: string;
  author: string;
  publisher: string;
  synopsis: string;
  summary: string;
  coverUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService implements IBookService {
  private service: IBookService;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    if (environment.services.useMock) {
      console.log('📚 Usando serviço MOCK para desenvolvimento');
      this.service = new BookMockService();
      this.apiUrl = environment.api.baseUrl;
    } else {
      console.log('🌐 Usando serviço API para produção');
      this.service = new BookApiService(this.http);
      this.apiUrl = environment.api.baseUrl;
    }
  }

  private getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  // Implementação dos métodos delegando para o serviço escolhido
  getAllBooks() {
    return this.service.getAllBooks();
  }

  getBookById(id: number) {
    return this.service.getBookById(id);
  }

  createBook(book: any) {
    return this.service.createBook(book);
  }

  updateBook(id: number, updates: any) {
    return this.service.updateBook(id, updates);
  }

  deleteBook(id: number) {
    return this.service.deleteBook(id);
  }

  getAllCategories() {
    return this.service.getAllCategories();
  }

  getMyCategories() {
    return this.service.getMyCategories();
  }

  searchBooks(query: string) {
    return this.service.searchBooks(query);
  }

  searchBooksAdvanced(params: BookSearchParams): Observable<BookSearchResult> {
    return this.service.searchBooksAdvanced(params);
  }

  getBooksByCategory(category: string) {
    return this.service.getBooksByCategory(category);
  }

  /**
   * Gera relatório PDF dos livros do usuário
   */
  generatePdfReport(): Observable<Blob> {
    const url = `${this.apiUrl}/api/book/report/pdf`;
    return this.http.get(url, { 
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Cria um novo livro via API
   */
  createBookApi(bookData: any, photoFile?: File): Observable<any> {
    const url = `${this.apiUrl}/api/book`;
    const formData = new FormData();
    
    // Adicionar dados do livro
    Object.keys(bookData).forEach(key => {
      formData.append(key, bookData[key]);
    });
    
    // Adicionar arquivo de foto se existir
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    return this.http.post(url, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Atualiza um livro existente via API
   */
  updateBookApi(bookId: number, bookData: any, photoFile?: File): Observable<any> {
    const url = `${this.apiUrl}/api/book/${bookId}`;
    const formData = new FormData();
    
    // Adicionar dados do livro
    Object.keys(bookData).forEach(key => {
      formData.append(key, bookData[key]);
    });
    
    // Adicionar arquivo de foto se existir
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    return this.http.put(url, formData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Exclui um livro via API
   */
  deleteBookApi(bookId: number): Observable<any> {
    const url = `${this.apiUrl}/api/book/${bookId}`;
    return this.http.delete(url, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Busca livro por ISBN na API do OpenLibrary
   */
  searchBookByIsbn(isbn: string): Observable<{data: BookFromIsbnResponse}> {
    const url = `${this.apiUrl}/api/book/search-isbn/${isbn}`;
    return this.http.get<{data: BookFromIsbnResponse}>(url, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Cria um livro diretamente a partir do ISBN
   */
  createBookFromIsbn(isbn: string, downloadCover: boolean = true): Observable<any> {
    const url = `${this.apiUrl}/api/book/create-from-isbn`;
    const data = {
      isbn: isbn,
      downloadCover: downloadCover
    };
    return this.http.post(url, data, {
      headers: this.getAuthHeaders()
    });
  }
}
