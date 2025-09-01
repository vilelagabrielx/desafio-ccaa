using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

using Microsoft.AspNetCore.Http;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookService(
    IBookRepository bookRepository, 
    IUserRepository userRepository, 
    IImageOptimizationService imageService,
    IOpenLibraryService openLibraryService,
    ILogger<BookService> logger) : IBookService
{
    public async Task<ServiceResult<BookResponseDto>> CreateBookAsync(string userId, CreateBookDto createBookDto, IFormFile? photoFile)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Usuário não encontrado");
            }

            // Check if ISBN already exists (only active books since we now do hard delete)
            var existingBook = await bookRepository.GetByISBNAsync(createBookDto.ISBN);
            if (existingBook != null)
            {
                return ServiceResult<BookResponseDto>.Failure($"Já existe um livro com o ISBN {createBookDto.ISBN}");
            }

            var book = new Book
            {
                Title = createBookDto.Title,
                ISBN = createBookDto.ISBN,
                Genre = createBookDto.Genre,
                Author = createBookDto.Author,
                Publisher = createBookDto.Publisher,
                Synopsis = createBookDto.Synopsis,
                Summary = createBookDto.Summary, // Resumo do livro
                UserId = userId
            };

            // Processar foto se fornecida
            if (photoFile != null)
            {
                var imageData = await imageService.OptimizeImageToBytesAsync(photoFile);
                if (imageData.Data.Length > 0)
                {
                    book.PhotoBytes = imageData.Data;
                    book.PhotoContentType = imageData.ContentType;
                }
            }

            var createdBook = await bookRepository.AddAsync(book);
            var bookResponse = MapToBookResponseDto(createdBook);

            logger.LogInformation("Livro criado com sucesso: {Title} por {UserId}", createBookDto.Title, userId);
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message?.Contains("duplicate key value violates unique constraint") == true)
        {
            logger.LogWarning(dbEx, "Tentativa de criar livro com ISBN duplicado: {Title} - {ISBN} por {UserId}", createBookDto.Title, createBookDto.ISBN, userId);
            
            // Check if this is specifically an ISBN constraint violation
            if (dbEx.InnerException?.Message?.Contains("IX_Books_ISBN") == true)
            {
                return ServiceResult<BookResponseDto>.Failure($"O ISBN {createBookDto.ISBN} já está em uso. Por favor, use um ISBN diferente.");
            }
            
            return ServiceResult<BookResponseDto>.Failure($"Erro de duplicação: {createBookDto.ISBN}. Por favor, use um ISBN diferente.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao criar livro: {Title} por {UserId}", createBookDto.Title, userId);
            return ServiceResult<BookResponseDto>.Failure("Erro interno ao criar livro");
        }
    }

    public async Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId)
    {
        try
        {
            var book = await bookRepository.GetByIdAsync(bookId);
            if (book is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Livro não encontrado");
            }

            var bookResponse = MapToBookResponseDto(book);
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar livro: {BookId}", bookId);
            return ServiceResult<BookResponseDto>.Failure("Erro interno ao buscar livro");
        }
    }

    public async Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId, string userId)
    {
        try
        {
            var book = await bookRepository.GetByIdAsync(bookId);
            if (book is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Livro não encontrado");
            }

            if (book.UserId != userId)
            {
                return ServiceResult<BookResponseDto>.Failure("Acesso negado");
            }

            var bookResponse = MapToBookResponseDto(book);
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar livro: {BookId} por {UserId}", bookId, userId);
            return ServiceResult<BookResponseDto>.Failure("Erro interno ao buscar livro");
        }
    }

    public async Task<ServiceResult<List<BookResponseDto>>> GetBooksByUserIdAsync(string userId)
    {
        try
        {
            var books = await bookRepository.GetByUserIdAsync(userId);
            var bookResponses = books.Select(MapToBookResponseDto).ToList();

            return ServiceResult<List<BookResponseDto>>.Success(bookResponses);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar livros do usuário: {UserId}", userId);
            return ServiceResult<List<BookResponseDto>>.Failure("Erro interno ao buscar livros");
        }
    }

    public async Task<ServiceResult<BookSearchResultDto>> SearchBooksAsync(BookSearchDto searchDto)
    {
        try
        {
            var books = await bookRepository.SearchAsync(searchDto);
            var totalCount = await bookRepository.GetTotalCountAsync(searchDto);
            var totalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize);

            var bookResponses = books.Select(MapToBookResponseDto).ToList();

            var result = new BookSearchResultDto
            {
                Books = bookResponses,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize,
                TotalPages = totalPages
            };

            return ServiceResult<BookSearchResultDto>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar livros");
            return ServiceResult<BookSearchResultDto>.Failure("Erro interno ao buscar livros");
        }
    }

    public async Task<ServiceResult<BookResponseDto>> UpdateBookAsync(int bookId, string userId, UpdateBookDto updateBookDto, IFormFile? photoFile)
    {
        try
        {
            var book = await bookRepository.GetByIdAsync(bookId);
            if (book is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Livro não encontrado");
            }

            if (book.UserId != userId)
            {
                return ServiceResult<BookResponseDto>.Failure("Acesso negado");
            }

            // Check if ISBN already exists (excluding current book)
            var existingBooks = await bookRepository.GetAllAsync();
            if (existingBooks.Any(b => b.ISBN == updateBookDto.ISBN && b.Id != bookId))
            {
                return ServiceResult<BookResponseDto>.Failure("ISBN já está em uso");
            }

            book.Title = updateBookDto.Title;
            book.ISBN = updateBookDto.ISBN;
            book.Genre = updateBookDto.Genre;
            book.Author = updateBookDto.Author;
            book.Publisher = updateBookDto.Publisher;
            book.Synopsis = updateBookDto.Synopsis;
            book.Summary = updateBookDto.Summary; // Atualizar o resumo do livro
            book.UpdatedAt = DateTime.UtcNow;

            if (photoFile is not null)
            {
                // Processar e salvar a nova imagem no banco
                var imageData = await imageService.OptimizeImageToBytesAsync(photoFile);
                if (imageData.Data.Length > 0)
                {
                    book.PhotoBytes = imageData.Data;
                    book.PhotoContentType = imageData.ContentType;
                }
                
                // Limpar campos legados
                book.PhotoPath = null;
            }

            var updatedBook = await bookRepository.UpdateAsync(book);
            var bookResponse = MapToBookResponseDto(updatedBook);

            logger.LogInformation("Livro atualizado com sucesso: {Title} por {UserId}", updateBookDto.Title, userId);
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao atualizar livro: {BookId} por {UserId}", bookId, userId);
            return ServiceResult<BookResponseDto>.Failure("Erro interno ao atualizar livro");
        }
    }

    public async Task<ServiceResult<bool>> DeleteBookAsync(int bookId, string userId)
    {
        try
        {
            var book = await bookRepository.GetByIdAsync(bookId);
            if (book is null)
            {
                return ServiceResult<bool>.Failure("Livro não encontrado");
            }

            if (book.UserId != userId)
            {
                return ServiceResult<bool>.Failure("Acesso negado");
            }

            // Deletar o livro fisicamente por ISBN
            var result = await bookRepository.DeleteByIsbnAsync(book.ISBN);
            if (result)
            {
                logger.LogInformation("Livro deletado fisicamente por ISBN: {ISBN} ({Title}) por {UserId}", 
                    book.ISBN, book.Title, userId);
            }

            return ServiceResult<bool>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao deletar livro: {BookId} por {UserId}", bookId, userId);
            return ServiceResult<bool>.Failure("Erro interno ao deletar livro");
        }
    }

    public async Task<ServiceResult<byte[]>> GenerateBooksReportPdfAsync(string userId)
    {
        try
        {
            logger.LogInformation("Iniciando geração de relatório PDF para usuário: {UserId}", userId);
            
            var books = await bookRepository.GetBooksByUserIdAsync(userId);
            logger.LogInformation("Encontrados {Count} livros para o usuário {UserId}", books.Count(), userId);
            
            if (!books.Any())
            {
                logger.LogWarning("Nenhum livro encontrado para gerar relatório para usuário: {UserId}", userId);
                return ServiceResult<byte[]>.Failure("Você ainda não possui livros cadastrados. Adicione alguns livros à sua biblioteca antes de gerar o relatório.");
            }

            logger.LogInformation("Criando PDF para {Count} livros", books.Count());
            
            using var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            logger.LogInformation("Adicionando título ao PDF");
            
            // Add title
            var title = new Paragraph("Relatório de Livros")
                .SetFontSize(16)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER);
            document.Add(title);

            // Add subtitle
            var subtitle = new Paragraph($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm:ss}")
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.CENTER);
            document.Add(subtitle);

            if (!books.Any())
            {
                var noBooks = new Paragraph("Nenhum livro encontrado.")
                    .SetFontSize(10);
                document.Add(noBooks);
            }
            else
            {
                logger.LogInformation("Criando tabela com {Count} livros", books.Count());
                
                // Create table
                var table = new Table(5)
                    .SetWidth(UnitValue.CreatePercentValue(100))
                    .SetMarginTop(10)
                    .SetMarginBottom(10);

                logger.LogInformation("Adicionando cabeçalhos da tabela");
                
                // Add headers
                table.AddHeaderCell(new Cell().Add(new Paragraph("Título").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("ISBN").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Autor").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Gênero").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Editora").SetBold()));

                // Add data
                logger.LogInformation("Adicionando dados dos livros à tabela");
                foreach (var book in books)
                {
                    try
                    {
                        logger.LogDebug("Adicionando livro: {Title} - {ISBN}", book.Title, book.ISBN);
                        table.AddCell(new Cell().Add(new Paragraph(book.Title ?? "N/A")));
                        table.AddCell(new Cell().Add(new Paragraph(book.ISBN ?? "N/A")));
                        table.AddCell(new Cell().Add(new Paragraph(book.Author ?? "N/A")));
                        table.AddCell(new Cell().Add(new Paragraph(book.Genre.ToString())));
                        table.AddCell(new Cell().Add(new Paragraph(book.Publisher.ToString())));
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Erro ao adicionar livro {Title} à tabela: {Message}", book.Title, ex.Message);
                        throw;
                    }
                }

                logger.LogInformation("Adicionando tabela ao documento");
                document.Add(table);

                // Add summary
                var summary = new Paragraph($"Total de livros: {books.Count()}")
                    .SetFontSize(10);
                document.Add(summary);
            }

            logger.LogInformation("Fechando documento PDF");
            document.Close();

            var pdfBytes = memoryStream.ToArray();
            logger.LogInformation("Relatório PDF gerado com sucesso para: {UserId}. Tamanho: {Size} bytes", userId, pdfBytes.Length);

            return ServiceResult<byte[]>.Success(pdfBytes);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao gerar relatório PDF para: {UserId}. Detalhes: {Message}", userId, ex.Message);
            logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            return ServiceResult<byte[]>.Failure($"Erro interno ao gerar relatório: {ex.Message}");
        }
    }

    public async Task<List<BookResponseDto>> GetAllBooksAsync()
    {
        try
        {
            var books = await bookRepository.GetAllAsync();
            var bookResponses = books.Select(MapToBookResponseDto).ToList();
            
            logger.LogInformation("Todos os livros recuperados com sucesso. Total: {Count}", bookResponses.Count);
            return bookResponses;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar todos os livros");
            return new List<BookResponseDto>();
        }
    }

    public Task<List<CategoryDto>> GetCategoriesAsync()
    {
        try
        {
            var categories = new List<CategoryDto>();
            var genreValues = Enum.GetValues<BookGenre>();
            
            for (int i = 0; i < genreValues.Length; i++)
            {
                var genre = genreValues[i];
                categories.Add(new CategoryDto 
                { 
                    Id = i + 1, // ID único começando de 1
                    Name = genre.ToString() 
                });
            }
            
            logger.LogInformation("Categorias recuperadas com sucesso. Total: {Count}", categories.Count);
            return Task.FromResult(categories);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar categorias");
            return Task.FromResult(new List<CategoryDto>());
        }
    }

    public async Task<List<CategoryWithCountDto>> GetCategoriesWithCountAsync()
    {
        try
        {
            var categories = new List<CategoryWithCountDto>();
            var genreValues = Enum.GetValues<BookGenre>();
            
            // Obter todos os livros para calcular contagens
            var allBooks = (await bookRepository.GetAllAsync()).ToList();
            
            // Usar IDs únicos começando de 1 para evitar conflito com "Todas as Categorias"
            for (int i = 0; i < genreValues.Length; i++)
            {
                var genre = genreValues[i];
                var count = allBooks.Count(book => book.Genre == genre);
                
                categories.Add(new CategoryWithCountDto 
                { 
                    Id = i + 1, // ID único começando de 1
                    Name = genre.ToString(),
                    Count = count
                });
            }
            
            // Adicionar "Todas as Categorias" no início com ID único
            var allCategories = new List<CategoryWithCountDto>
            {
                new CategoryWithCountDto
                {
                    Id = 0, // ID único para "Todas as Categorias"
                    Name = "Todas as Categorias",
                    Count = allBooks.Count
                }
            };
            
            allCategories.AddRange(categories);
            
            // Ordenar categorias por contagem decrescente (mais livros primeiro)
            // "Todas as Categorias" sempre fica no topo
            var sortedCategories = allCategories
                .OrderByDescending(c => c.Count)
                .ToList();
            
            logger.LogInformation("Categorias com contagem ordenadas por quantidade. Total: {Count}", sortedCategories.Count);
            return sortedCategories;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar categorias com contagem");
            return new List<CategoryWithCountDto>();
        }
    }

    public async Task<byte[]> GetOptimizedImageAsync(string imagePath, int? maxWidth = null, int? maxHeight = null)
    {
        try
        {
            return await imageService.GetOptimizedImageAsync(imagePath, maxWidth, maxHeight);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter imagem otimizada: {ImagePath}", imagePath);
            throw;
        }
    }

    public async Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn)
    {
        try
        {
            logger.LogInformation("Iniciando busca por ISBN: {ISBN}", isbn);
            
            var result = await openLibraryService.SearchBookByIsbnAsync(isbn);
            
            if (!result.IsSuccess)
            {
                logger.LogWarning("Falha na busca por ISBN {ISBN}: {ErrorMessage}", isbn, result.ErrorMessage);
                return ServiceResult<BookFromIsbnDto?>.Failure(result.ErrorMessage ?? "Erro desconhecido na busca por ISBN");
            }

            logger.LogInformation("Busca por ISBN {ISBN} concluída com sucesso", isbn);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro interno ao buscar livro por ISBN: {ISBN}", isbn);
            return ServiceResult<BookFromIsbnDto?>.Failure("Erro interno ao buscar livro por ISBN");
        }
    }

    public async Task<ServiceResult<BookResponseDto>> CreateBookFromIsbnAsync(string userId, CreateBookFromIsbnDto createBookDto)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<BookResponseDto>.Failure("Usuário não encontrado");
            }

            // Buscar livro na API do OpenLibrary
            var openLibraryResult = await openLibraryService.SearchBookByIsbnAsync(createBookDto.ISBN);
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
            var existingBooks = await bookRepository.GetAllAsync();
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
                    var coverImageBytes = await openLibraryService.DownloadCoverImageAsync(bookData.CoverUrl);
                    if (coverImageBytes != null)
                    {
                        // Otimizar a imagem baixada
                        var imageData = await imageService.OptimizeImageToBytesAsync(coverImageBytes, $"cover_{bookData.ISBN}.jpg");
                        photoBytes = imageData.Data;
                        photoContentType = imageData.ContentType;
                        logger.LogInformation("Imagem de capa baixada e otimizada para ISBN {ISBN}", bookData.ISBN);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Erro ao baixar imagem de capa para ISBN {ISBN}, continuando sem imagem", bookData.ISBN);
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
                Summary = bookData.Summary, // Resumo obtido via API do OpenLibrary
                UserId = userId,
                CoverUrl = bookData.CoverUrl // Salvar a URL da capa do OpenLibrary
            };

            // Adicionar foto se baixada
            if (photoBytes != null && photoContentType != null)
            {
                book.PhotoBytes = photoBytes;
                book.PhotoContentType = photoContentType;

            }

            var createdBook = await bookRepository.AddAsync(book);
            var bookResponse = MapToBookResponseDto(createdBook);

            logger.LogInformation("Livro criado com sucesso a partir do ISBN: {Title} ({ISBN}) por {UserId}", 
                bookData.Title, bookData.ISBN, userId);
            
            return ServiceResult<BookResponseDto>.Success(bookResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao criar livro a partir do ISBN: {ISBN} por {UserId}", createBookDto.ISBN, userId);
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
            Summary = book.Summary, // Resumo do livro obtido via API do OpenLibrary
            PhotoUrl = book.PhotoBytes != null ? $"/api/book/photo/{book.Id}" : book.CoverUrl, // Priorizar imagem local, fallback para URL do OpenLibrary
            PhotoPath = book.PhotoPath, // Campo legado para compatibilidade
            PhotoBytes = book.PhotoBytes,
            PhotoContentType = book.PhotoContentType,
            PhotoDataUrl = book.PhotoBytes != null ? $"data:{book.PhotoContentType ?? "image/jpeg"};base64,{Convert.ToBase64String(book.PhotoBytes)}" : null,
            CreatedAt = book.CreatedAt,
            UpdatedAt = book.UpdatedAt,
            UserId = book.UserId,
            UserFullName = book.User?.FullName ?? string.Empty
        };

    /// <summary>
    /// Redimensiona a foto de um livro
    /// </summary>
    public async Task<byte[]> ResizeBookPhotoAsync(int bookId, int? width, int? height)
    {
        try
        {
            var book = await bookRepository.GetByIdAsync(bookId);
            if (book?.PhotoBytes == null || book.PhotoBytes.Length == 0)
            {
                throw new InvalidOperationException("Livro não possui foto");
            }

            // Redimensionar a imagem usando o ImageOptimizationService
            var resizedBytes = await imageService.ResizeImageBytesAsync(book.PhotoBytes, width, height);
            return resizedBytes;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao redimensionar foto do livro: {BookId}", bookId);
            throw;
        }
    }
}
