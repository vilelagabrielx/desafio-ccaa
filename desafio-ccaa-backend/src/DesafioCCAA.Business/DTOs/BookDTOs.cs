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
}

public record UpdateBookDto
{
    public string Title { get; init; } = string.Empty;
    public string ISBN { get; init; } = string.Empty;
    public BookGenre Genre { get; init; }
    public string Author { get; init; } = string.Empty;
    public BookPublisher Publisher { get; init; }
    public string Synopsis { get; init; } = string.Empty;
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
    public string? PhotoPath { get; init; }
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
