using Microsoft.EntityFrameworkCore.Storage;

namespace DesafioCCAA.Business.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IBookRepository Books { get; }
    
    Task<int> SaveChangesAsync();
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
    Task<bool> SaveChangesWithTransactionAsync();
}
