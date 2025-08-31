using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Formats;

namespace DesafioCCAA.Business.Services;

public record ImageData
{
    public byte[] Data { get; init; } = Array.Empty<byte>();
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
}

public interface IImageOptimizationService
{
    Task<string?> OptimizeAndSaveImageAsync(IFormFile imageFile, string folderName);
    Task<bool> DeleteImageAsync(string imagePath);
    Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null);
    
    // Novos métodos para trabalhar com bytes
    Task<ImageData> OptimizeImageToBytesAsync(IFormFile imageFile);
    Task<ImageData> OptimizeImageToBytesAsync(byte[] imageBytes, string fileName = "image.jpg");
    Task<byte[]> ResizeImageBytesAsync(byte[] imageBytes, int? maxWidth = null, int? maxHeight = null);
    
    // Método para converter IFormFile para bytes
    Task<byte[]> ConvertFormFileToBytesAsync(IFormFile file);
}

public class ImageOptimizationService : IImageOptimizationService
{
    private readonly ILogger<ImageOptimizationService> _logger;
    private readonly IConfiguration _configuration;
    
    // Configurações de otimização
    private int MaxWidth => _configuration.GetValue<int>("ImageOptimization:MaxWidth", 800);
    private int MaxHeight => _configuration.GetValue<int>("ImageOptimization:MaxHeight", 600);
    private int JpegQuality => _configuration.GetValue<int>("ImageOptimization:JpegQuality", 85);
    private long MaxFileSizeBytes => _configuration.GetValue<int>("ImageOptimization:MaxFileSizeKB", 500) * 1024;

    public ImageOptimizationService(ILogger<ImageOptimizationService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        
        _logger.LogInformation("ImageOptimizationService inicializado para processamento em memória");
    }

    /// <summary>
    /// Otimiza uma imagem de IFormFile e retorna os bytes otimizados
    /// </summary>
    public async Task<ImageData> OptimizeImageToBytesAsync(IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
        {
            _logger.LogWarning("Arquivo de imagem vazio ou nulo recebido");
            return new ImageData();
        }

        try
        {
            // Validar tipo de arquivo
            if (!IsValidImageFile(imageFile))
            {
                _logger.LogWarning("Tipo de arquivo inválido: {FileName}", imageFile.FileName);
                return new ImageData();
            }

            // Validar tamanho do arquivo
            if (imageFile.Length > MaxFileSizeBytes * 2) // Permitir arquivos até 1MB para processamento
            {
                _logger.LogWarning("Arquivo muito grande: {FileName} - {Size} bytes", imageFile.FileName, imageFile.Length);
            }

            // Processar e otimizar a imagem
            using var image = await Image.LoadAsync(imageFile.OpenReadStream());
            
            // Redimensionar se necessário
            var resizedImage = ResizeImageIfNeeded(image);
            
            // Determinar formato de saída baseado no arquivo original
            var outputFormat = DetermineOutputFormat(imageFile.FileName);
            
            // Converter para bytes otimizados
            var optimizedBytes = await ConvertImageToBytesAsync(resizedImage, outputFormat);
            
            // Determinar o tipo de conteúdo
            var contentType = GetContentType(outputFormat);
            
            _logger.LogInformation("Imagem otimizada para bytes: {FileName}, Tamanho original: {OriginalSize} bytes, Tamanho final: {FinalSize} bytes", 
                imageFile.FileName, imageFile.Length, optimizedBytes.Length);

            return new ImageData
            {
                Data = optimizedBytes,
                ContentType = contentType,
                FileName = imageFile.FileName ?? "image.jpg"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao otimizar imagem para bytes: {FileName}", imageFile.FileName);
            return new ImageData();
        }
    }

    /// <summary>
    /// Salva uma imagem otimizada em arquivo (método legado para compatibilidade)
    /// </summary>
    public async Task<string?> OptimizeAndSaveImageAsync(IFormFile imageFile, string folderName)
    {
        var imageData = await OptimizeImageToBytesAsync(imageFile);
        if (imageData.Data.Length == 0)
        {
            return null;
        }

        try
        {
            // Usar configuração personalizada ou fallback para ContentRootPath
            var uploadsFolder = _configuration.GetValue<string>("ImageOptimization:UploadsFolder", "uploads");
            var basePath = Environment.CurrentDirectory;
            var uploadsBasePath = Path.Combine(basePath, uploadsFolder);
            
            // Garantir que o diretório base existe
            if (!Directory.Exists(uploadsBasePath))
            {
                Directory.CreateDirectory(uploadsBasePath);
            }
            
            var folderPath = Path.Combine(uploadsBasePath, folderName ?? "default");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(imageData.FileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            // Salvar bytes no arquivo
            await File.WriteAllBytesAsync(filePath, imageData.Data);
            
            return $"/uploads/{folderName}/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar imagem otimizada");
            return null;
        }
    }

    /// <summary>
    /// Deleta uma imagem do sistema de arquivos (método legado para compatibilidade)
    /// </summary>
    public Task<bool> DeleteImageAsync(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
            return Task.FromResult(false);

        try
        {
            // Limpar e normalizar o caminho da imagem
            var cleanImagePath = imagePath?.TrimStart('/').Replace("uploads/", "").Replace("\\", "/");
            if (string.IsNullOrEmpty(cleanImagePath))
            {
                _logger.LogWarning("Caminho da imagem inválido para exclusão: {ImagePath}", imagePath);
                return Task.FromResult(false);
            }
            
            var uploadsFolder = _configuration.GetValue<string>("ImageOptimization:UploadsFolder", "uploads");
            var basePath = Environment.CurrentDirectory;
            var uploadsBasePath = Path.Combine(basePath, uploadsFolder);
            var fullPath = Path.Combine(uploadsBasePath, cleanImagePath ?? string.Empty);
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Imagem deletada: {ImagePath}", imagePath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar imagem: {ImagePath}", imagePath);
            return Task.FromResult(false);
        }
    }

    /// <summary>
    /// Obtém imagem otimizada de um arquivo (método legado para compatibilidade)
    /// </summary>
    public async Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null)
    {
        try
        {
            // Limpar e normalizar o caminho da imagem
            var cleanImagePath = imagePath?.TrimStart('/').Replace("uploads/", "").Replace("\\", "/");
            if (string.IsNullOrEmpty(cleanImagePath))
            {
                throw new ArgumentException("Caminho da imagem inválido", nameof(imagePath));
            }
            
            var uploadsFolder = _configuration.GetValue<string>("ImageOptimization:UploadsFolder", "uploads");
            var basePath = Environment.CurrentDirectory;
            var uploadsBasePath = Path.Combine(basePath, uploadsFolder);
            var fullPath = Path.Combine(uploadsBasePath, cleanImagePath ?? string.Empty);
            
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException("Imagem não encontrada", imagePath);
            }

            var imageBytes = await File.ReadAllBytesAsync(fullPath);
            
            // Redimensionar se especificado
            if (maxWidth.HasValue || maxHeight.HasValue)
            {
                imageBytes = await ResizeImageBytesAsync(imageBytes, maxWidth, maxHeight);
            }

            return imageBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter imagem otimizada: {ImagePath}", imagePath);
            throw;
        }
    }

    /// <summary>
    /// Otimiza uma imagem a partir de bytes e retorna os bytes otimizados
    /// </summary>
    public async Task<ImageData> OptimizeImageToBytesAsync(byte[] imageBytes, string fileName = "image.jpg")
    {
        if (imageBytes == null || imageBytes.Length == 0)
        {
            _logger.LogWarning("Bytes de imagem vazios ou nulos recebidos");
            return new ImageData();
        }

        try
        {
            // Processar e otimizar a imagem
            using var image = Image.Load(imageBytes);
            
            // Redimensionar se necessário
            var resizedImage = ResizeImageIfNeeded(image);
            
            // Determinar formato de saída baseado no nome do arquivo
            var outputFormat = DetermineOutputFormat(fileName);
            
            // Converter para bytes otimizados
            var optimizedBytes = await ConvertImageToBytesAsync(resizedImage, outputFormat);
            
            // Determinar o tipo de conteúdo
            var contentType = GetContentType(outputFormat);
            
            _logger.LogInformation("Imagem otimizada para bytes: {FileName}, Tamanho original: {OriginalSize} bytes, Tamanho final: {FinalSize} bytes", 
                fileName, imageBytes.Length, optimizedBytes.Length);

            return new ImageData
            {
                Data = optimizedBytes,
                ContentType = contentType,
                FileName = fileName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao otimizar imagem para bytes: {FileName}", fileName);
            return new ImageData();
        }
    }

    /// <summary>
    /// Converte um IFormFile para bytes
    /// </summary>
    public async Task<byte[]> ConvertFormFileToBytesAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return Array.Empty<byte>();
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        return memoryStream.ToArray();
    }

    /// <summary>
    /// Redimensiona uma imagem em bytes
    /// </summary>
    public async Task<byte[]> ResizeImageBytesAsync(byte[] imageBytes, int? maxWidth = null, int? maxHeight = null)
    {
        try
        {
            using var image = Image.Load(imageBytes);
            
            // Redimensionar se especificado
            if (maxWidth.HasValue || maxHeight.HasValue)
            {
                var targetWidth = maxWidth ?? image.Width;
                var targetHeight = maxHeight ?? image.Height;
                
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(targetWidth, targetHeight),
                    Mode = ResizeMode.Max
                }));
            }

            using var memoryStream = new MemoryStream();
            await image.SaveAsync(memoryStream, new JpegEncoder { Quality = JpegQuality });
            return memoryStream.ToArray();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao redimensionar imagem em bytes");
            return imageBytes; // Retornar bytes originais em caso de erro
        }
    }

    private Image ResizeImageIfNeeded(Image image)
    {
        if (image == null)
        {
            throw new ArgumentNullException(nameof(image));
        }
        
        // Se a imagem for menor que o máximo, não redimensionar
        if (image.Width <= MaxWidth && image.Height <= MaxHeight)
        {
            return image;
        }

        // Calcular novas dimensões mantendo proporção
        var ratio = Math.Min((double)MaxWidth / image.Width, (double)MaxHeight / image.Height);
        var newWidth = (int)(image.Width * ratio);
        var newHeight = (int)(image.Height * ratio);

        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(newWidth, newHeight),
            Mode = ResizeMode.Max
        }));

        return image;
    }

    private async Task<byte[]> ConvertImageToBytesAsync(Image image, IImageFormat format)
    {
        if (image == null)
        {
            throw new ArgumentNullException(nameof(image));
        }
        
        IImageEncoder encoder = format switch
        {
            JpegFormat _ => new JpegEncoder { Quality = JpegQuality },
            PngFormat _ => new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression },
            WebpFormat _ => new WebpEncoder { Quality = JpegQuality },
            _ => new JpegEncoder { Quality = JpegQuality }
        };

        using var memoryStream = new MemoryStream();
        await image.SaveAsync(memoryStream, encoder);
        return memoryStream.ToArray();
    }

    private IImageFormat DetermineOutputFormat(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return JpegFormat.Instance; // Padrão se não houver nome de arquivo
        }
        
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".png" => PngFormat.Instance,
            ".webp" => WebpFormat.Instance,
            _ => JpegFormat.Instance // Padrão para jpg, jpeg e outros formatos
        };
    }

    private string GetContentType(IImageFormat format)
    {
        return format switch
        {
            JpegFormat _ => "image/jpeg",
            PngFormat _ => "image/png",
            WebpFormat _ => "image/webp",
            _ => "image/jpeg"
        };
    }

    private bool IsValidImageFile(IFormFile file)
    {
        if (file?.FileName == null || string.IsNullOrWhiteSpace(file.ContentType))
        {
            return false;
        }
        
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        return allowedExtensions.Contains(extension) && 
               file.ContentType.StartsWith("image/");
    }
}
