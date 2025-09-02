using Microsoft.AspNetCore.Http;
using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

/// <summary>
/// Interface legacy para compatibilidade com código existente
/// Agrega todas as funcionalidades de livros em uma única interface
/// </summary>
public interface IBookService : IBookCrudService, IBookReportService, IBookSearchService, IBookImageService
{
}
