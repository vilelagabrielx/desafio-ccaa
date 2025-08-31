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
    Task<string?> GetBookSummaryAsync(string isbn);
}

public class OpenLibraryService : IOpenLibraryService
{
    private readonly ILogger<OpenLibraryService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "https://openlibrary.org";

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

            // Construir a URL da API usando o novo endpoint direto
            var url = $"{_baseUrl}/isbn/{cleanIsbn}.json";

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

            // Deserializar a resposta diretamente
            var bookData = JsonSerializer.Deserialize<OpenLibraryBookDto>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (bookData == null)
            {
                _logger.LogWarning("Falha ao deserializar dados do livro para ISBN {ISBN}", cleanIsbn);
                return ServiceResult<BookFromIsbnDto?>.Success(null);
            }

            _logger.LogInformation("Dados do livro encontrado: Title={Title}, Authors={Authors}, Publishers={Publishers}, Works={Works}", 
                bookData.Title, 
                bookData.Authors?.Count ?? 0, 
                bookData.Publishers?.Count ?? 0,
                bookData.Works?.Count ?? 0);

            // Buscar o resumo do livro
            var summary = await GetBookSummaryAsync(cleanIsbn);
            
            // Mapear para o DTO do sistema
            var bookDto = MapToBookFromIsbnDto(bookData, cleanIsbn, summary);
            
            _logger.LogInformation("Livro encontrado para ISBN {ISBN}: {Title}", cleanIsbn, bookDto.Title);
            _logger.LogInformation("Dados mapeados: Author={Author}, Publisher={Publisher}, Genre={Genre}, Summary={HasSummary}", 
                bookDto.Author, bookDto.Publisher, bookDto.Genre, !string.IsNullOrEmpty(bookDto.Summary));
            
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

    public async Task<string?> GetBookSummaryAsync(string isbn)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(isbn))
            {
                return null;
            }

            var cleanIsbn = isbn.Replace(" ", "").Replace("-", "");

            // Passo 1: Buscar o livro pelo ISBN para obter a chave do work
            var bookUrl = $"{_baseUrl}/isbn/{cleanIsbn}.json";
            var bookResponse = await _httpClient.GetAsync(bookUrl);
            
            if (!bookResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha ao buscar livro para resumo por ISBN {ISBN}: {StatusCode}", cleanIsbn, bookResponse.StatusCode);
                return null;
            }

            var bookJson = await bookResponse.Content.ReadAsStringAsync();
            var bookData = JsonSerializer.Deserialize<OpenLibraryBookDto>(bookJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (bookData?.Works == null || !bookData.Works.Any())
            {
                _logger.LogInformation("Nenhum work encontrado para ISBN {ISBN}", cleanIsbn);
                return null;
            }

            // Pegar o primeiro work
            var workKey = bookData.Works.First().Key;
            if (string.IsNullOrWhiteSpace(workKey))
            {
                _logger.LogWarning("Chave do work vazia para ISBN {ISBN}", cleanIsbn);
                return null;
            }

            // Passo 2: Buscar o work para obter a descrição
            var workUrl = $"{_baseUrl}{workKey}.json";
            var workResponse = await _httpClient.GetAsync(workUrl);
            
            if (!workResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha ao buscar work para resumo: {WorkUrl} - {StatusCode}", workUrl, workResponse.StatusCode);
                return null;
            }

            var workJson = await workResponse.Content.ReadAsStringAsync();
            var workData = JsonSerializer.Deserialize<OpenLibraryWorkResponseDto>(workJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (workData?.Description == null)
            {
                _logger.LogInformation("Nenhuma descrição encontrada para work {WorkKey}", workKey);
                return null;
            }

            _logger.LogInformation("Resumo encontrado para ISBN {ISBN}: {SummaryLength} caracteres", cleanIsbn, workData.Description.Length);
            return workData.Description;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar resumo do livro por ISBN {ISBN}", isbn);
            return null;
        }
    }

    private BookFromIsbnDto MapToBookFromIsbnDto(OpenLibraryBookDto openLibraryBook, string isbn, string? summary)
    {
        _logger.LogInformation("Mapeando dados do OpenLibrary: Title={Title}, Authors={Authors}, Publishers={Publishers}, Summary={HasSummary}", 
            openLibraryBook.Title, 
            openLibraryBook.Authors?.Count ?? 0, 
            openLibraryBook.Publishers?.Count ?? 0,
            !string.IsNullOrEmpty(summary));
        
        var author = openLibraryBook.Authors?.FirstOrDefault()?.Name ?? "Autor desconhecido";
        var publisher = openLibraryBook.Publishers?.FirstOrDefault()?.Name ?? "Editora desconhecida";
        var title = openLibraryBook.Title ?? "Título não disponível";
        
        _logger.LogInformation("Dados extraídos: Author={Author}, Publisher={Publisher}, Title={Title}", 
            author, publisher, title);
        
        // Determinar o gênero baseado nos assuntos
        var genre = DetermineGenreFromSubjects(openLibraryBook.Subjects);
        
        _logger.LogInformation("Gênero determinado: {Genre}", genre);
        
        // Criar sinopse a partir dos dados disponíveis
        var synopsis = CreateSynopsisFromBookData(openLibraryBook);

        var mappedPublisher = MapPublisherToEnum(publisher);
        
        _logger.LogInformation("Editora mapeada: {OriginalPublisher} -> {MappedPublisher}", publisher, mappedPublisher);
        
        var result = new BookFromIsbnDto
        {
            Title = title,
            ISBN = isbn,
            Genre = genre,
            Author = author,
            Publisher = mappedPublisher,
            Synopsis = synopsis,
            CoverUrl = openLibraryBook.Cover?.Medium ?? openLibraryBook.Cover?.Large ?? openLibraryBook.Cover?.Small,
            Summary = summary
        };
        
        _logger.LogInformation("DTO mapeado: Title={Title}, ISBN={ISBN}, Genre={Genre} (valor: {GenreValue}), Author={Author}, Publisher={Publisher} (valor: {PublisherValue}), Synopsis={Synopsis}, Summary={HasSummary}", 
            result.Title, result.ISBN, result.Genre, (int)result.Genre, result.Author, result.Publisher, (int)result.Publisher, result.Synopsis, !string.IsNullOrEmpty(result.Summary));
        
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
        
        // Log detalhado de cada assunto
        foreach (var subject in subjects.Take(10)) // Log dos primeiros 10 assuntos
        {
            _logger.LogInformation("Assunto: {SubjectName}", subject.Name);
        }

        // Mapear assuntos para gêneros
        if (subjectNames.Any(s => s!.Contains("fantasy") || s!.Contains("magic") || s!.Contains("wizard") || s!.Contains("witch")))
        {
            var fantasySubjects = subjectNames.Where(s => s!.Contains("fantasy") || s!.Contains("magic") || s!.Contains("wizard") || s!.Contains("witch")).ToList();
            _logger.LogInformation("Gênero determinado: Fantasy (baseado em: {Subjects}) - Valor do enum: {EnumValue}", 
                string.Join(", ", fantasySubjects), (int)BookGenre.Fantasy);
            return BookGenre.Fantasy;
        }
        if (subjectNames.Any(s => s!.Contains("science fiction") || s!.Contains("sci-fi")))
            return BookGenre.ScienceFiction;
        if (subjectNames.Any(s => s!.Contains("mystery") || s!.Contains("thriller")))
            return BookGenre.Mystery;
        if (subjectNames.Any(s => s!.Contains("horror")))
            return BookGenre.Horror;
        if (subjectNames.Any(s => s!.Contains("romance")))
            return BookGenre.Romance;
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
        if (subjectNames.Any(s => s!.Contains("juvenile") || s!.Contains("children") || s!.Contains("school") || s!.Contains("adventure")))
            return BookGenre.Fiction; // Livros infantis, escolares e de aventura como ficção
        if (subjectNames.Any(s => s!.Contains("fiction")))
            return BookGenre.Fiction;

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

        var result = normalizedName switch
        {
            // Editoras Internacionais Principais
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
            var name when name.Contains("puffin") => BookPublisher.PenguinRandomHouse,
            var name when name.Contains("norton") => BookPublisher.Norton,
            var name when name.Contains("oxford") => BookPublisher.OxfordUniversityPress,
            var name when name.Contains("cambridge") => BookPublisher.CambridgeUniversityPress,
            var name when name.Contains("mit press") => BookPublisher.MITPress,
            var name when name.Contains("princeton") => BookPublisher.PrincetonUniversityPress,
            var name when name.Contains("yale") => BookPublisher.YaleUniversityPress,
            var name when name.Contains("harvard") => BookPublisher.HarvardUniversityPress,
            var name when name.Contains("stanford") => BookPublisher.StanfordUniversityPress,
            var name when name.Contains("chicago") => BookPublisher.UniversityOfChicagoPress,
            var name when name.Contains("columbia") => BookPublisher.ColumbiaUniversityPress,
            var name when name.Contains("springer") => BookPublisher.Springer,
            var name when name.Contains("wiley") => BookPublisher.Wiley,
            var name when name.Contains("elsevier") => BookPublisher.Elsevier,
            var name when name.Contains("routledge") => BookPublisher.Routledge,
            var name when name.Contains("sage") => BookPublisher.Sage,
            var name when name.Contains("palgrave") => BookPublisher.PalgraveMacmillan,
            var name when name.Contains("tor") => BookPublisher.TorBooks,
            var name when name.Contains("orbit") => BookPublisher.Orbit,
            var name when name.Contains("baen") => BookPublisher.BaenBooks,
            var name when name.Contains("daw") => BookPublisher.DAW,
            var name when name.Contains("ace") => BookPublisher.Ace,
            var name when name.Contains("roc") => BookPublisher.Roc,
            var name when name.Contains("del rey") => BookPublisher.DelRey,
            var name when name.Contains("gollancz") => BookPublisher.Gollancz,
            var name when name.Contains("angry robot") => BookPublisher.AngryRobot,
            var name when name.Contains("solaris") => BookPublisher.Solaris,
            var name when name.Contains("candlewick") => BookPublisher.CandlewickPress,
            var name when name.Contains("chronicle") => BookPublisher.ChronicleBooks,
            var name when name.Contains("abrams") => BookPublisher.Abrams,
            var name when name.Contains("phaidon") => BookPublisher.Phaidon,
            var name when name.Contains("taschen") => BookPublisher.Taschen,
            var name when name.Contains("thames") || name.Contains("hudson") => BookPublisher.ThamesHudson,
            var name when name.Contains("prestel") => BookPublisher.Prestel,
            var name when name.Contains("rizzoli") => BookPublisher.Rizzoli,
            var name when name.Contains("assouline") => BookPublisher.Assouline,
            var name when name.Contains("gestalten") => BookPublisher.Gestalten,
            
            // Editoras Brasileiras
            var name when name.Contains("companhia") || name.Contains("letras") => BookPublisher.CompanhiaDasLetras,
            var name when name.Contains("record") => BookPublisher.Record,
            var name when name.Contains("rocco") => BookPublisher.Rocco,
            var name when name.Contains("globo") => BookPublisher.Globo,
            var name when name.Contains("sextante") => BookPublisher.Sextante,
            var name when name.Contains("planeta") => BookPublisher.Planeta,
            var name when name.Contains("leya") => BookPublisher.Leya,
            var name when name.Contains("intrinseca") => BookPublisher.Intrinseca,
            var name when name.Contains("objetiva") => BookPublisher.Objetiva,
            var name when name.Contains("nova fronteira") => BookPublisher.NovaFronteira,
            var name when name.Contains("bertrand") => BookPublisher.BertrandBrasil,
            var name when name.Contains("zahar") => BookPublisher.Zahar,
            var name when name.Contains("martins") || name.Contains("fontes") => BookPublisher.MartinsFontes,
            var name when name.Contains("atual") => BookPublisher.Atual,
            var name when name.Contains("moderna") => BookPublisher.Moderna,
            var name when name.Contains("ftd") => BookPublisher.FTD,
            var name when name.Contains("scipione") => BookPublisher.Scipione,
            var name when name.Contains("saraiva") => BookPublisher.Saraiva,
            var name when name.Contains("melhoramentos") => BookPublisher.Melhoramentos,
            var name when name.Contains("ciranda") => BookPublisher.CirandaCultural,
            
            // Fallbacks específicos
            var name when name.Contains("arthur") || name.Contains("levine") => BookPublisher.Other,
            var name when name.Contains("basic books") => BookPublisher.BasicBooks,
            var name when name.Contains("public affairs") => BookPublisher.PublicAffairs,
            var name when name.Contains("grove press") => BookPublisher.GrovePress,
            var name when name.Contains("new directions") => BookPublisher.NewDirections,
            var name when name.Contains("city lights") => BookPublisher.CityLights,
            var name when name.Contains("graywolf") => BookPublisher.GraywolfPress,
            var name when name.Contains("coffee house") => BookPublisher.CoffeeHousePress,
            var name when name.Contains("tin house") => BookPublisher.TinHouse,
            var name when name.Contains("mcsweeneys") => BookPublisher.McSweeneys,
            var name when name.Contains("akashic") => BookPublisher.AkashicBooks,
            var name when name.Contains("seven stories") => BookPublisher.SevenStoriesPress,
            var name when name.Contains("haymarket") => BookPublisher.HaymarketBooks,
            var name when name.Contains("verso") => BookPublisher.Verso,
            var name when name.Contains("monthly review") => BookPublisher.MonthlyReviewPress,
            var name when name.Contains("ak press") => BookPublisher.AKPress,
            var name when name.Contains("pm press") => BookPublisher.PMPress,
            var name when name.Contains("microcosm") => BookPublisher.MicrocosmPublishing,
            var name when name.Contains("soft skull") => BookPublisher.SoftSkullPress,
            var name when name.Contains("melville house") => BookPublisher.MelvilleHouse,
            var name when name.Contains("europa") => BookPublisher.EuropaEditions,
            
            _ => BookPublisher.Other
        };
        
        _logger.LogInformation("Editora mapeada: {OriginalPublisher} -> {MappedPublisher} (valor: {EnumValue})", 
            publisherName, result, (int)result);
        
        return result;
    }
}
