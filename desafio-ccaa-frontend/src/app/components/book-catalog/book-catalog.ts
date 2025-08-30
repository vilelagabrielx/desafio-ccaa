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
  selectedCategory = signal<string>('');
  showAddForm = signal(false);
  newBook = signal<Partial<Book>>({});

  // User information
  userProfile = signal<any>(null);
  isAuthenticated = signal(false);

  // Computed signals for category counts
  categoryCounts = computed(() => {
    const booksList = this.books();
    const categoriesList = this.categories();

    return categoriesList.map(category => ({
      ...category,
      count: booksList.filter(book => book.genre === category.name).length
    }));
  });

  // Mobile menu state
  mobileMenuOpen = signal(false);
  sidebarOpen = signal(false);

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
    this.authService.getUserProfile().subscribe(profile => {
      if (profile) {
        console.log('✅ BookCatalog: Perfil carregado:', profile);
        this.userProfile.set(profile);
        // Não alterar isAuthenticated aqui, pois já foi definido no ngOnInit
      } else {
        console.log('⚠️ BookCatalog: Perfil não carregado ainda, mas usuário está autenticado');
        // Não definir isAuthenticated como false aqui
        // O usuário pode estar autenticado mas o perfil ainda não foi carregado
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
    this.bookService.getAllBooks().subscribe(books => {
      // Garantir que sempre seja um array válido
      const booksArray = Array.isArray(books) ? books : [];
      this.books.set(booksArray);
      this.filteredBooks.set(booksArray);
    });
  }

  loadCategories(): void {
    this.bookService.getAllCategories().subscribe(categories => {
      // Garantir que sempre seja um array válido
      const categoriesArray = Array.isArray(categories) ? categories : [];
      this.categories.set(categoriesArray);
    });
  }

  searchBooks(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.bookService.searchBooks(query).subscribe(books => {
        this.filteredBooks.set(books);
      });
    } else {
      this.filteredBooks.set(this.books());
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    if (category) {
      this.bookService.getBooksByCategory(category).subscribe(books => {
        this.filteredBooks.set(books);
      });
    } else {
      this.filteredBooks.set(this.books());
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.filteredBooks.set(this.books());
  }

  addBook(): void {
    this.showAddForm.set(true);
    this.newBook.set({});
  }

  saveBook(): void {
    const bookData = this.newBook();
    if (bookData.title && bookData.author && bookData.isbn && bookData.genre && bookData.publisher && bookData.synopsis) {
      this.bookService.createBook({
        title: bookData.title!,
        author: bookData.author!,
        isbn: bookData.isbn!,
        genre: bookData.genre!,
        publisher: bookData.publisher!,
        synopsis: bookData.synopsis!,
        photoPath: bookData.photoPath,
        isActive: true,
        userId: '1' // TODO: Pegar do usuário logado
      }).subscribe(() => {
        this.loadBooks();
        this.showAddForm.set(false);
        this.newBook.set({});
      });
    }
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.newBook.set({});
  }

  closeModal(): void {
    this.showAddForm.set(false);
    this.newBook.set({});
  }

  isFormValid(): boolean {
    const book = this.newBook();
    return !!(book.title && book.author && book.isbn && book.genre && book.publisher && book.synopsis);
  }

  // Mobile methods
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  deleteBook(id: number): void {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
      this.bookService.deleteBook(id).subscribe(() => {
        this.loadBooks();
      });
    }
  }

  editBook(book: Book): void {
    // Implementar edição (por enquanto apenas log)
    console.log('Editar livro:', book);
  }

  onImageError(event: any): void {
    // Hide the failed image and show fallback
    const img = event.target;
    const fallback = img.nextElementSibling;
    if (img && fallback) {
      img.style.display = 'none';
      fallback.style.display = 'block';
    }
  }

  // Helper methods para acessar os enums no template
  getBookGenres(): string[] {
    return Object.values(BookGenre);
  }

  getBookPublishers(): string[] {
    return Object.values(BookPublisher);
  }
}
