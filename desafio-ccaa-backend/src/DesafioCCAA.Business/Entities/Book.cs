namespace DesafioCCAA.Business.Entities;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public BookGenre Genre { get; set; }
    public string Author { get; set; } = string.Empty;
    public BookPublisher Publisher { get; set; }
    public string Synopsis { get; set; } = string.Empty;
    
    // Campos para armazenar a imagem no banco de dados
    public byte[]? PhotoBytes { get; set; }
    public string? PhotoContentType { get; set; }
    
    // URL da capa original do OpenLibrary (para livros criados via ISBN)
    public string? CoverUrl { get; set; }

    
    // Campo legado para compatibilidade (será removido em futuras versões)
    public string? PhotoPath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Foreign key
    public string UserId { get; set; } = string.Empty;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
}

public enum BookGenre
{
    Fiction,
    NonFiction,
    Mystery,
    Romance,
    ScienceFiction,
    Fantasy,
    Horror,
    Thriller,
    Biography,
    History,
    Science,
    Technology,
    Philosophy,
    Religion,
    SelfHelp,
    Business,
    Economics,
    Politics,
    Travel,
    Cookbook,
    Poetry,
    Drama,
    Other
}

public enum BookPublisher
{
    PenguinRandomHouse,
    HarperCollins,
    SimonSchuster,
    HachetteBookGroup,
    Macmillan,
    Scholastic,
    Bloomsbury,
    FaberFaber,
    Vintage,
    Anchor,
    Doubleday,
    Knopf,
    Crown,
    Ballantine,
    Bantam,
    Dell,
    Other
}
