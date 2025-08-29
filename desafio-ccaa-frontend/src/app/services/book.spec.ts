import { TestBed } from '@angular/core/testing';

import { BookService } from './book';

describe('BookService', () => {
  let service: BookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all books', () => {
    service.getAllBooks().subscribe(books => {
      expect(books).toBeTruthy();
      expect(books.length).toBeGreaterThan(0);
    });
  });

  it('should return categories', () => {
    service.getAllCategories().subscribe(categories => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
    });
  });
});
