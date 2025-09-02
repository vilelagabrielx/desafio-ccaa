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
    
    // Resumo do livro obtido via API do OpenLibrary
    public string? Summary { get; set; }
    
    // Campos para armazenar a imagem no banco de dados
    public byte[]? PhotoBytes { get; set; }
    public string? PhotoContentType { get; set; }
    
    // URL da capa original do OpenLibrary (para livros criados via ISBN)
    public string? CoverUrl { get; set; }

    
    // Campo legado para compatibilidade (será removido em futuras versões)
    public string? PhotoPath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
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
    // Editoras Internacionais Principais
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
    
    // Editoras Brasileiras
    CompanhiaDasLetras,
    Record,
    Rocco,
    Globo,
    Sextante,
    Planeta,
    Leya,
    Intrinseca,
    Objetiva,
    NovaFronteira,
    BertrandBrasil,
    Zahar,
    MartinsFontes,
    Atual,
    Moderna,
    FTD,
    Scipione,
    Saraiva,
    Melhoramentos,
    CirandaCultural,
    
    // Editoras Internacionais Adicionais
    Norton,
    OxfordUniversityPress,
    CambridgeUniversityPress,
    MITPress,
    PrincetonUniversityPress,
    YaleUniversityPress,
    HarvardUniversityPress,
    StanfordUniversityPress,
    UniversityOfChicagoPress,
    ColumbiaUniversityPress,
    BasicBooks,
    PublicAffairs,
    GrovePress,
    NewDirections,
    CityLights,
    GraywolfPress,
    CoffeeHousePress,
    TinHouse,
    McSweeneys,
    AkashicBooks,
    
    // Editoras de Gêneros Específicos
    TorBooks,
    Orbit,
    BaenBooks,
    DAW,
    Ace,
    Roc,
    DelRey,
    Gollancz,
    AngryRobot,
    Solaris,
    
    // Editoras Acadêmicas e Técnicas
    Springer,
    Wiley,
    Elsevier,
    Routledge,
    Sage,
    PalgraveMacmillan,
    BloomsburyAcademic,
    UniversityOfCaliforniaPress,
    JohnsHopkinsUniversityPress,
    CornellUniversityPress,
    
    // Editoras Independentes e Alternativas
    SevenStoriesPress,
    HaymarketBooks,
    Verso,
    MonthlyReviewPress,
    AKPress,
    PMPress,
    MicrocosmPublishing,
    SoftSkullPress,
    MelvilleHouse,
    EuropaEditions,
    
    // Editoras de Livros Infantis e Juvenis
    CandlewickPress,
    ChronicleBooks,
    Abrams,
    Phaidon,
    Taschen,
    ThamesHudson,
    Prestel,
    Rizzoli,
    Assouline,
    Gestalten,
    
    Other
}
