using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookService(
    IBookRepository bookRepository, 
    IUserRepository userRepository, 
    IImageOptimizationService imageService,
    ILogger<BookService> logger) : IBookCrudService
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


}
