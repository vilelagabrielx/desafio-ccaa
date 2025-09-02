using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

/// <summary>
/// Interface para geração de relatórios de livros
/// </summary>
public interface IBookReportService
{
    Task<ServiceResult<byte[]>> GenerateBooksReportPdfAsync(string userId);
    Task<ServiceResult<byte[]>> GenerateBooksReportExcelAsync(string userId);
}

/// <summary>
/// Interface para estratégias de geração de relatórios
/// </summary>
public interface IReportGenerator
{
    Task<byte[]> GenerateReportAsync<T>(IEnumerable<T> data, string title, Dictionary<string, object>? parameters = null);
}

/// <summary>
/// Tipos de formato de relatório
/// </summary>
public enum ReportFormat
{
    Pdf,
    Excel,
    Csv
}
