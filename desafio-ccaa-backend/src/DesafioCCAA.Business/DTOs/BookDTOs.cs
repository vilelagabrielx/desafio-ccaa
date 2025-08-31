using DesafioCCAA.Business.Entities;

namespace DesafioCCAA.Business.DTOs;

public record CreateBookDto
{
    public string Title { get; init; } = string.Empty;
    public string ISBN { get; init; } = string.Empty;
    public BookGenre Genre { get; init; }
    public string Author { get; init; } = string.Empty;
    public BookPublisher Publisher { get; init; }
    public string Synopsis { get; init; } = string.Empty;
    public string? Summary { get; init; }
}

public record UpdateBookDto
{
    public string Title { get; init; } = string.Empty;
    public string ISBN { get; init; } = string.Empty;
    public BookGenre Genre { get; init; }
    public string Author { get; init; } = string.Empty;
    public BookPublisher Publisher { get; init; }
    public string Synopsis { get; init; } = string.Empty;
    public string? Summary { get; init; }
}

public record BookResponseDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ISBN { get; init; } = string.Empty;
    public BookGenre Genre { get; init; }
    public string Author { get; init; } = string.Empty;
    public BookPublisher Publisher { get; init; }
    public string Synopsis { get; init; } = string.Empty;
    public string? Summary { get; init; }
    
    // URL para acessar a foto do livro
    public string? PhotoUrl { get; init; }
    
    // Campo legado para compatibilidade
    public string? PhotoPath { get; init; }
    
    // Bytes da imagem (não incluído na serialização por padrão)
    public byte[]? PhotoBytes { get; init; }
    
    // Tipo de conteúdo da imagem
    public string? PhotoContentType { get; init; }
    
    // Data URL da imagem (base64 inline) para uso direto no frontend
    public string? PhotoDataUrl { get; init; }
    
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
}

public record BookSearchDto
{
    public string? Title { get; init; }
    public string? ISBN { get; init; }
    public string? Author { get; init; }
    public BookGenre? Genre { get; init; }
    public BookPublisher? Publisher { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public record BookSearchResultDto
{
    public List<BookResponseDto> Books { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}

public record CategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record CategoryWithCountDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Count { get; init; }
}

// DTOs para busca por ISBN via OpenLibrary API
public record OpenLibraryBookDto
{
    public string? Title { get; init; }
    public List<OpenLibraryAuthorDto>? Authors { get; init; } = [];
    public int? NumberOfPages { get; init; }
    public List<OpenLibraryPublisherDto>? Publishers { get; init; } = [];
    public string? PublishDate { get; init; }
    public List<OpenLibrarySubjectDto>? Subjects { get; init; } = [];
    public OpenLibraryCoverDto? Cover { get; init; }
    public List<OpenLibraryExcerptDto>? Excerpts { get; init; }
    public List<OpenLibraryWorkDto>? Works { get; init; } = [];
}

public record OpenLibraryAuthorDto
{
    public string? Name { get; init; }
    public string? Url { get; init; }
}

public record OpenLibraryPublisherDto
{
    public string? Name { get; init; }
}

public record OpenLibrarySubjectDto
{
    public string? Name { get; init; }
    public string? Url { get; init; }
}

public record OpenLibraryCoverDto
{
    public string? Small { get; init; }
    public string? Medium { get; init; }
    public string? Large { get; init; }
}

public record OpenLibraryExcerptDto
{
    public string? Text { get; init; }
    public bool? FirstSentence { get; init; }
}

public record OpenLibraryWorkDto
{
    public string? Key { get; init; }
}

public record OpenLibraryWorkResponseDto
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Key { get; init; }
}

public record OpenLibrarySearchResponseDto
{
    public Dictionary<string, OpenLibraryBookDto>? Books { get; init; }
}

public record BookFromIsbnDto
{
    public string Title { get; init; } = string.Empty;
    public string ISBN { get; init; } = string.Empty;
    public BookGenre Genre { get; init; }
    public string Author { get; init; } = string.Empty;
    public BookPublisher Publisher { get; init; }
    public string Synopsis { get; init; } = string.Empty;
    public string? Summary { get; init; }
    public string? CoverUrl { get; init; }
}

public record CreateBookFromIsbnDto
{
    public string ISBN { get; init; } = string.Empty;
    public bool DownloadCover { get; init; } = true;
}
