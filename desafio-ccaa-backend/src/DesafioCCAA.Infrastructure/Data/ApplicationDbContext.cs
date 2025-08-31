using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DesafioCCAA.Business.Entities;

namespace DesafioCCAA.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
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
            
            // Configuração para as novas propriedades de imagem
            entity.Property(e => e.PhotoBytes).HasColumnType("bytea"); // PostgreSQL para dados binários
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
            entity.HasIndex(e => new { e.ISBN, e.IsActive })
                  .HasFilter("\"IsActive\" = true")
                  .IsUnique();
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.Author);
            entity.HasIndex(e => e.Genre);
            entity.HasIndex(e => e.Publisher);
            entity.HasIndex(e => e.UserId);
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
}
