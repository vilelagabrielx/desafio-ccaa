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

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByEmailWithBooksAsync(string email);
    Task<bool> EmailExistsAsync(string email);
}

public interface IBookRepository : IRepository<Book>
{
    Task<IEnumerable<Book>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Book>> SearchAsync(BookSearchDto searchDto);
    Task<int> GetTotalCountAsync(BookSearchDto searchDto);
    Task<Book?> GetByIdWithUserAsync(int id);
}
