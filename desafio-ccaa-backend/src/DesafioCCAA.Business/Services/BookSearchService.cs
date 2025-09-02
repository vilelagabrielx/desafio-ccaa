using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookSearchService : IBookSearchService
{
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOpenLibraryService _openLibraryService;
    private readonly IImageOptimizationService _imageService;
    private readonly ILogger<BookSearchService> _logger;

    public BookSearchService(
        IBookRepository bookRepository,
        IUserRepository userRepository,
        IOpenLibraryService openLibraryService,
        IImageOptimizationService imageService,
        ILogger<BookSearchService> logger)
    {
        _bookRepository = bookRepository;
        _userRepository = userRepository;
        _openLibraryService = openLibraryService;
        _imageService = imageService;
        _logger = logger;
    }

    public async Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn)
    {
        try
        {
            _logger.LogInformation("Iniciando busca por ISBN: {ISBN}", isbn);
            
            var result = await _openLibraryService.SearchBookByIsbnAsync(isbn);
            
            if (!result.IsSuccess)
            {
                _logger.LogWarning("Falha na busca por ISBN {ISBN}: {ErrorMessage}", isbn, result.ErrorMessage);
                return ServiceResult<BookFromIsbnDto?>.Failure(result.ErrorMessage ?? "Erro desconhecido na busca por ISBN");
            }

            _logger.LogInformation("Busca por ISBN {ISBN} concluída com sucesso", isbn);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro interno ao buscar livro por ISBN: {ISBN}", isbn);
            return ServiceResult<BookFromIsbnDto?>.Failure("Erro interno ao buscar livro por ISBN");
        }
    }

    public async Task<ServiceResult<BookResponseDto>> CreateBookFromIsbnAsync(string userId, CreateBookFromIsbnDto createBookDto)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Usuário não encontrado");
            }

            // Buscar livro na API do OpenLibrary
            var openLibraryResult = await _openLibraryService.SearchBookByIsbnAsync(createBookDto.ISBN);
            if (!openLibraryResult.IsSuccess)
            {
                return ServiceResult<BookResponseDto>.Failure($"Erro ao buscar livro por ISBN: {openLibraryResult.ErrorMessage}");
            }

            var bookData = openLibraryResult.Data;
            if (bookData == null)
            {
                return ServiceResult<BookResponseDto>.Failure("Livro não encontrado na API do OpenLibrary");
            }

            // Verificar se ISBN já existe (apenas livros ativos)
            var existingBooks = await _bookRepository.GetAllAsync();
            if (existingBooks.Any(b => b.ISBN == bookData.ISBN))
            {
                return ServiceResult<BookResponseDto>.Failure("ISBN já está em uso");
            }

            // Download da imagem de capa se solicitado
            byte[]? photoBytes = null;
            string? photoContentType = null;
            if (createBookDto.DownloadCover && !string.IsNullOrWhiteSpace(bookData.CoverUrl))
            {
                try
                {
                    var coverImageBytes = await _openLibraryService.DownloadCoverImageAsync(bookData.CoverUrl);
                    if (coverImageBytes != null)
                    {
                        // Otimizar a imagem baixada
                        var imageData = await _imageService.OptimizeImageToBytesAsync(coverImageBytes, $"cover_{bookData.ISBN}.jpg");
                        photoBytes = imageData.Data;
                        photoContentType = imageData.ContentType;
                        _logger.LogInformation("Imagem de capa baixada e otimizada para ISBN {ISBN}", bookData.ISBN);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erro ao baixar imagem de capa para ISBN {ISBN}, continuando sem imagem", bookData.ISBN);
                }
            }

            // Criar o livro
            var book = new Book
            {
                Title = bookData.Title,
                ISBN = bookData.ISBN,
                Genre = bookData.Genre,
                Author = bookData.Author,
                Publisher = bookData.Publisher,
                Synopsis = bookData.Synopsis,
                Summary = bookData.Summary,
                UserId = userId,
                CoverUrl = bookData.CoverUrl
            };

            // Adicionar foto se baixada
            if (photoBytes != null && photoContentType != null)
            {
                book.PhotoBytes = photoBytes;
                book.PhotoContentType = photoContentType;
            }

            var createdBook = await _bookRepository.AddAsync(book);
            var bookResponse = MapToBookResponseDto(createdBook);

            _logger.LogInformation("Livro criado com sucesso a partir do ISBN: {Title} ({ISBN}) por {UserId}", 
                bookData.Title, bookData.ISBN, userId);
            
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar livro a partir do ISBN: {ISBN} por {UserId}", createBookDto.ISBN, userId);
            return ServiceResult<BookResponseDto>.Failure("Erro interno ao criar livro a partir do ISBN");
        }
    }

    private static BookResponseDto MapToBookResponseDto(Book book) =>
        new()
        {
            Id = book.Id,
            Title = book.Title,
            ISBN = book.ISBN,
            Genre = book.Genre,
            Author = book.Author,
            Publisher = book.Publisher,
            Synopsis = book.Synopsis,
            Summary = book.Summary,
            PhotoUrl = book.PhotoBytes != null ? $"/api/book/photo/{book.Id}" : book.CoverUrl,
            PhotoPath = book.PhotoPath,
            PhotoBytes = book.PhotoBytes,
            PhotoContentType = book.PhotoContentType,
            PhotoDataUrl = book.PhotoBytes != null ? $"data:{book.PhotoContentType ?? "image/jpeg"};base64,{Convert.ToBase64String(book.PhotoBytes)}" : null,
            CreatedAt = book.CreatedAt,
            UpdatedAt = book.UpdatedAt,
            UserId = book.UserId,
            UserFullName = book.User?.FullName ?? string.Empty
        };
}
