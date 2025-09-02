using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookImageService : IBookImageService
{
    private readonly IBookRepository _bookRepository;
    private readonly IImageOptimizationService _imageService;
    private readonly ILogger<BookImageService> _logger;

    public BookImageService(
        IBookRepository bookRepository,
        IImageOptimizationService imageService,
        ILogger<BookImageService> logger)
    {
        _bookRepository = bookRepository;
        _imageService = imageService;
        _logger = logger;
    }

    public async Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null)
    {
        try
        {
            return await _imageService.GetOptimizedImageAsync(imagePath, maxWidth, maxHeight);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter imagem otimizada: {ImagePath}", imagePath);
            throw;
        }
    }

    public async Task<byte[]> ResizeBookPhotoAsync(int bookId, int? width, int? height)
    {
        try
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book?.PhotoBytes == null || book.PhotoBytes.Length == 0)
            {
                throw new InvalidOperationException("Livro não possui foto");
            }

            // Redimensionar a imagem usando o ImageOptimizationService
            var resizedBytes = await _imageService.ResizeImageBytesAsync(book.PhotoBytes, width, height);
            return resizedBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao redimensionar foto do livro: {BookId}", bookId);
            throw;
        }
    }

    public async Task<byte[]> ConvertFormFileToBytesAsync(IFormFile file)
    {
        try
        {
            return await _imageService.ConvertFormFileToBytesAsync(file);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao converter IFormFile para bytes");
            throw;
        }
    }
}
