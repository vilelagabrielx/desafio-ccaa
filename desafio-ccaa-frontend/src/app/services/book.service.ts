import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBookService } from './book.interface';
import { BookMockService } from './book-mock.service';
import { BookApiService } from './book-api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService implements IBookService {
  private service: IBookService;

  constructor(private http: HttpClient) {
    // 🔧 CONFIGURAÇÃO: Usa configuração de ambiente
    if (environment.services.useMock) {
      console.log('📚 Usando serviço MOCK para desenvolvimento');
      this.service = new BookMockService();
    } else {
      console.log('🌐 Usando serviço API para produção');
      this.service = new BookApiService(this.http);
    }
  }

  // 🔧 MÉTODO AUXILIAR: Para alternar dinamicamente (opcional)
  switchToApi() {
    console.log('🔄 Alternando para serviço API...');
    if (environment.services.fallbackToMock) {
      console.log('⚠️ Fallback para mock habilitado em caso de erro');
    }
    // Implementar lógica para alternar em runtime se necessário
  }

  switchToMock() {
    console.log('🔄 Alternando para serviço MOCK...');
    // Implementar lógica para alternar em runtime se necessário
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

  searchBooks(query: string) {
    return this.service.searchBooks(query);
  }

  getBooksByCategory(category: string) {
    return this.service.getBooksByCategory(category);
  }
}
