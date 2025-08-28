import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookCategory } from '../../models/book.model';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-catalog.html',
  styleUrl: './book-catalog.scss'
})
export class BookCatalog implements OnInit {
  books = signal<Book[]>([]);
  categories = signal<BookCategory[]>([]);
  filteredBooks = signal<Book[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  showAddForm = signal(false);
  newBook = signal<Partial<Book>>({});

    // Computed signals for category counts
  categoryCounts = computed(() => {
    const booksList = this.books();
    const categoriesList = this.categories();

    return categoriesList.map(category => ({
      ...category,
      count: booksList.filter(book => book.category === category.name).length
    }));
  });

  // Mobile menu state
  mobileMenuOpen = signal(false);
  sidebarOpen = signal(false);

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadCategories();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe(books => {
      this.books.set(books);
      this.filteredBooks.set(books);
    });
  }

  loadCategories(): void {
    this.bookService.getAllCategories().subscribe(categories => {
      this.categories.set(categories);
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
    if (bookData.title && bookData.author && bookData.isbn) {
      // Generate a fallback cover image if none provided
      const coverImage = bookData.coverImage || this.generateFallbackCover(bookData.title!, bookData.author!);
      
      this.bookService.createBook({
        title: bookData.title!,
        author: bookData.author!,
        isbn: bookData.isbn!,
        publisher: bookData.publisher || '',
        publicationYear: bookData.publicationYear || new Date().getFullYear(),
        category: bookData.category || 'Outros',
        subcategory: bookData.subcategory,
        price: bookData.price || 0,
        description: bookData.description || '',
        coverImage: coverImage,
        stockQuantity: bookData.stockQuantity || 0,
        isAvailable: bookData.isAvailable !== false
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
    return !!(book.title && book.author && book.isbn && book.category && book.price !== undefined && book.stockQuantity !== undefined);
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

  private generateFallbackCover(title: string, author: string): string {
    // Generate a simple SVG cover with book title and author
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
      <svg width="150" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${randomColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#FFFFFF" text-anchor="middle" dy=".3em">${title}</text>
        <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle" dy=".3em">${author}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}
