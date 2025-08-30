using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("DevelopmentPolicy")]
[Authorize]
public class BookController : ControllerBase
{
    private readonly IBookService _bookService;

    public BookController(IBookService bookService)
    {
        _bookService = bookService;
    }

    /// <summary>
    /// Cria um novo livro
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBook([FromForm] CreateBookDto createBookDto, IFormFile? photo)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.CreateBookAsync(userId, createBookDto, photo);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetBookById), new { id = result.Data!.Id }, new { data = result.Data });
    }

    /// <summary>
    /// Obtém livro por ID (público)
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBookById(int id)
    {
        var result = await _bookService.GetBookByIdAsync(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Obtém livro por ID (apenas do usuário logado)
    /// </summary>
    [HttpGet("my/{id}")]
    public async Task<IActionResult> GetMyBookById(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.GetBookByIdAsync(id, userId);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Obtém todos os livros do usuário logado
    /// </summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBooks()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.GetBooksByUserIdAsync(userId);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Busca livros com filtros
    /// </summary>
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchBooks([FromQuery] BookSearchDto searchDto)
    {
        var result = await _bookService.SearchBooksAsync(searchDto);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Atualiza livro
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromForm] UpdateBookDto updateBookDto, IFormFile? photo)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.UpdateBookAsync(id, userId, updateBookDto, photo);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Remove livro
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.DeleteBookAsync(id, userId);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Livro removido com sucesso" });
    }

    /// <summary>
    /// Gera relatório PDF dos livros do usuário
    /// </summary>
    [HttpGet("report/pdf")]
    public async Task<IActionResult> GenerateReportPdf()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.GenerateBooksReportPdfAsync(userId);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return File(result.Data!, "application/pdf", $"relatorio-livros-{DateTime.Now:yyyyMMdd-HHmmss}.pdf");
    }

    /// <summary>
    /// Obtém todos os livros (público)
    /// </summary>
    [HttpGet("all")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllBooks()
    {
        try
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(new { data = books });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Erro ao buscar livros", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtém todas as categorias disponíveis
    /// </summary>
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _bookService.GetCategoriesAsync();
            return Ok(new { data = categories });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Erro ao buscar categorias", details = ex.Message });
        }
    }
}
