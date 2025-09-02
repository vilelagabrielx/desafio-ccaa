using Microsoft.AspNetCore.Http;

namespace DesafioCCAA.Business.Interfaces;

/// <summary>
/// Interface para gestão de imagens de livros
/// </summary>
public interface IBookImageService
{
    Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null);
    Task<byte[]> ResizeBookPhotoAsync(int bookId, int? width, int? height);
    Task<byte[]> ConvertFormFileToBytesAsync(IFormFile file);
}
