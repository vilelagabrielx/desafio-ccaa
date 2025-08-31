import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Book, BookGenre, BookPublisher } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-catalog.html',
  styleUrl: './book-catalog.scss'
})
export class BookCatalog implements OnInit {
  books = signal<Book[]>([]);
  categories = signal<{ id: number; name: string; count: number }[]>([]);
  filteredBooks = signal<Book[]>([]);
  searchQuery = signal('');
  selectedGenre = signal<string>('');
  selectedPublisher = signal<string>('');
  sortBy = signal<string>('title');
  currentPage = signal(1);
  pageSize = signal(12);
  totalPages = signal(1);

  // User information
  userProfile = signal<any>(null);
  isAuthenticated = signal(false);
  isGeneratingPdf = signal(false);
  
  // Form state
  showAddForm = signal(false);
  selectedCategory = signal('');
  
  // Mobile menu and sidebar
  mobileMenuOpen = signal(false);
  sidebarOpen = signal(false);
  
  // New book form
  newBook = signal({
    title: '',
    author: '',
    isbn: '',
    genre: BookGenre.Fiction,
    publisher: BookPublisher.Other,
    synopsis: '',
    photoPath: ''
  });

  // Computed signals
  categoryCounts = computed(() => {
    const booksList = this.books();
    const categoriesList = this.categories();

    return categoriesList.map(category => ({
      ...category,
      count: booksList.filter(book => book.genre === category.name).length
    }));
  });

  publishers = computed(() => {
    const booksList = this.books();
    return [...new Set(booksList.map(book => book.publisher))].sort();
  });

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 BookCatalog: ngOnInit iniciado');
    
    // Verificar autenticação
    const isAuth = this.authService.isAuthenticated();
    console.log('🔍 BookCatalog: Verificação de autenticação:', isAuth);
    
    if (isAuth) {
      console.log('🔍 BookCatalog: Usuário autenticado, carregando dados...');
      this.isAuthenticated.set(true);
      this.loadBooks();
      this.loadCategories();
      this.loadUserProfile();
    } else {
      console.log('❌ BookCatalog: Usuário não autenticado, redirecionando...');
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    }
  }

  loadUserProfile(): void {
    console.log('🔍 BookCatalog: Carregando perfil do usuário...');
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          console.log('✅ BookCatalog: Perfil carregado:', profile);
          this.userProfile.set(profile);
        } else {
          console.log('⚠️ BookCatalog: Perfil não carregado ainda, mas usuário está autenticado');
        }
      },
      error: (error) => {
        console.error('❌ BookCatalog: Erro ao carregar perfil:', error);
        // Se houver erro ao carregar o perfil, verificar se ainda está autenticado
        if (!this.authService.isAuthenticated()) {
          console.log('❌ BookCatalog: Usuário não está mais autenticado, redirecionando...');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    console.log('🚪 Fazendo logout...');
    
    // Limpar estado local primeiro
    this.isAuthenticated.set(false);
    this.userProfile.set(null);
    
    // Fazer logout via AuthService
    this.authService.logout();
    
    // Redirecionar para login imediatamente
    console.log('🔄 Redirecionando para login...');
    this.router.navigate(['/login']);
  }

  loadBooks(): void {
    console.log('📚 BookCatalog: Carregando livros...');
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        console.log('✅ BookCatalog: Livros carregados:', books.length);
        this.books.set(books);
        this.applyFilters();
      },
      error: (error) => {
        console.error('❌ BookCatalog: Erro ao carregar livros:', error);
      }
    });
  }

  loadCategories(): void {
    console.log('🏷️ BookCatalog: Carregando categorias...');
    this.bookService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('✅ BookCatalog: Categorias carregadas:', categories.length);
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('❌ BookCatalog: Erro ao carregar categorias:', error);
      }
    });
  }

  searchBooks(): void {
    console.log('🔍 BookCatalog: Buscando livros...');
    this.currentPage.set(1);
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.books();
    
    // Aplicar filtro de busca
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      );
    }
    
    // Aplicar filtro de gênero
    if (this.selectedGenre()) {
      filtered = filtered.filter(book => book.genre === this.selectedGenre());
    }
    
    // Aplicar filtro de editora
    if (this.selectedPublisher()) {
      filtered = filtered.filter(book => book.publisher === this.selectedPublisher());
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      const sortBy = this.sortBy();
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'genre':
          return a.genre.localeCompare(b.genre);
        case 'publisher':
          return a.publisher.localeCompare(b.publisher);
        default:
          return 0;
      }
    });
    
    // Aplicar paginação
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const paginatedBooks = filtered.slice(startIndex, endIndex);
    
    this.filteredBooks.set(paginatedBooks);
    this.totalPages.set(Math.ceil(filtered.length / this.pageSize()));
    
    console.log('✅ BookCatalog: Filtros aplicados, livros filtrados:', filtered.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.applyFilters();
    }
  }

  getGenres(): string[] {
    return Object.values(BookGenre);
  }

  getPublishers(): string[] {
    return Object.values(BookPublisher);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedGenre.set('');
    this.selectedPublisher.set('');
    this.sortBy.set('title');
    this.currentPage.set(1);
    this.applyFilters();
  }

  addBook(): void {
    // Implementar adição de livro (por enquanto apenas log)
    console.log('Adicionar novo livro');
  }

  viewBook(book: Book): void {
    // Implementar visualização de livro (por enquanto apenas log)
    console.log('Visualizar livro:', book);
  }

  editBook(book: Book): void {
    // Implementar edição de livro (por enquanto apenas log)
    console.log('Editar livro:', book);
  }

  deleteBook(book: Book): void {
    if (confirm(`Tem certeza que deseja excluir o livro "${book.title}"?`)) {
      console.log('🗑️ Excluindo livro:', book.title);
      
      this.bookService.deleteBookApi(book.id).subscribe({
        next: (response) => {
          console.log('✅ Livro excluído com sucesso:', response);
          
          // Remover o livro da lista local
          const currentBooks = this.books();
          const updatedBooks = currentBooks.filter(b => b.id !== book.id);
          this.books.set(updatedBooks);
          
          // Aplicar filtros para atualizar a lista
          this.applyFilters();
          
          // Mostrar mensagem de sucesso
          alert('Livro excluído com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao excluir livro:', error);
          
          // Mostrar mensagem de erro clara
          let errorMessage = 'Erro ao excluir o livro.';
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.status === 401) {
            errorMessage = 'Você não tem permissão para excluir este livro.';
          } else if (error.status === 404) {
            errorMessage = 'Livro não encontrado.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente.';
          }
          
          alert(`Erro: ${errorMessage}`);
        }
      });
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  /**
   * Filter books by category
   */
  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    // Implementar lógica de filtro se necessário
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showAddForm.set(false);
  }

  /**
   * Save book
   */
  saveBook(): void {
    // Implementar lógica de salvamento
    console.log('Salvando livro:', this.newBook());
    this.closeModal();
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return !!(this.newBook().title && this.newBook().author);
  }

  /**
   * Handle image error
   */
  onImageError(event: any): void {
    console.log('Erro na imagem:', event);
  }

  /**
   * Gera relatório PDF dos livros do usuário
   */
  generatePdfReport(): void {
    if (this.isGeneratingPdf()) return;
    
    this.isGeneratingPdf.set(true);
    console.log('📄 Gerando relatório PDF...');
    
    this.bookService.generatePdfReport().subscribe({
      next: (blob: Blob) => {
        console.log('✅ PDF gerado com sucesso!');
        this.downloadPdf(blob);
        this.isGeneratingPdf.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao gerar PDF:', error);
        this.isGeneratingPdf.set(false);
        // Aqui você pode adicionar uma notificação de erro para o usuário
        alert('Erro ao gerar o relatório PDF. Tente novamente.');
      }
    });
  }

  /**
   * Faz o download do PDF gerado
   */
  private downloadPdf(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-livros-${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    
    // Mensagem de sucesso
    console.log('📄 PDF baixado com sucesso!');
  }
}
