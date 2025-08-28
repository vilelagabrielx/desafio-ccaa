export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  category: string;
  subcategory?: string;
  price: number;
  description: string;
  coverImage?: string;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookCategory {
  id: number;
  name: string;
  subcategories?: string[];
  icon?: string;
}
