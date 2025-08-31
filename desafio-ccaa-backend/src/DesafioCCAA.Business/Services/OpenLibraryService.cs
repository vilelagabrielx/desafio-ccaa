using System.Text.Json;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public interface IOpenLibraryService
{
    Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn);
    Task<byte[]?> DownloadCoverImageAsync(string coverUrl);
}

public class OpenLibraryService : IOpenLibraryService
{
    private readonly ILogger<OpenLibraryService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "https://openlibrary.org/api/books";

    public OpenLibraryService(ILogger<OpenLibraryService> logger, HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<ServiceResult<BookFromIsbnDto?>> SearchBookByIsbnAsync(string isbn)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(isbn))
            {
                return ServiceResult<BookFromIsbnDto?>.Failure("ISBN não pode ser vazio");
            }

            // Limpar o ISBN (remover espaços e hífens)
            var cleanIsbn = isbn.Replace(" ", "").Replace("-", "");

            // Construir a URL da API
            var url = $"{_baseUrl}?bibkeys=ISBN:{cleanIsbn}&format=json&jscmd=data";

            _logger.LogInformation("Buscando livro por ISBN: {ISBN} na API do OpenLibrary", cleanIsbn);

            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha na busca por ISBN {ISBN}: {StatusCode}", cleanIsbn, response.StatusCode);
                return ServiceResult<BookFromIsbnDto?>.Success(null); // Retorna null se não encontrar
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            
            _logger.LogInformation("Resposta da API para ISBN {ISBN}: {JsonContent}", cleanIsbn, jsonContent);
            
            if (string.IsNullOrWhiteSpace(jsonContent))
            {
                _logger.LogWarning("Resposta vazia da API para ISBN {ISBN}", cleanIsbn);
                return ServiceResult<BookFromIsbnDto?>.Success(null);
            }

            // Deserializar a resposta diretamente como um dicionário
            var searchResponse = JsonSerializer.Deserialize<Dictionary<string, OpenLibraryBookDto>>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            _logger.LogInformation("Resposta deserializada: {SearchResponse}", 
                searchResponse != null ? $"Count: {searchResponse.Count}, Keys: {string.Join(", ", searchResponse.Keys)}" : "null");

            if (searchResponse == null || !searchResponse.Any())
            {
                _logger.LogInformation("Nenhum livro encontrado para ISBN {ISBN}", cleanIsbn);
                return ServiceResult<BookFromIsbnDto?>.Success(null);
            }

            // Pegar o primeiro livro encontrado (a chave será algo como "ISBN:9780140328721")
            var bookData = searchResponse.First().Value;
            
            _logger.LogInformation("Dados do livro encontrado: Title={Title}, Authors={Authors}, Publishers={Publishers}", 
                bookData.Title, 
                bookData.Authors?.Count ?? 0, 
                bookData.Publishers?.Count ?? 0);
            
            if (bookData == null)
            {
                return ServiceResult<BookFromIsbnDto?>.Success(null);
            }

            // Mapear para o DTO do sistema
            var bookDto = MapToBookFromIsbnDto(bookData, cleanIsbn);
            
            _logger.LogInformation("Livro encontrado para ISBN {ISBN}: {Title}", cleanIsbn, bookDto.Title);
            _logger.LogInformation("Dados mapeados: Author={Author}, Publisher={Publisher}, Genre={Genre}", 
                bookDto.Author, bookDto.Publisher, bookDto.Genre);
            
            return ServiceResult<BookFromIsbnDto?>.Success(bookDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar livro por ISBN {ISBN}", isbn);
            return ServiceResult<BookFromIsbnDto?>.Failure("Erro interno ao buscar livro por ISBN");
        }
    }

    public async Task<byte[]?> DownloadCoverImageAsync(string coverUrl)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(coverUrl))
            {
                return null;
            }

            _logger.LogInformation("Baixando imagem de capa: {CoverUrl}", coverUrl);

            var response = await _httpClient.GetAsync(coverUrl);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha ao baixar imagem de capa: {CoverUrl} - {StatusCode}", coverUrl, response.StatusCode);
                return null;
            }

            var imageBytes = await response.Content.ReadAsByteArrayAsync();
            
            _logger.LogInformation("Imagem de capa baixada com sucesso: {CoverUrl} - {Size} bytes", coverUrl, imageBytes.Length);
            
            return imageBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao baixar imagem de capa: {CoverUrl}", coverUrl);
            return null;
        }
    }

    private BookFromIsbnDto MapToBookFromIsbnDto(OpenLibraryBookDto openLibraryBook, string isbn)
    {
        _logger.LogInformation("Mapeando dados do OpenLibrary: Title={Title}, Authors={Authors}, Publishers={Publishers}", 
            openLibraryBook.Title, 
            openLibraryBook.Authors?.Count ?? 0, 
            openLibraryBook.Publishers?.Count ?? 0);
        
        var author = openLibraryBook.Authors?.FirstOrDefault()?.Name ?? "Autor desconhecido";
        var publisher = openLibraryBook.Publishers?.FirstOrDefault()?.Name ?? "Editora desconhecida";
        var title = openLibraryBook.Title ?? "Título não disponível";
        
        _logger.LogInformation("Dados extraídos: Author={Author}, Publisher={Publisher}, Title={Title}", 
            author, publisher, title);
        
        // Determinar o gênero baseado nos assuntos
        var genre = DetermineGenreFromSubjects(openLibraryBook.Subjects);
        
        // Criar sinopse a partir dos dados disponíveis
        var synopsis = CreateSynopsisFromBookData(openLibraryBook);

        var result = new BookFromIsbnDto
        {
            Title = title,
            ISBN = isbn,
            Genre = genre,
            Author = author,
            Publisher = MapPublisherToEnum(publisher),
            Synopsis = synopsis,
            CoverUrl = openLibraryBook.Cover?.Medium ?? openLibraryBook.Cover?.Large ?? openLibraryBook.Cover?.Small
        };
        
        _logger.LogInformation("DTO mapeado: {Result}", result);
        
        return result;
    }

    private BookGenre DetermineGenreFromSubjects(List<OpenLibrarySubjectDto>? subjects)
    {
        if (subjects == null || !subjects.Any())
        {
            return BookGenre.Other;
        }

        var subjectNames = subjects.Select(s => s.Name?.ToLowerInvariant()).Where(s => !string.IsNullOrEmpty(s)).ToList();
        
        _logger.LogInformation("Analisando assuntos para determinar gênero: {Subjects}", string.Join(", ", subjectNames));

        // Mapear assuntos para gêneros
        if (subjectNames.Any(s => s!.Contains("fiction") || s!.Contains("romance")))
            return BookGenre.Fiction;
        if (subjectNames.Any(s => s!.Contains("mystery") || s!.Contains("thriller")))
            return BookGenre.Mystery;
        if (subjectNames.Any(s => s!.Contains("science fiction") || s!.Contains("fantasy")))
            return BookGenre.ScienceFiction;
        if (subjectNames.Any(s => s!.Contains("horror")))
            return BookGenre.Horror;
        if (subjectNames.Any(s => s!.Contains("biography") || s!.Contains("autobiography")))
            return BookGenre.Biography;
        if (subjectNames.Any(s => s!.Contains("history")))
            return BookGenre.History;
        if (subjectNames.Any(s => s!.Contains("science") || s!.Contains("technology")))
            return BookGenre.Science;
        if (subjectNames.Any(s => s!.Contains("philosophy") || s!.Contains("religion")))
            return BookGenre.Philosophy;
        if (subjectNames.Any(s => s!.Contains("business") || s!.Contains("economics")))
            return BookGenre.Business;
        if (subjectNames.Any(s => s!.Contains("poetry")))
            return BookGenre.Poetry;
        if (subjectNames.Any(s => s!.Contains("drama") || s!.Contains("plays")))
            return BookGenre.Drama;
        if (subjectNames.Any(s => s!.Contains("cookbook") || s!.Contains("cooking")))
            return BookGenre.Cookbook;
        if (subjectNames.Any(s => s!.Contains("travel")))
            return BookGenre.Travel;
        if (subjectNames.Any(s => s!.Contains("juvenile") || s!.Contains("children")))
            return BookGenre.Fiction; // Livros infantis como ficção

        return BookGenre.Other;
    }

    private string CreateSynopsisFromBookData(OpenLibraryBookDto book)
    {
        var synopsisParts = new List<string>();

        // Adicionar primeira frase se disponível
        var firstSentence = book.Excerpts?.FirstOrDefault(e => e.FirstSentence == true)?.Text;
        if (!string.IsNullOrWhiteSpace(firstSentence))
        {
            synopsisParts.Add(firstSentence);
        }

        // Adicionar informações sobre o livro
        if (book.NumberOfPages.HasValue)
        {
            synopsisParts.Add($"{book.NumberOfPages.Value} páginas");
        }

        if (book.PublishDate != null)
        {
            synopsisParts.Add($"Publicado em {book.PublishDate}");
        }

        // Adicionar alguns assuntos relevantes
        var relevantSubjects = book.Subjects?
            .Where(s => !string.IsNullOrWhiteSpace(s.Name))
            .Take(3)
            .Select(s => s.Name)
            .ToList();

        if (relevantSubjects?.Any() == true)
        {
            synopsisParts.Add($"Temas: {string.Join(", ", relevantSubjects)}");
        }

        return synopsisParts.Any() ? string.Join(". ", synopsisParts) : "Sinopse não disponível";
    }

    private BookPublisher MapPublisherToEnum(string publisherName)
    {
        if (string.IsNullOrWhiteSpace(publisherName))
        {
            return BookPublisher.Other;
        }

        var normalizedName = publisherName.ToLowerInvariant();
        
        _logger.LogInformation("Mapeando editora: {PublisherName} -> {NormalizedName}", publisherName, normalizedName);

        return normalizedName switch
        {
            var name when name.Contains("penguin") || name.Contains("random house") => BookPublisher.PenguinRandomHouse,
            var name when name.Contains("harper") || name.Contains("collins") => BookPublisher.HarperCollins,
            var name when name.Contains("simon") || name.Contains("schuster") => BookPublisher.SimonSchuster,
            var name when name.Contains("hachette") => BookPublisher.HachetteBookGroup,
            var name when name.Contains("macmillan") => BookPublisher.Macmillan,
            var name when name.Contains("scholastic") => BookPublisher.Scholastic,
            var name when name.Contains("bloomsbury") => BookPublisher.Bloomsbury,
            var name when name.Contains("faber") => BookPublisher.FaberFaber,
            var name when name.Contains("vintage") => BookPublisher.Vintage,
            var name when name.Contains("anchor") => BookPublisher.Anchor,
            var name when name.Contains("knopf") => BookPublisher.Knopf,
            var name when name.Contains("crown") => BookPublisher.Crown,
            var name when name.Contains("ballantine") => BookPublisher.Ballantine,
            var name when name.Contains("bantam") => BookPublisher.Bantam,
            var name when name.Contains("dell") => BookPublisher.Bantam,
            var name when name.Contains("puffin") => BookPublisher.PenguinRandomHouse, // Puffin é da Penguin
            _ => BookPublisher.Other
        };
    }
}
