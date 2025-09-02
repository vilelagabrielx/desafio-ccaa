using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Infrastructure.Data;
using DesafioCCAA.Infrastructure.Repositories;

namespace DesafioCCAA.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UnitOfWork> _logger;
    private IDbContextTransaction? _transaction;
    
    private IUserRepository? _users;
    private IBookRepository? _books;

    public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IBookRepository Books => _books ??= new BookRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        try
        {
            _logger.LogInformation("Salvando alterações no banco de dados");
            return await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar alterações no banco de dados");
            throw;
        }
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        try
        {
            _logger.LogInformation("Iniciando transação");
            _transaction = await _context.Database.BeginTransactionAsync();
            return _transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao iniciar transação");
            throw;
        }
    }

    public async Task CommitTransactionAsync()
    {
        try
        {
            if (_transaction != null)
            {
                _logger.LogInformation("Commitando transação");
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao commitar transação");
            throw;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        try
        {
            if (_transaction != null)
            {
                _logger.LogInformation("Fazendo rollback da transação");
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer rollback da transação");
            throw;
        }
    }

    public async Task<bool> SaveChangesWithTransactionAsync()
    {
        try
        {
            using var transaction = await BeginTransactionAsync();
            var result = await SaveChangesAsync();
            await CommitTransactionAsync();
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar com transação");
            await RollbackTransactionAsync();
            return false;
        }
    }

    public void Dispose()
    {
        try
        {
            _transaction?.Dispose();
            _context.Dispose();
            _logger.LogInformation("UnitOfWork disposed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer dispose do UnitOfWork");
        }
    }
}
