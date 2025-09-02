using Microsoft.Extensions.Logging;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class BookReportService : IBookReportService
{
    private readonly IBookRepository _bookRepository;
    private readonly ILogger<BookReportService> _logger;

    public BookReportService(IBookRepository bookRepository, ILogger<BookReportService> logger)
    {
        _bookRepository = bookRepository;
        _logger = logger;
    }

    public async Task<ServiceResult<byte[]>> GenerateBooksReportPdfAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Iniciando geração de relatório PDF para usuário: {UserId}", userId);
            
            var books = await _bookRepository.GetBooksByUserIdAsync(userId);
            _logger.LogInformation("Encontrados {Count} livros para o usuário {UserId}", books.Count(), userId);
            
            if (!books.Any())
            {
                _logger.LogWarning("Nenhum livro encontrado para gerar relatório para usuário: {UserId}", userId);
                return ServiceResult<byte[]>.Failure("Você ainda não possui livros cadastrados. Adicione alguns livros à sua biblioteca antes de gerar o relatório.");
            }

            var reportGenerator = new PdfReportGenerator();
            var parameters = new Dictionary<string, object>
            {
                ["title"] = "Relatório de Livros",
                ["subtitle"] = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                ["userId"] = userId
            };

            var pdfBytes = await reportGenerator.GenerateReportAsync(books, "Relatório de Livros", parameters);
            
            _logger.LogInformation("Relatório PDF gerado com sucesso para: {UserId}. Tamanho: {Size} bytes", userId, pdfBytes.Length);
            return ServiceResult<byte[]>.Success(pdfBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar relatório PDF para: {UserId}. Detalhes: {Message}", userId, ex.Message);
            return ServiceResult<byte[]>.Failure($"Erro interno ao gerar relatório: {ex.Message}");
        }
    }

    public async Task<ServiceResult<byte[]>> GenerateBooksReportExcelAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Iniciando geração de relatório Excel para usuário: {UserId}", userId);
            
            var books = await _bookRepository.GetBooksByUserIdAsync(userId);
            
            if (!books.Any())
            {
                return ServiceResult<byte[]>.Failure("Você ainda não possui livros cadastrados.");
            }

            var reportGenerator = new ExcelReportGenerator();
            var parameters = new Dictionary<string, object>
            {
                ["title"] = "Relatório de Livros",
                ["userId"] = userId
            };

            var excelBytes = await reportGenerator.GenerateReportAsync(books, "Relatório de Livros", parameters);
            
            _logger.LogInformation("Relatório Excel gerado com sucesso para: {UserId}. Tamanho: {Size} bytes", userId, excelBytes.Length);
            return ServiceResult<byte[]>.Success(excelBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar relatório Excel para: {UserId}. Detalhes: {Message}", userId, ex.Message);
            return ServiceResult<byte[]>.Failure($"Erro interno ao gerar relatório Excel: {ex.Message}");
        }
    }
}

/// <summary>
/// Gerador de relatórios em PDF
/// </summary>
public class PdfReportGenerator : IReportGenerator
{
    public Task<byte[]> GenerateReportAsync<T>(IEnumerable<T> data, string title, Dictionary<string, object>? parameters = null)
    {
        using var memoryStream = new MemoryStream();
        var writer = new PdfWriter(memoryStream);
        var pdf = new PdfDocument(writer);
        var document = new Document(pdf);

        // Add title
        var titleElement = new Paragraph(title)
            .SetFontSize(16)
            .SetBold()
            .SetTextAlignment(TextAlignment.CENTER);
        document.Add(titleElement);

        // Add subtitle if provided
        if (parameters?.ContainsKey("subtitle") == true)
        {
            var subtitle = new Paragraph(parameters["subtitle"].ToString())
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.CENTER);
            document.Add(subtitle);
        }

        // Create table for books
        if (data is IEnumerable<Book> books)
        {
            var table = new Table(5)
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginTop(10)
                .SetMarginBottom(10);

            // Add headers
            table.AddHeaderCell(new Cell().Add(new Paragraph("Título").SetBold()));
            table.AddHeaderCell(new Cell().Add(new Paragraph("ISBN").SetBold()));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Autor").SetBold()));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Gênero").SetBold()));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Editora").SetBold()));

            // Add data
            foreach (var book in books)
            {
                table.AddCell(new Cell().Add(new Paragraph(book.Title ?? "N/A")));
                table.AddCell(new Cell().Add(new Paragraph(book.ISBN ?? "N/A")));
                table.AddCell(new Cell().Add(new Paragraph(book.Author ?? "N/A")));
                table.AddCell(new Cell().Add(new Paragraph(book.Genre.ToString())));
                table.AddCell(new Cell().Add(new Paragraph(book.Publisher.ToString())));
            }

            document.Add(table);

            // Add summary
            var summary = new Paragraph($"Total de livros: {books.Count()}")
                .SetFontSize(10);
            document.Add(summary);
        }

        document.Close();
        return Task.FromResult(memoryStream.ToArray());
    }
}

/// <summary>
/// Gerador de relatórios em Excel (placeholder - implementação futura)
/// </summary>
public class ExcelReportGenerator : IReportGenerator
{
    public Task<byte[]> GenerateReportAsync<T>(IEnumerable<T> data, string title, Dictionary<string, object>? parameters = null)
    {
        // TODO: Implementar geração de Excel usando EPPlus ou ClosedXML
        // Por enquanto, retorna um array vazio
        return Task.FromResult(Array.Empty<byte>());
    }
}
