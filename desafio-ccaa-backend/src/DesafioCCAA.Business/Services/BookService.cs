using Microsoft.Extensions.Logging;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

using Microsoft.AspNetCore.Http;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookService(IBookRepository bookRepository, IUserRepository userRepository, ILogger<BookService> logger) : IBookService
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

            // Check if ISBN already exists
            var existingBooks = await bookRepository.GetAllAsync();
            if (existingBooks.Any(b => b.ISBN == createBookDto.ISBN))
            {
                return ServiceResult<BookResponseDto>.Failure("ISBN já está em uso");
            }

            var book = new Book
            {
                Title = createBookDto.Title,
                ISBN = createBookDto.ISBN,
                Genre = createBookDto.Genre,
                Author = createBookDto.Author,
                Publisher = createBookDto.Publisher,
                Synopsis = createBookDto.Synopsis,
                UserId = userId,
                PhotoPath = await SavePhotoAsync(photoFile)
            };

            var createdBook = await bookRepository.AddAsync(book);
            var bookResponse = MapToBookResponseDto(createdBook);

            logger.LogInformation("Livro criado com sucesso: {Title} por {UserId}", createBookDto.Title, userId);
            return ServiceResult<BookResponseDto>.Success(bookResponse);
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
            book.UpdatedAt = DateTime.UtcNow;

            if (photoFile is not null)
            {
                book.PhotoPath = await SavePhotoAsync(photoFile);
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

            var result = await bookRepository.DeleteAsync(bookId);
            if (result)
            {
                logger.LogInformation("Livro deletado com sucesso: {BookId} por {UserId}", bookId, userId);
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
            var books = await bookRepository.GetBooksByUserIdAsync(userId);
            if (!books.Any())
            {
                return ServiceResult<byte[]>.Failure("Nenhum livro encontrado para gerar relatório");
            }

            using var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

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
                // Create table
                var table = new Table(5)
                    .SetWidth(UnitValue.CreatePercentValue(100))
                    .SetMarginTop(10)
                    .SetMarginBottom(10);

                // Add headers
                table.AddHeaderCell(new Cell().Add(new Paragraph("Título").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("ISBN").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Autor").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Gênero").SetBold()));
                table.AddHeaderCell(new Cell().Add(new Paragraph("Editora").SetBold()));

                // Add data
                foreach (var book in books)
                {
                    table.AddCell(new Cell().Add(new Paragraph(book.Title)));
                    table.AddCell(new Cell().Add(new Paragraph(book.ISBN)));
                    table.AddCell(new Cell().Add(new Paragraph(book.Author)));
                    table.AddCell(new Cell().Add(new Paragraph(book.Genre.ToString())));
                    table.AddCell(new Cell().Add(new Paragraph(book.Publisher.ToString())));
                }

                document.Add(table);

                // Add summary
                var summary = new Paragraph($"Total de livros: {books.Count()}")
                    .SetFontSize(10);
                document.Add(summary);
            }

            document.Close();

            var pdfBytes = memoryStream.ToArray();
            logger.LogInformation("Relatório PDF gerado com sucesso para: {UserId}", userId);

            return ServiceResult<byte[]>.Success(pdfBytes);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao gerar relatório PDF para: {UserId}", userId);
            return ServiceResult<byte[]>.Failure("Erro interno ao gerar relatório");
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

    public async Task<List<CategoryDto>> GetCategoriesAsync()
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
                    Id = (int)genre, 
                    Name = genre.ToString() 
                });
            }
            
            logger.LogInformation("Categorias recuperadas com sucesso. Total: {Count}", categories.Count);
            return categories;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar categorias");
            return new List<CategoryDto>();
        }
    }

    private static async Task<string?> SavePhotoAsync(IFormFile? photoFile)
    {
        if (photoFile is null || photoFile.Length == 0)
            return null;

        try
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);
            await photoFile.CopyToAsync(fileStream);

            return $"/uploads/{uniqueFileName}";
        }
        catch (Exception)
        {
            // Log error if logger was available
            return null;
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
            PhotoPath = book.PhotoPath,
            CreatedAt = book.CreatedAt,
            UpdatedAt = book.UpdatedAt,
            UserId = book.UserId,
            UserFullName = book.User?.FullName ?? string.Empty
        };
}
