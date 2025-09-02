using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

/// <summary>
/// Facade que implementa IBookService delegando para os serviços específicos
/// Mantém compatibilidade com código existente
/// </summary>
public class BookServiceFacade : IBookService
{
    private readonly IBookCrudService _bookCrudService;
    private readonly IBookReportService _bookReportService;
    private readonly IBookSearchService _bookSearchService;
    private readonly IBookImageService _bookImageService;
    private readonly ILogger<BookServiceFacade> _logger;

    public BookServiceFacade(
        IBookCrudService bookCrudService,
        IBookReportService bookReportService,
        IBookSearchService bookSearchService,
        IBookImageService bookImageService,
        ILogger<BookServiceFacade> logger)
    {
        _bookCrudService = bookCrudService;
        _bookReportService = bookReportService;
        _bookSearchService = bookSearchService;
        _bookImageService = bookImageService;
        _logger = logger;
    }

    // IBookCrudService delegates
    public Task<ServiceResult<BookResponseDto>> CreateBookAsync(string userId, CreateBookDto createBookDto, IFormFile? photoFile)
        => _bookCrudService.CreateBookAsync(userId, createBookDto, photoFile);

    public Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId)
        => _bookCrudService.GetBookByIdAsync(bookId);

    public Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId, string userId)
        => _bookCrudService.GetBookByIdAsync(bookId, userId);

    public Task<ServiceResult<List<BookResponseDto>>> GetBooksByUserIdAsync(string userId)
        => _bookCrudService.GetBooksByUserIdAsync(userId);

    public Task<ServiceResult<BookSearchResultDto>> SearchBooksAsync(BookSearchDto searchDto)
        => _bookCrudService.SearchBooksAsync(searchDto);

    public Task<ServiceResult<BookResponseDto>> UpdateBookAsync(int bookId, string userId, UpdateBookDto updateBookDto, IFormFile? photoFile)
        => _bookCrudService.UpdateBookAsync(bookId, userId, updateBookDto, photoFile);

    public Task<ServiceResult<bool>> DeleteBookAsync(int bookId, string userId)
        => _bookCrudService.DeleteBookAsync(bookId, userId);

    public Task<List<BookResponseDto>> GetAllBooksAsync()
        => _bookCrudService.GetAllBooksAsync();

    public Task<List<CategoryDto>> GetCategoriesAsync()
        => _bookCrudService.GetCategoriesAsync();

    public Task<List<CategoryWithCountDto>> GetCategoriesWithCountAsync()
        => _bookCrudService.GetCategoriesWithCountAsync();

    public Task<List<CategoryWithCountDto>> GetCategoriesWithCountByUserIdAsync(string userId)
        => _bookCrudService.GetCategoriesWithCountByUserIdAsync(userId);

    // IBookReportService delegates
    public Task<ServiceResult<byte[]>> GenerateBooksReportPdfAsync(string userId)
        => _bookReportService.GenerateBooksReportPdfAsync(userId);

    public Task<ServiceResult<byte[]>> GenerateBooksReportExcelAsync(string userId)
        => _bookReportService.GenerateBooksReportExcelAsync(userId);

    // IBookSearchService delegates
    public Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn)
        => _bookSearchService.SearchBookByIsbnAsync(isbn);

    public Task<ServiceResult<BookResponseDto>> CreateBookFromIsbnAsync(string userId, CreateBookFromIsbnDto createBookDto)
        => _bookSearchService.CreateBookFromIsbnAsync(userId, createBookDto);

    // IBookImageService delegates
    public Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null)
        => _bookImageService.GetOptimizedImageAsync(imagePath, maxWidth, maxHeight);

    public Task<byte[]> ResizeBookPhotoAsync(int bookId, int? width, int? height)
        => _bookImageService.ResizeBookPhotoAsync(bookId, width, height);

    public Task<byte[]> ConvertFormFileToBytesAsync(IFormFile file)
        => _bookImageService.ConvertFormFileToBytesAsync(file);
}
