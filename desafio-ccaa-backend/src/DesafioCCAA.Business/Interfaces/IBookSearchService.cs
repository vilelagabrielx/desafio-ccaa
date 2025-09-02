using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

/// <summary>
/// Interface para busca de livros em APIs externas
/// </summary>
public interface IBookSearchService
{
    Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn);
    Task<ServiceResult<BookResponseDto>> CreateBookFromIsbnAsync(string userId, CreateBookFromIsbnDto createBookDto);
}
