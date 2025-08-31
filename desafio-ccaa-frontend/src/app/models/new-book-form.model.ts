import { BookGenre, BookPublisher } from './book.model';

export interface NewBookForm {
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre;
  publisher: BookPublisher;
  synopsis: string;
  photoPath: string;
  photoUrl: string;
}
