using Microsoft.EntityFrameworkCore;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Infrastructure.Data;

namespace DesafioCCAA.Infrastructure.Repositories;

public class BookRepository : IBookRepository
{
    private readonly ApplicationDbContext _context;

    public BookRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        return await _context.Books
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
    }

    public async Task<IEnumerable<Book>> GetAllAsync()
    {
        return await _context.Books
            .Include(b => b.User)
            .Where(b => b.IsActive)
            .ToListAsync();
    }

    public async Task<Book> AddAsync(Book entity)
    {
        _context.Books.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Book> UpdateAsync(Book entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Books.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return false;

        // Hard delete - remover fisicamente o registro
        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Remove fisicamente um livro por ISBN
    /// </summary>
    public async Task<bool> DeleteByIsbnAsync(string isbn)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == isbn);
        if (book == null) return false;

        // Hard delete - remover fisicamente o registro
        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Books.AnyAsync(b => b.Id == id && b.IsActive);
    }

    public async Task<IEnumerable<Book>> GetByUserIdAsync(string userId)
    {
        return await _context.Books
            .Include(b => b.User)
            .Where(b => b.UserId == userId && b.IsActive)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Book?> GetByISBNAsync(string isbn)
    {
        return await _context.Books
            .FirstOrDefaultAsync(b => b.ISBN == isbn);
    }

    public async Task<bool> CleanupDuplicateISBNsAsync()
    {
        try
        {
            // Encontrar ISBNs duplicados
            var duplicateISBNs = await _context.Books
                .Where(b => b.IsActive)
                .GroupBy(b => b.ISBN)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToListAsync();

            foreach (var isbn in duplicateISBNs)
            {
                // Manter apenas o primeiro livro com cada ISBN
                var booksWithISBN = await _context.Books
                    .Where(b => b.ISBN == isbn && b.IsActive)
                    .OrderBy(b => b.CreatedAt)
                    .ToListAsync();

                // Marcar todos exceto o primeiro como inativos
                for (int i = 1; i < booksWithISBN.Count; i++)
                {
                    booksWithISBN[i].IsActive = false;
                    booksWithISBN[i].UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<IEnumerable<Book>> GetBooksByUserIdAsync(string userId)
    {
        return await _context.Books
            .Include(b => b.User)
            .Where(b => b.UserId == userId && b.IsActive)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Book>> SearchAsync(BookSearchDto searchDto)
    {
        var query = _context.Books
            .Include(b => b.User)
            .Where(b => b.IsActive);

        if (!string.IsNullOrWhiteSpace(searchDto.Title))
            query = query.Where(b => b.Title.Contains(searchDto.Title));

        if (!string.IsNullOrWhiteSpace(searchDto.ISBN))
            query = query.Where(b => b.ISBN.Contains(searchDto.ISBN));

        if (!string.IsNullOrWhiteSpace(searchDto.Author))
            query = query.Where(b => b.Author.Contains(searchDto.Author));

        if (searchDto.Genre.HasValue)
            query = query.Where(b => b.Genre == searchDto.Genre.Value);

        if (searchDto.Publisher.HasValue)
            query = query.Where(b => b.Publisher == searchDto.Publisher.Value);

        return await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((searchDto.Page - 1) * searchDto.PageSize)
            .Take(searchDto.PageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(BookSearchDto searchDto)
    {
        var query = _context.Books.Where(b => b.IsActive);

        if (!string.IsNullOrWhiteSpace(searchDto.Title))
            query = query.Where(b => b.Title.Contains(searchDto.Title));

        if (!string.IsNullOrWhiteSpace(searchDto.ISBN))
            query = query.Where(b => b.ISBN.Contains(searchDto.ISBN));

        if (!string.IsNullOrWhiteSpace(searchDto.Author))
            query = query.Where(b => b.Author.Contains(searchDto.Author));

        if (searchDto.Genre.HasValue)
            query = query.Where(b => b.Genre == searchDto.Genre.Value);

        if (searchDto.Publisher.HasValue)
            query = query.Where(b => b.Publisher == searchDto.Publisher.Value);

        return await query.CountAsync();
    }

    public async Task<Book?> GetByIdWithUserAsync(int id)
    {
        return await _context.Books
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
    }
}
