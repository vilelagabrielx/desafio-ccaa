using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> AddAsync(User entity);
    Task<User> UpdateAsync(User entity);
    Task<bool> DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByEmailWithBooksAsync(string email);
    Task<bool> EmailExistsAsync(string email);
}

public interface IBookRepository : IRepository<Book>
{
    Task<IEnumerable<Book>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Book>> GetBooksByUserIdAsync(string userId);
    Task<IEnumerable<Book>> GetBooksByUserIdPaginatedAsync(string userId, int page, int pageSize);
    Task<int> GetBooksCountByUserIdAsync(string userId);
    Task<IEnumerable<Book>> SearchAsync(BookSearchDto searchDto);
    Task<int> GetTotalCountAsync(BookSearchDto searchDto);
    Task<Book?> GetByIdWithUserAsync(int id);
    Task<Book?> GetByISBNAsync(string isbn);
    Task<bool> DeleteByIsbnAsync(string isbn);
}
