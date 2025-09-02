using Microsoft.AspNetCore.Http;
using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

/// <summary>
/// Interface para operações CRUD básicas de livros
/// </summary>
public interface IBookCrudService
{
    Task<ServiceResult<BookResponseDto>> CreateBookAsync(string userId, CreateBookDto createBookDto, IFormFile? photoFile);
    Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId);
    Task<ServiceResult<BookResponseDto>> GetBookByIdAsync(int bookId, string userId);
    Task<ServiceResult<List<BookResponseDto>>> GetBooksByUserIdAsync(string userId);
    Task<ServiceResult<BookSearchResultDto>> SearchBooksAsync(BookSearchDto searchDto);
    Task<ServiceResult<BookResponseDto>> UpdateBookAsync(int bookId, string userId, UpdateBookDto updateBookDto, IFormFile? photoFile);
    Task<ServiceResult<bool>> DeleteBookAsync(int bookId, string userId);
    Task<List<BookResponseDto>> GetAllBooksAsync();
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<List<CategoryWithCountDto>> GetCategoriesWithCountAsync();
    Task<List<CategoryWithCountDto>> GetCategoriesWithCountByUserIdAsync(string userId);
}
