export interface Book {
  id: number;
  title: string;
  isbn: string;
  genre: BookGenre;
  author: string;
  publisher: BookPublisher;
  synopsis: string;
  photoPath?: string;
  createdAt: Date;
  updatedAt?: Date;
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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}
