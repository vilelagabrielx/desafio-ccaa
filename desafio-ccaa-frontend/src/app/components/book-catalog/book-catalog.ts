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
    // Implementar lógica de filtro se necessário
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
    if (this.selectedPhotoFile()) {
      return URL.createObjectURL(this.selectedPhotoFile()!);
    }
    return this.newBook().photoPath || '';
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
          alert('Erro ao atualizar livro. Tente novamente.');
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
          alert('Erro ao criar livro. Tente novamente.');
        }
      });
    }
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
          
          // Preencher os campos com os dados obtidos
          this.newBook.set({
            ...this.newBook(),
            title: bookData.title || this.newBook().title,
            author: bookData.author || this.newBook().author,
            genre: bookData.genre || this.newBook().genre,
            publisher: bookData.publisher || this.newBook().publisher,
            synopsis: bookData.synopsis || this.newBook().synopsis
          });
          
          // Sincronizar a foto se disponível
          if (bookData.photoUrl) {
            console.log('📸 Foto sincronizada:', bookData.photoUrl);
            // Atualizar o preview da foto
            this.selectedPhotoFile.set(null); // Limpar arquivo selecionado
            // A foto será exibida automaticamente pelo getPhotoPreview()
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
   * Obtém a URL da imagem do livro
   */
  getBookImageUrl(book: Book): string {
    // Priorizar photoUrl (nova propriedade)
    if (book.photoUrl) {
      return book.photoUrl;
    }
    
    // Fallback para photoPath (campo legado)
    if (book.photoPath) {
      return book.photoPath;
    }
    
    // Imagem padrão se não houver foto
    return 'assets/images/default-book-cover.jpg';
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
        } else if (error.status === 404) {
          errorMessage = 'ISBN não encontrado na base de dados.';
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
}
