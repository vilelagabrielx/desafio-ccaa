export interface Book {
  id: number;
  title: string;
  isbn: string;
  genre: BookGenre;
  author: string;
  publisher: BookPublisher;
  synopsis: string;
  
  // Novas propriedades para imagens no banco de dados
  photoUrl?: string; // URL para acessar a imagem via API
  photoBytes?: number[]; // Bytes da imagem (não usado no frontend)
  photoContentType?: string; // Tipo MIME da imagem
  
  // Campo legado para compatibilidade
  photoPath?: string;
  
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  userId: string;
  userFullName?: string; // Para exibição no frontend
}

export enum BookGenre {
  Fiction = 'Fiction',
  NonFiction = 'NonFiction',
  Mystery = 'Mystery',
  Romance = 'Romance',
  ScienceFiction = 'ScienceFiction',
  Fantasy = 'Fantasy',
  Horror = 'Horror',
  Thriller = 'Thriller',
  Biography = 'Biography',
  History = 'History',
  Science = 'Science',
  Technology = 'Technology',
  Philosophy = 'Philosophy',
  Religion = 'Religion',
  SelfHelp = 'SelfHelp',
  Business = 'Business',
  Economics = 'Economics',
  Politics = 'Politics',
  Travel = 'Travel',
  Cookbook = 'Cookbook',
  Poetry = 'Poetry',
  Drama = 'Drama',
  Other = 'Other'
}

export enum BookPublisher {
  PenguinRandomHouse = 'PenguinRandomHouse',
  HarperCollins = 'HarperCollins',
  SimonSchuster = 'SimonSchuster',
  HachetteBookGroup = 'HachetteBookGroup',
  Macmillan = 'Macmillan',
  Scholastic = 'Scholastic',
  Bloomsbury = 'Bloomsbury',
  FaberFaber = 'FaberFaber',
  Vintage = 'Vintage',
  Anchor = 'Anchor',
  Doubleday = 'Doubleday',
  Knopf = 'Knopf',
  Crown = 'Crown',
  Ballantine = 'Ballantine',
  Bantam = 'Bantam',
  Dell = 'Dell',
  Other = 'Other'
}

// Interface para criação de livro (sem ID e timestamps)
export interface CreateBookDto {
  title: string;
  isbn: string;
  genre: BookGenre;
  author: string;
  publisher: BookPublisher;
  synopsis: string;
  photoPath?: string;
}

// Interface para atualização de livro
export interface UpdateBookDto {
  title?: string;
  isbn?: string;
  genre?: BookGenre;
  author?: string;
  publisher?: BookPublisher;
  synopsis?: string;
  photoPath?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
}
