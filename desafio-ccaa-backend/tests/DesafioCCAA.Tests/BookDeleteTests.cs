using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Services;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Infrastructure.Data;
using DesafioCCAA.Infrastructure.Repositories;

namespace DesafioCCAA.Tests;

public class BookDeleteTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly BookRepository _bookRepository;
    private readonly UserRepository _userRepository;
    private readonly BookService _bookService;
    private readonly Mock<IImageOptimizationService> _mockImageService;

    public BookDeleteTests()
    {
        // Configurar banco em memória para testes
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _bookRepository = new BookRepository(_context);
        _userRepository = new UserRepository(_context);
        _mockImageService = new Mock<IImageOptimizationService>();
        
        var mockLogger = new Mock<ILogger<BookService>>();
        _bookService = new BookService(_bookRepository, _userRepository, _mockImageService.Object, mockLogger.Object);
    }

    [Fact]
    public async Task DeleteBook_ShouldRemoveBookFromDatabase_WhenBookExists()
    {
        // Arrange
        var userId = "test-user-id";
        var user = new User
        {
            Id = userId,
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            DateOfBirth = DateTime.Now.AddYears(-25),
            CreatedAt = DateTime.UtcNow
        };

        var book = new Book
        {
            Title = "Test Book",
            ISBN = "1234567890123",
            Genre = BookGenre.Fiction,
            Author = "Test Author",
            Publisher = BookPublisher.Other,
            Synopsis = "Test Synopsis",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.Books.AddAsync(book);
        await _context.SaveChangesAsync();

        // Act
        var result = await _bookService.DeleteBookAsync(book.Id, userId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Data);

        // Verificar se o livro foi realmente removido do banco
        var deletedBook = await _context.Books.FindAsync(book.Id);
        Assert.Null(deletedBook);

        // Verificar se não há livros com o mesmo ISBN
        var bookWithSameIsbn = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == book.ISBN);
        Assert.Null(bookWithSameIsbn);
    }

    [Fact]
    public async Task DeleteBook_ShouldReturnFailure_WhenBookDoesNotExist()
    {
        // Arrange
        var userId = "test-user-id";
        var nonExistentBookId = 999;

        // Act
        var result = await _bookService.DeleteBookAsync(nonExistentBookId, userId);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Livro não encontrado", result.ErrorMessage);
    }

    [Fact]
    public async Task DeleteBook_ShouldReturnFailure_WhenUserDoesNotOwnBook()
    {
        // Arrange
        var ownerUserId = "owner-user-id";
        var otherUserId = "other-user-id";
        
        var owner = new User
        {
            Id = ownerUserId,
            FirstName = "Owner",
            LastName = "User",
            Email = "owner@example.com",
            DateOfBirth = DateTime.Now.AddYears(-25),
            CreatedAt = DateTime.UtcNow
        };

        var book = new Book
        {
            Title = "Test Book",
            ISBN = "1234567890123",
            Genre = BookGenre.Fiction,
            Author = "Test Author",
            Publisher = BookPublisher.Other,
            Synopsis = "Test Synopsis",
            UserId = ownerUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(owner);
        await _context.Books.AddAsync(book);
        await _context.SaveChangesAsync();

        // Act
        var result = await _bookService.DeleteBookAsync(book.Id, otherUserId);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Acesso negado", result.ErrorMessage);

        // Verificar se o livro ainda existe no banco
        var existingBook = await _context.Books.FindAsync(book.Id);
        Assert.NotNull(existingBook);
    }

    [Fact]
    public async Task DeleteByIsbn_ShouldRemoveBookFromDatabase_WhenBookExists()
    {
        // Arrange
        var userId = "test-user-id";
        var user = new User
        {
            Id = userId,
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            DateOfBirth = DateTime.Now.AddYears(-25),
            CreatedAt = DateTime.UtcNow
        };

        var book = new Book
        {
            Title = "Test Book",
            ISBN = "1234567890123",
            Genre = BookGenre.Fiction,
            Author = "Test Author",
            Publisher = BookPublisher.Other,
            Synopsis = "Test Synopsis",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.Books.AddAsync(book);
        await _context.SaveChangesAsync();

        // Act
        var result = await _bookRepository.DeleteByIsbnAsync(book.ISBN);

        // Assert
        Assert.True(result);

        // Verificar se o livro foi realmente removido do banco
        var deletedBook = await _context.Books.FindAsync(book.Id);
        Assert.Null(deletedBook);

        // Verificar se não há livros com o mesmo ISBN
        var bookWithSameIsbn = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == book.ISBN);
        Assert.Null(bookWithSameIsbn);
    }

    [Fact]
    public async Task DeleteByIsbn_ShouldReturnFalse_WhenBookDoesNotExist()
    {
        // Arrange
        var nonExistentIsbn = "9999999999999";

        // Act
        var result = await _bookRepository.DeleteByIsbnAsync(nonExistentIsbn);

        // Assert
        Assert.False(result);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
