import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Book, BookGenre, BookPublisher } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { translateGenre, genreTranslations } from '../../utils/genre-translations';
import { translatePublisher } from '../../utils/publisher-translations';

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
  searchCategory = signal('');
  showEditForm = signal(false);
  editingBook = signal<Book | null>(null);
  
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
    summary: '',
    photoPath: ''
  });

  // Photo upload
  selectedPhotoFile = signal<File | null>(null);

  // ISBN sync state
  isSyncingIsbn = signal(false);

  // ISBN creation modal state
  showCreateFromIsbnModalSignal = signal(false);
  isbnToCreate = signal('');
  downloadCover = signal(true);
  isCreatingFromIsbn = signal(false);

  // Book details modal state
  showBookDetailsModalSignal = signal(false);
  selectedBookForDetails = signal<Book | null>(null);

  // Computed signals
  categoryCounts = computed(() => {
    const categoriesList = this.categories();
    console.log('📊 BookCatalog: categoryCounts computado:', categoriesList.length, 'categorias');
    // Ordenar categorias por contagem de livros em ordem decrescente
    return categoriesList.sort((a, b) => b.count - a.count);
  });

  publishers = computed(() => {
    const booksList = this.books();
    return [...new Set(booksList.map(book => book.publisher))].sort();
  });

  // Métodos para tradução
  getGenreTranslation(genre: BookGenre): string {
    return translateGenre(genre);
  }

  getPublisherTranslation(publisher: BookPublisher): string {
    return translatePublisher(publisher);
  }

  // Obter todos os gêneros traduzidos para o select
  getTranslatedGenres(): { value: BookGenre; label: string }[] {
    return Object.values(BookGenre).map(genre => ({
      value: genre,
      label: translateGenre(genre)
    }));
  }

  // Obter todas as editoras traduzidas para o select
  getTranslatedPublishers(): { value: BookPublisher; label: string }[] {
    return Object.values(BookPublisher).map(publisher => ({
      value: publisher,
      label: translatePublisher(publisher)
    }));
  }

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
        
        // Validar e filtrar livros com IDs válidos
        const validBooks = books.filter(book => {
          if (!book || typeof book.id === 'undefined' || book.id === null) {
            console.warn('⚠️ Livro inválido encontrado:', book);
            return false;
          }
          
          // Garantir que o ID seja um número
          if (typeof book.id === 'string') {
            const numId = parseInt(book.id, 10);
            if (isNaN(numId)) {
              console.warn('⚠️ ID do livro não é um número válido:', book.id);
              return false;
            }
            // Converter ID string para number
            book.id = numId;
          }
          
          return true;
        });
        
        console.log('✅ BookCatalog: Livros válidos:', validBooks.length);
        this.books.set(validBooks);
        this.applyFilters();
      },
      error: (error) => {
        console.error('❌ BookCatalog: Erro ao carregar livros:', error);
        // Em caso de erro, definir lista vazia para evitar problemas
        this.books.set([]);
        this.filteredBooks.set([]);
      }
    });
  }

  loadCategories(): void {
    console.log('🏷️ BookCatalog: Carregando categorias...');
    this.bookService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('✅ BookCatalog: Categorias carregadas:', categories.length);
        console.log('🔍 Debug - Categorias recebidas do backend:', categories);
        
        // Garantir que a ordem do backend seja mantida
        // O backend já retorna ordenado por contagem decrescente
        const orderedCategories = [...categories];
        console.log('📊 Categorias ordenadas por contagem:', orderedCategories.map(c => `${c.name} (${c.count})`));
        
        this.categories.set(orderedCategories);
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
    const allBooks = this.books();
    console.log('🔍 BookCatalog: Aplicando filtros em', allBooks.length, 'livros');
    
    // Validar livros antes de aplicar filtros
    const validBooks = allBooks.filter(book => {
      if (!book) {
        console.warn('⚠️ Livro nulo encontrado durante filtragem');
        return false;
      }
      
      if (!book.id || !book.title || !book.author || !book.isbn) {
        console.warn('⚠️ Livro com dados incompletos encontrado durante filtragem:', book);
        return false;
      }
      
      return true;
    });
    
    console.log('✅ BookCatalog: Livros válidos para filtragem:', validBooks.length);
    
    let filtered = [...validBooks];
    
    // Aplicar filtro de busca
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      const beforeSearch = filtered.length;
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      );
      console.log('🔍 BookCatalog: Filtro de busca aplicado:', beforeSearch, '->', filtered.length);
    }
    
    // Aplicar filtro de gênero
    if (this.selectedGenre()) {
      const beforeGenre = filtered.length;
      filtered = filtered.filter(book => book.genre === this.selectedGenre());
      console.log('🔍 BookCatalog: Filtro de gênero aplicado:', beforeGenre, '->', filtered.length);
    }
    
    // Aplicar filtro de editora
    if (this.selectedPublisher()) {
      const beforePublisher = filtered.length;
      filtered = filtered.filter(book => book.publisher === this.selectedPublisher());
      console.log('🔍 BookCatalog: Filtro de editora aplicado:', beforePublisher, '->', filtered.length);
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
    
    console.log('✅ BookCatalog: Filtros aplicados, livros filtrados:', filtered.length, 'páginas:', this.totalPages());
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
    console.log('🔍 Debug addBook: Iniciando adição de novo livro');
    
    // Limpar o formulário
    this.newBook.set({
      title: '',
      author: '',
      isbn: '',
      genre: BookGenre.Fiction, // Usar valor padrão válido
      publisher: BookPublisher.Other, // Usar valor padrão válido
      synopsis: '',
      summary: '',
      photoPath: ''
    });
    
    // Limpar foto selecionada
    this.selectedPhotoFile.set(null);
    
    // Mostrar o modal de adição
    this.showAddForm.set(true);
    
    console.log('✅ Debug addBook: Formulário limpo e modal aberto');
  }

  viewBook(book: Book): void {
    console.log('🔍 Debug viewBook - Livro recebido:', book);
    
    // Validação básica do objeto livro
    if (!book) {
      console.error('❌ Erro: Objeto livro é nulo ou indefinido');
      alert('Erro: Dados do livro inválidos. Tente recarregar a página.');
      return;
    }
    
    // Validação do ID do livro
    if (!book.id || (typeof book.id === 'string' && isNaN(parseInt(book.id, 10)))) {
      console.error('❌ Erro: ID do livro é inválido:', book.id);
      alert('Erro: ID do livro inválido. Tente recarregar a página.');
      return;
    }
    
    console.log('✅ Visualizando livro:', book.title, 'ID:', book.id);
    // TODO: Implementar visualização detalhada do livro
  }

  editBook(book: Book): void {
    console.log('🔍 Debug editBook - Livro recebido:', book);
    
    // Validação básica do objeto livro
    if (!book) {
      console.error('❌ Erro: Objeto livro é nulo ou indefinido');
      alert('Erro: Dados do livro inválidos. Tente recarregar a página.');
      return;
    }
    
    // Validação do ID do livro
    if (!book.id || (typeof book.id === 'string' && isNaN(parseInt(book.id, 10)))) {
      console.error('❌ Erro: ID do livro é inválido:', book.id);
      alert('Erro: ID do livro inválido. Tente recarregar a página.');
      return;
    }
    
    // Validação dos campos obrigatórios
    if (!book.title || !book.author || !book.isbn) {
      console.error('❌ Erro: Campos obrigatórios do livro estão vazios:', book);
      alert('Erro: Dados do livro incompletos. Tente recarregar a página.');
      return;
    }
    
    console.log('✅ Editando livro:', book.title, 'ID:', book.id);
    
    // Abrir modal de edição
    this.editingBook.set(book);
    this.showEditForm.set(true);
    
    // Preencher o formulário com os dados do livro
    this.newBook.set({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      publisher: book.publisher,
      synopsis: book.synopsis,
      summary: book.summary || '',
      photoPath: book.photoPath || ''
    });
    
    // Limpar foto selecionada
    this.selectedPhotoFile.set(null);
  }

  deleteBook(book: Book): void {
    console.log('🔍 Debug deleteBook - Livro recebido:', book);
    
    // Validação básica do objeto livro
    if (!book) {
      console.error('❌ Erro: Objeto livro é nulo ou indefinido');
      alert('Erro: Dados do livro inválidos. Tente recarregar a página.');
      return;
    }
    
    console.log('🔍 Debug deleteBook - ID do livro:', book.id);
    console.log('🔍 Debug deleteBook - Tipo do ID:', typeof book.id);
    
    // Converter ID para number se necessário
    let bookId: number;
    if (typeof book.id === 'string') {
      bookId = parseInt(book.id, 10);
    } else if (typeof book.id === 'number') {
      bookId = book.id;
    } else {
      console.error('❌ Erro: ID do livro tem tipo inválido:', typeof book.id);
      alert('Erro: ID do livro inválido. Tente recarregar a página.');
      return;
    }
    
    console.log('🔍 Debug deleteBook - ID convertido:', bookId);
    
    if (!bookId || isNaN(bookId) || bookId <= 0) {
      console.error('❌ Erro: ID do livro é inválido:', bookId);
      alert('Erro: ID do livro não encontrado. Tente recarregar a página.');
      return;
    }
    
    // Validação do título do livro
    if (!book.title || book.title.trim() === '') {
      console.error('❌ Erro: Título do livro é inválido:', book.title);
      alert('Erro: Título do livro inválido. Tente recarregar a página.');
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o livro "${book.title}"?`)) {
      console.log('🗑️ Excluindo livro:', book.title, 'ID:', bookId);
      
      this.bookService.deleteBookApi(bookId).subscribe({
        next: (response) => {
          console.log('✅ Livro excluído com sucesso:', response);
          
          // Remover o livro da lista local
          const currentBooks = this.books();
          const updatedBooks = currentBooks.filter(b => b.id !== bookId);
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
    
    // Se uma categoria específica foi selecionada, mapear para o enum e aplicar filtro
    if (category && category !== '' && category !== 'Todas as Categorias') {
      // Mapear o nome traduzido de volta para o enum
      const genreEnum = this.mapCategoryNameToGenre(category);
      if (genreEnum) {
        this.selectedGenre.set(genreEnum);
        console.log('🔍 Filtro aplicado: categoria', category, '-> gênero', genreEnum);
      }
    } else {
      // Limpar filtros se "Todas as Categorias" foi selecionado
      this.selectedGenre.set('');
      console.log('🔍 Filtros limpos: exibindo todas as categorias');
    }
    
    // Aplicar os filtros
    this.applyFilters();
  }

  /**
   * Mapeia o nome da categoria traduzida de volta para o enum BookGenre
   */
  private mapCategoryNameToGenre(categoryName: string): BookGenre | '' {
    if (!categoryName) return '';
    
    // Buscar o enum correspondente ao nome traduzido
    const genreEntry = Object.entries(genreTranslations).find(
      ([_, translation]) => translation === categoryName
    );
    
    if (genreEntry) {
      return genreEntry[0] as BookGenre;
    }
    
    // Se não encontrar, tentar buscar por comparação case-insensitive
    const genreEntryCaseInsensitive = Object.entries(genreTranslations).find(
      ([_, translation]) => translation.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (genreEntryCaseInsensitive) {
      return genreEntryCaseInsensitive[0] as BookGenre;
    }
    
    console.warn('⚠️ Categoria não reconhecida:', categoryName);
    return '';
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showAddForm.set(false);
    this.resetForm();
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.showEditForm.set(false);
    this.editingBook.set(null);
    this.resetForm();
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.newBook.set({
      title: '',
      author: '',
      isbn: '',
      genre: BookGenre.Fiction,
      publisher: BookPublisher.Other,
      synopsis: '',
      summary: '',
      photoPath: ''
    });
    this.selectedPhotoFile.set(null);
  }

  // Photo upload methods
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedPhotoFile.set(file);
      console.log('📸 Foto selecionada:', file.name, 'Tamanho:', this.formatFileSize(file.size));
    } else {
      console.error('❌ Arquivo inválido selecionado');
      this.selectedPhotoFile.set(null);
    }
  }

  removePhoto(): void {
    this.selectedPhotoFile.set(null);
    this.newBook.update(book => ({ ...book, photoPath: '' }));
  }

  getPhotoPreview(): string {
    // Priorizar arquivo selecionado pelo usuário
    if (this.selectedPhotoFile()) {
      return URL.createObjectURL(this.selectedPhotoFile()!);
    }
    
    // Fallback para URL da foto sincronizada ou campo photoPath
    if (this.newBook().photoPath) {
      return this.newBook().photoPath;
    }
    
    // Imagem padrão se não houver foto
    return 'assets/images/default-book-cover.svg';
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Save book (create or update)
   */
  saveBook(): void {
    if (!this.isFormValid()) {
      console.error('❌ Formulário inválido');
      return;
    }

    // Validate ISBN before proceeding
    const isbnValidation = this.validateIsbn(this.newBook().isbn);
    if (!isbnValidation.isValid) {
      this.showValidationError(isbnValidation.message);
      return;
    }

    const isEditing = this.editingBook() !== null;
    const bookData = this.newBook();
    const photoFile = this.selectedPhotoFile();

    if (isEditing) {
      // Atualizar livro existente
      const bookId = this.editingBook()!.id;
      console.log('📚 Atualizando livro:', bookId, bookData);
      
      this.bookService.updateBookApi(bookId, bookData, photoFile).subscribe({
        next: (response) => {
          console.log('✅ Livro atualizado com sucesso:', response);
          this.loadBooks(); // Recarregar lista de livros
          this.closeEditModal();
          alert('Livro atualizado com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar livro:', error);
          
          // Tratamento específico para diferentes tipos de erro
          let errorMessage = 'Erro ao atualizar livro. Tente novamente.';
          
          if (error.error && error.error.error) {
            // Erro retornado pelo backend
            errorMessage = error.error.error;
            
            // Check for specific ISBN duplicate error
            if (error.error.error.includes('ISBN') && error.error.error.includes('existe')) {
              this.showIsbnDuplicateError(this.newBook().isbn);
              return; // Don't show the generic error message
            }
          } else if (error.error && error.error.message) {
            // Erro com estrutura diferente
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Dados inválidos. Verifique as informações do livro.';
          } else if (error.status === 401) {
            errorMessage = 'Você não tem permissão para atualizar este livro.';
          } else if (error.status === 404) {
            errorMessage = 'Livro não encontrado.';
          } else if (error.status === 409) {
            errorMessage = 'Já existe um livro com este ISBN. Por favor, use um ISBN diferente.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente.';
          }
          
          alert(`Erro: ${errorMessage}`);
        }
      });
    } else {
      // Criar novo livro
      console.log('📚 Salvando livro:', bookData);
      console.log('📸 Foto selecionada:', photoFile);

      this.bookService.createBookApi(bookData, photoFile).subscribe({
        next: (response) => {
          console.log('✅ Livro criado com sucesso:', response);
          this.loadBooks(); // Recarregar lista de livros
          this.closeModal();
          alert('Livro criado com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao criar livro:', error);
          
          // Tratamento específico para diferentes tipos de erro
          let errorMessage = 'Erro ao criar livro. Tente novamente.';
          
          if (error.error && error.error.error) {
            // Erro retornado pelo backend
            errorMessage = error.error.error;
            
            // Check for specific ISBN duplicate error
            if (error.error.error.includes('ISBN') && error.error.error.includes('existe')) {
              this.showIsbnDuplicateError(this.newBook().isbn);
              return; // Don't show the generic error message
            }
          } else if (error.error && error.error.message) {
            // Erro com estrutura diferente
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Dados inválidos. Verifique as informações do livro.';
          } else if (error.status === 401) {
            errorMessage = 'Você não tem permissão para criar livros.';
          } else if (error.status === 409) {
            errorMessage = 'Já existe um livro com este ISBN. Por favor, use um ISBN diferente.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente.';
          }
          
          alert(`Erro: ${errorMessage}`);
        }
      });
    }
  }

  /**
   * Check ISBN availability when user types
   */
  onIsbnInput(): void {
    // Check ISBN in the main form
    const isbn = this.newBook().isbn;
    if (isbn && isbn.trim()) {
      const validation = this.validateIsbn(isbn);
      if (!validation.isValid) {
        console.warn('⚠️ ISBN inválido:', validation.message);
      }
    }
    
    // Check ISBN in the create from ISBN modal
    const modalIsbn = this.isbnToCreate();
    if (modalIsbn && modalIsbn.trim()) {
      // Basic format validation for modal ISBN
      const cleanIsbn = modalIsbn.replace(/[-\s]/g, '');
      if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
        console.warn('⚠️ ISBN do modal inválido: deve ter 10 ou 13 dígitos');
      }
    }
  }

  /**
   * Get ISBN validation status for display
   */
  getIsbnValidationStatus(): { isValid: boolean; message: string; show: boolean } {
    const isbn = this.newBook().isbn;
    if (!isbn || !isbn.trim()) {
      return { isValid: true, message: '', show: false };
    }
    
    const validation = this.validateIsbn(isbn);
    return {
      isValid: validation.isValid,
      message: validation.message,
      show: true
    };
  }

  /**
   * Sincroniza dados do livro a partir do ISBN
   */
  syncIsbn(): void {
    const isbn = this.newBook().isbn;
    
    console.log('🔍 Debug syncIsbn - ISBN recebido:', isbn);
    console.log('🔍 Debug syncIsbn - Tipo do ISBN:', typeof isbn);
    console.log('🔍 Debug syncIsbn - ISBN vazio?', !isbn);
    console.log('🔍 Debug syncIsbn - ISBN trim vazio?', isbn ? !isbn.trim() : true);
    
    if (!isbn) {
      alert('Por favor, insira um ISBN válido.');
      return;
    }

    // Validação adicional para ISBN vazio após trim
    if (typeof isbn === 'string' && !isbn.trim()) {
      alert('Por favor, insira um ISBN válido (não pode ser apenas espaços).');
      return;
    }

    this.isSyncingIsbn.set(true);
    console.log('🔄 Sincronizando ISBN:', isbn);

    this.bookService.searchBookByIsbn(isbn).subscribe({
      next: (response) => {
        console.log('✅ Dados do ISBN sincronizados:', response);
        
        if (response.data) {
          const bookData = response.data;
          
          console.log('🔍 Debug - Dados recebidos do backend:', bookData);
          console.log('🔍 Debug - Genre recebido:', bookData.genre, 'Tipo:', typeof bookData.genre);
          console.log('🔍 Debug - Publisher recebido:', bookData.publisher, 'Tipo:', typeof bookData.publisher);
          
          // Preencher os campos com os dados obtidos
          this.newBook.set({
            ...this.newBook(),
            title: bookData.title || this.newBook().title,
            author: bookData.author || this.newBook().author,
            genre: this.mapGenreFromBackend(bookData.genre) || this.newBook().genre,
            publisher: this.mapPublisherFromBackend(bookData.publisher) || this.newBook().publisher,
            synopsis: bookData.synopsis || this.newBook().synopsis,
            photoPath: bookData.coverUrl || this.newBook().photoPath // Atualizar photoPath com a URL da capa
          });
          
          console.log('🔍 Debug - Novo livro após sincronização:', this.newBook());
          
          // Sincronizar a foto se disponível
          if (bookData.coverUrl) {
            console.log('📸 Foto sincronizada:', bookData.coverUrl);
            
            // Baixar a imagem da URL da capa de forma assíncrona
            this.downloadImageFromUrl(bookData.coverUrl).then(imageFile => {
              if (imageFile) {
                this.selectedPhotoFile.set(imageFile);
                console.log('✅ Imagem baixada com sucesso:', imageFile.name);
              }
            }).catch(error => {
              console.error('❌ Erro ao baixar imagem da capa:', error);
              // A imagem ainda será exibida pela URL, mas não será baixada
            });
          }
          
          alert('Dados do livro sincronizados com sucesso!');
        } else {
          alert('Nenhum livro encontrado para este ISBN.');
        }
        
        this.isSyncingIsbn.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao sincronizar ISBN:', error);
        
        let errorMessage = 'Erro ao sincronizar dados do ISBN.';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'ISBN inválido. Verifique o formato.';
        } else if (error.status === 404) {
          errorMessage = 'ISBN não encontrado na base de dados.';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        }
        
        alert(`Erro: ${errorMessage}`);
        this.isSyncingIsbn.set(false);
      }
    });
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    const title = this.newBook().title;
    const author = this.newBook().author;
    const isbn = this.newBook().isbn;
    const genre = this.newBook().genre;
    const publisher = this.newBook().publisher;
    const synopsis = this.newBook().synopsis;
    
    console.log('🔍 Debug isFormValid:');
    console.log('  - title:', title, 'válido:', !!title);
    console.log('  - author:', author, 'válido:', !!author);
    console.log('  - isbn:', isbn, 'válido:', !!isbn);
    console.log('  - genre:', genre, 'válido:', !!genre);
    console.log('  - publisher:', publisher, 'válido:', !!publisher);
    console.log('  - synopsis:', synopsis, 'válido:', !!synopsis);
    
    const isValid = !!(title && author && isbn && genre && publisher && synopsis);
    console.log('  - Formulário válido:', isValid);
    
    return isValid;
  }

  /**
   * Check if ISBN already exists in the current book list
   */
  isIsbnDuplicate(isbn: string): boolean {
    if (!isbn) return false;
    
    const currentBooks = this.books();
    return currentBooks.some(book => 
      book.isbn.toLowerCase() === isbn.toLowerCase() && 
      book.id !== this.editingBook()?.id // Exclude current book when editing
    );
  }

  /**
   * Check if ISBN exists in database (for create from ISBN modal)
   */
  async checkIsbnExistsInDatabase(isbn: string): Promise<boolean> {
    if (!isbn || !isbn.trim()) return false;
    
    try {
      // Try to search for the ISBN in the database
      const response = await this.bookService.searchBookByIsbn(isbn).toPromise();
      return response && response.data !== null;
    } catch (error) {
      // If there's an error, assume it doesn't exist to allow creation
      console.warn('⚠️ Erro ao verificar ISBN no banco:', error);
      return false;
    }
  }

  /**
   * Validate ISBN format and uniqueness
   */
  validateIsbn(isbn: string): { isValid: boolean; message: string } {
    if (!isbn || !isbn.trim()) {
      return { isValid: false, message: 'ISBN é obrigatório' };
    }
    
    // Basic ISBN format validation (10 or 13 digits, with optional hyphens)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
      return { isValid: false, message: 'ISBN deve ter 10 ou 13 dígitos' };
    }
    
    // Check for duplicates
    if (this.isIsbnDuplicate(isbn)) {
      return { isValid: false, message: 'Já existe um livro com este ISBN' };
    }
    
    return { isValid: true, message: 'ISBN válido' };
  }

  /**
   * Show validation error message to user
   */
  showValidationError(message: string): void {
    console.warn('⚠️ Erro de validação:', message);
    // You can replace this with a toast notification or better UI feedback
    alert(`Erro de validação: ${message}`);
  }

  /**
   * Show ISBN duplicate error with suggestions
   */
  showIsbnDuplicateError(isbn: string): void {
    const message = `O ISBN "${isbn}" já está sendo usado por outro livro.\n\n` +
                   `Sugestões:\n` +
                   `• Verifique se você digitou o ISBN corretamente\n` +
                   `• Use um ISBN diferente para este livro\n` +
                   `• Se for o mesmo livro, edite o existente em vez de criar um novo`;
    
    alert(message);
  }

  /**
   * Obtém a URL da imagem do livro
   */
  getBookImageUrl(book: Book): string {
    console.log('🔍 Debug getBookImageUrl para livro:', book.title, {
      photoDataUrl: book.photoDataUrl ? '✅ Presente' : '❌ Ausente',
      photoUrl: book.photoUrl,
      photoPath: book.photoPath,
      photoBytes: book.photoBytes ? `${book.photoBytes.length} caracteres` : '❌ Ausente',
      id: book.id
    });
    
    // Priorizar photoDataUrl (imagem base64 inline - sem problemas de CORS)
    if (book.photoDataUrl) {
      console.log('✅ Usando photoDataUrl (base64 inline)');
      return book.photoDataUrl;
    }
    
    // Se não tem photoDataUrl mas tem photoBytes, construir a data URL
    if (book.photoBytes && book.photoBytes.length > 0) {
      const contentType = book.photoContentType || 'image/jpeg';
      const dataUrl = `data:${contentType};base64,${book.photoBytes}`;
      console.log('🔧 Construindo data URL a partir de photoBytes');
      return dataUrl;
    }
    
    // Fallback para photoUrl (URL da API)
    if (book.photoUrl && book.photoUrl.startsWith('/api/book/photo/')) {
      console.log('✅ Usando photoUrl:', book.photoUrl);
      return book.photoUrl;
    }
    
    // Fallback para photoPath (campo legado)
    if (book.photoPath) {
      console.log('✅ Usando photoPath:', book.photoPath);
      return book.photoPath;
    }
    
    // Imagem padrão se não houver foto
    console.log('✅ Usando imagem padrão');
    return 'assets/images/default-book-cover.svg';
  }

  /**
   * Handle image error
   */
  onImageError(event: any): void {
    console.log('Erro na imagem:', event);
  }

  /**
   * Mostra o modal para criar livro por ISBN
   */
  showCreateFromIsbnModal(): void {
    this.showCreateFromIsbnModalSignal.set(true);
    this.isbnToCreate.set('');
    this.downloadCover.set(true);
  }

  /**
   * Fecha o modal para criar livro por ISBN
   */
  closeCreateFromIsbnModal(): void {
    this.showCreateFromIsbnModalSignal.set(false);
    this.isbnToCreate.set('');
    this.downloadCover.set(false);
  }

  /**
   * Cria um livro diretamente a partir do ISBN
   */
  createBookFromIsbn(): void {
    const isbn = this.isbnToCreate().trim();
    if (!isbn) {
      alert('Por favor, digite um ISBN válido.');
      return;
    }

    // Validate ISBN format
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
      alert('ISBN inválido. Deve ter 10 ou 13 dígitos.');
      return;
    }

    // Check if ISBN already exists in current books
    if (this.isIsbnDuplicate(isbn)) {
      alert('Já existe um livro com este ISBN no seu catálogo.');
      return;
    }

    this.isCreatingFromIsbn.set(true);
    console.log('🔄 Criando livro por ISBN:', isbn);

    this.bookService.createBookFromIsbn(isbn, this.downloadCover()).subscribe({
      next: (response) => {
        console.log('✅ Livro criado por ISBN:', response);
        
        if (response.data) {
          // Adicionar o novo livro à lista
          const currentBooks = this.books();
          const newBook = response.data;
          this.books.set([...currentBooks, newBook]);
          
          // Aplicar filtros para atualizar a lista
          this.applyFilters();
          
          // Fechar modal e mostrar sucesso
          this.closeCreateFromIsbnModal();
          alert(`Livro "${newBook.title}" criado com sucesso!`);
        } else {
          alert('Erro ao criar livro. Tente novamente.');
        }
        
        this.isCreatingFromIsbn.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao criar livro por ISBN:', error);
        
        let errorMessage = 'Erro ao criar livro por ISBN.';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
          
          // Check for specific ISBN duplicate error
          if (error.error.error.includes('ISBN') && error.error.error.includes('existe')) {
            this.showIsbnDuplicateError(this.isbnToCreate());
            return; // Don't show the generic error message
          }
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique o ISBN informado.';
        } else if (error.status === 404) {
          errorMessage = 'ISBN não encontrado na base de dados.';
        } else if (error.status === 409) {
          errorMessage = 'Já existe um livro com este ISBN. Por favor, use um ISBN diferente.';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        }
        
        alert(`Erro: ${errorMessage}`);
        this.isCreatingFromIsbn.set(false);
      }
    });
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

  /**
   * Obtém lista de gêneros de livros
   */
  getBookGenres(): string[] {
    return Object.values(BookGenre);
  }

  /**
   * Obtém lista de editoras
   */
  getBookPublishers(): string[] {
    return Object.values(BookPublisher);
  }

  /**
   * Helper to download an image from a URL and return a File object
   */
  private downloadImageFromUrl(url: string): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const blob = xhr.response;
          const filename = url.substring(url.lastIndexOf('/') + 1);
          const file = new File([blob], filename, { type: blob.type });
          resolve(file);
        } else {
          reject(new Error(`Erro ao baixar imagem: Status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Erro de rede ao baixar imagem'));
      };

      xhr.send();
    });
  }

  /**
   * Permite ao usuário baixar a imagem sincronizada por ISBN
   */
  downloadSyncedImage(): void {
    const photoPath = this.newBook().photoPath;
    
    if (!photoPath) {
      alert('Nenhuma imagem sincronizada disponível para download.');
      return;
    }

    // Se a imagem já foi baixada como arquivo, não precisa baixar novamente
    if (this.selectedPhotoFile()) {
      alert('A imagem já foi baixada e está disponível para upload.');
      return;
    }

    // Baixar a imagem da URL
    this.downloadImageFromUrl(photoPath).then(imageFile => {
      if (imageFile) {
        this.selectedPhotoFile.set(imageFile);
        alert(`Imagem baixada com sucesso: ${imageFile.name}`);
        console.log('✅ Imagem sincronizada baixada pelo usuário:', imageFile);
      } else {
        alert('Erro ao baixar a imagem. Tente novamente.');
      }
    }).catch(error => {
      console.error('❌ Erro ao baixar imagem sincronizada:', error);
      alert('Erro ao baixar a imagem. Tente novamente.');
    });
  }

  /**
   * Mapeia o gênero recebido do backend para o enum local
   */
  private mapGenreFromBackend(genre: any): BookGenre | null {
    if (!genre) return null;
    
    console.log('🔍 Mapeando gênero:', genre, 'Tipo:', typeof genre);
    
    // Se já for um enum válido, retorna diretamente
    if (Object.values(BookGenre).includes(genre)) {
      console.log('✅ Gênero válido encontrado:', genre);
      return genre as BookGenre;
    }
    
    // Se for string, tenta mapear diretamente
    if (typeof genre === 'string') {
      if (Object.values(BookGenre).includes(genre as BookGenre)) {
        console.log('✅ Gênero mapeado por string:', genre);
        return genre as BookGenre;
      }
    }
    
    console.warn('❌ Gênero não reconhecido:', genre);
    return null;
  }

  /**
   * Mapeia a editora recebida do backend para o enum local
   */
  private mapPublisherFromBackend(publisher: any): BookPublisher | null {
    if (!publisher) return null;
    
    console.log('🔍 Mapeando editora:', publisher, 'Tipo:', typeof publisher);
    
    // Se já for um enum válido, retorna diretamente
    if (Object.values(BookPublisher).includes(publisher)) {
      console.log('✅ Editora válida encontrada:', publisher);
      return publisher as BookPublisher;
    }
    
    // Se for string, tenta mapear diretamente
    if (typeof publisher === 'string') {
      if (Object.values(BookPublisher).includes(publisher as BookPublisher)) {
        console.log('✅ Editora mapeada por string:', publisher);
        return publisher as BookPublisher;
      }
    }
    
    console.warn('❌ Editora não reconhecida:', publisher);
    return null;
  }

  /**
   * Exibe o modal de detalhes do livro
   */
  showBookDetails(book: Book): void {
    this.selectedBookForDetails.set(book);
    this.showBookDetailsModalSignal.set(true);
  }

  /**
   * Fecha o modal de detalhes do livro
   */
  closeBookDetailsModal(): void {
    this.showBookDetailsModalSignal.set(false);
    this.selectedBookForDetails.set(null);
  }

  /**
   * Getter para o signal do modal de detalhes
   */
  showBookDetailsModal(): boolean {
    return this.showBookDetailsModalSignal();
  }
}
