using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Business.Services;

namespace DesafioCCAA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("DevelopmentPolicy")]
[Authorize]
public class BookController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly IImageOptimizationService _imageService;

    public BookController(IBookService bookService, IImageOptimizationService imageService)
    {
        _bookService = bookService;
        _imageService = imageService;
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

    /// <summary>
    /// Obtém todas as categorias disponíveis com contagem de livros
    /// </summary>
    [HttpGet("categories-with-count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoriesWithCount()
    {
        try
        {
            var categories = await _bookService.GetCategoriesWithCountAsync();
            return Ok(new { data = categories });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Erro ao buscar categorias com contagem", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtém imagem otimizada do livro
    /// </summary>
    [HttpGet("photo/{bookId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBookPhoto(int bookId, [FromQuery] int? width, [FromQuery] int? height)
    {
        try
        {
            Console.WriteLine($"🔍 GetBookPhoto chamado para bookId: {bookId}");
            
            // Buscar o livro para obter os bytes da imagem
            var bookResult = await _bookService.GetBookByIdAsync(bookId);
            if (!bookResult.IsSuccess)
            {
                Console.WriteLine($"❌ Livro não encontrado para bookId: {bookId}");
                return NotFound(new { error = "Livro não encontrado" });
            }

            var book = bookResult.Data!;
            Console.WriteLine($"✅ Livro encontrado: {book.Title}, PhotoBytes: {book.PhotoBytes?.Length ?? 0} bytes");
            
            // Verificar se o livro tem foto
            if (book.PhotoBytes == null || book.PhotoBytes.Length == 0)
            {
                Console.WriteLine($"❌ Livro {book.Title} não possui foto");
                return NotFound(new { error = "Livro não possui foto" });
            }

            // Redimensionar a imagem se especificado
            byte[] imageBytes = book.PhotoBytes;
            if (width.HasValue || height.HasValue)
            {
                Console.WriteLine($"🔄 Redimensionando imagem para {width}x{height}");
                imageBytes = await _imageService.ResizeImageBytesAsync(book.PhotoBytes, width, height);
            }

            // Determinar o tipo de conteúdo
            var contentType = !string.IsNullOrEmpty(book.PhotoContentType) 
                ? book.PhotoContentType 
                : "image/jpeg";
                
            Console.WriteLine($"✅ Retornando imagem: {imageBytes.Length} bytes, tipo: {contentType}");
            return File(imageBytes, contentType);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erro ao processar imagem para bookId {bookId}: {ex.Message}");
            return BadRequest(new { error = "Erro ao processar imagem", details = ex.Message });
        }
    }

    /// <summary>
    /// Busca livro por ISBN na API do OpenLibrary
    /// </summary>
    [HttpGet("search-isbn/{isbn}")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchBookByIsbn(string isbn)
    {
        try
        {
            var result = await _bookService.SearchBookByIsbnAsync(isbn);
            
            if (!result.IsSuccess)
            {
                return BadRequest(new { error = result.ErrorMessage });
            }

            return Ok(new { data = result.Data });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Erro ao buscar livro por ISBN", details = ex.Message });
        }
    }

    /// <summary>
    /// Cria um livro diretamente a partir do ISBN (incluindo download da capa)
    /// </summary>
    [HttpPost("create-from-isbn")]
    public async Task<IActionResult> CreateBookFromIsbn([FromBody] CreateBookFromIsbnDto createBookDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _bookService.CreateBookFromIsbnAsync(userId, createBookDto);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetBookById), new { id = result.Data!.Id }, new { data = result.Data });
    }
}
