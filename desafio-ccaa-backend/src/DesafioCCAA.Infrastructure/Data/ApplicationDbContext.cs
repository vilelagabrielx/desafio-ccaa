using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DesafioCCAA.Business.Entities;

namespace DesafioCCAA.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    private string? _databaseProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        // Database provider will be detected lazily when needed
    }

    public DbSet<Book> Books { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Book entity configuration
        builder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ISBN).IsRequired().HasMaxLength(13);
            entity.Property(e => e.Genre).IsRequired();
            entity.Property(e => e.Author).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Publisher).IsRequired();
            entity.Property(e => e.Synopsis).IsRequired().HasMaxLength(5000);
            entity.Property(e => e.Summary).HasMaxLength(10000); // Resumo pode ser mais longo que a sinopse
            
            // Configuração para as novas propriedades de imagem
            ConfigureImageProperties(entity);
            entity.Property(e => e.PhotoContentType).HasMaxLength(100);

            
            // Campo legado para compatibilidade
            entity.Property(e => e.PhotoPath).HasMaxLength(500);
            
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt);
            entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);

            // Relationships
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Books)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            ConfigureIndexes(entity);
        });

        // User entity configuration
        builder.Entity<User>(entity =>
        {
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.DateOfBirth).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt);
            entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);

            // Indexes
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }

    /// <summary>
    /// Configura propriedades de imagem baseado no provider do banco
    /// </summary>
    private void ConfigureImageProperties(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Book> entity)
    {
        if (IsPostgreSQL())
        {
            entity.Property(e => e.PhotoBytes).HasColumnType("bytea");
        }
        else if (IsSQLServer())
        {
            entity.Property(e => e.PhotoBytes).HasColumnType("varbinary(max)");
        }
        else
        {
            // Deixar o EF Core decidir automaticamente
            entity.Property(e => e.PhotoBytes);
        }
    }

    /// <summary>
    /// Configura índices baseado no provider do banco
    /// </summary>
    private void ConfigureIndexes(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Book> entity)
    {
        // Índice único para ISBN ativo
        var isbnIndex = entity.HasIndex(e => new { e.ISBN, e.IsActive }).IsUnique();
        
        if (IsPostgreSQL())
        {
            // PostgreSQL suporta filtros de índice
            isbnIndex.HasFilter("\"IsActive\" = true");
        }
        // SQL Server não suporta filtros de índice da mesma forma, então usamos apenas o índice composto

        // Outros índices
        entity.HasIndex(e => e.Title);
        entity.HasIndex(e => e.Author);
        entity.HasIndex(e => e.Genre);
        entity.HasIndex(e => e.Publisher);
        entity.HasIndex(e => e.UserId);
    }

    /// <summary>
    /// Verifica se está usando PostgreSQL
    /// </summary>
    private bool IsPostgreSQL()
    {
        var provider = GetDatabaseProvider();
        return provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Verifica se está usando SQL Server
    /// </summary>
    private bool IsSQLServer()
    {
        var provider = GetDatabaseProvider();
        return provider.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) ||
               provider.Contains("Microsoft.Data.SqlClient", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Obtém o provider do banco de dados de forma lazy
    /// </summary>
    private string GetDatabaseProvider()
    {
        if (_databaseProvider == null)
        {
            try
            {
                _databaseProvider = Database.ProviderName ?? "";
            }
            catch
            {
                // Se não conseguir acessar o Database.ProviderName, usar string vazia
                _databaseProvider = "";
            }
        }
        return _databaseProvider;
    }
}
