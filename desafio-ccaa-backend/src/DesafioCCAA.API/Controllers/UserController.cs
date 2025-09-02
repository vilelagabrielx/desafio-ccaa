using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("DevelopmentPolicy")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IEnvironmentService _environmentService;

    public UserController(IUserService userService, IEnvironmentService environmentService)
    {
        _userService = userService;
        _environmentService = environmentService;
    }

    /// <summary>
    /// Registra um novo usuário
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value != null)
                .SelectMany(x => x.Value!.Errors)
                .Select(x => x.ErrorMessage)
                .ToList();
            return BadRequest(new { errors });
        }
        
        var result = await _userService.RegisterAsync(registrationDto);
        
        if (!result.IsSuccess)
        {
            if (result.ValidationErrors?.Any() == true)
            {
                return BadRequest(new { errors = result.ValidationErrors });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, new { data = result.Data });
    }

    /// <summary>
    /// Realiza login do usuário
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
    {
        var result = await _userService.LoginAsync(loginDto);
        
        if (!result.IsSuccess)
        {
            return Unauthorized(new { error = result.ErrorMessage });
        }

        return Ok(new { token = result.Data });
    }

    /// <summary>
    /// Obtém usuário por ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetUserById(string id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        
        if (!result.IsSuccess)
        {
            return NotFound(new { error = result.ErrorMessage });
        }

        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Obtém usuário atual logado
    /// </summary>
    [HttpGet("current")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Debug: Log das claims do usuário
        Console.WriteLine("🔐 GetCurrentUser: Claims do usuário:");
        if (User?.Claims != null)
        {
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"  - {claim.Type}: {claim.Value}");
            }
        }

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"🔐 GetCurrentUser: UserId extraído: {userId}");
        
        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("❌ GetCurrentUser: UserId não encontrado nas claims");
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _userService.GetUserByIdAsync(userId);
        
        if (result == null || !result.IsSuccess)
        {
            Console.WriteLine($"❌ GetCurrentUser: Erro ao buscar usuário: {result?.ErrorMessage}");
            return NotFound(new { error = result?.ErrorMessage ?? "Erro desconhecido" });
        }

        Console.WriteLine($"✅ GetCurrentUser: Usuário encontrado: {result.Data?.Email}");
        return Ok(new { data = result.Data });
    }

    /// <summary>
    /// Altera senha do usuário
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _userService.ChangePasswordAsync(userId, changePasswordDto);
        
        if (!result.IsSuccess)
        {
            if (result.ValidationErrors?.Any() == true)
            {
                return BadRequest(new { errors = result.ValidationErrors });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Senha alterada com sucesso" });
    }

    /// <summary>
    /// Solicita reset de senha
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await _userService.ForgotPasswordAsync(forgotPasswordDto);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Se o email existir, você receberá instruções para resetar sua senha" });
    }

    /// <summary>
    /// Reseta senha com token
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await _userService.ResetPasswordAsync(resetPasswordDto);
        
        if (!result.IsSuccess)
        {
            if (result.ValidationErrors?.Any() == true)
            {
                return BadRequest(new { errors = result.ValidationErrors });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Senha resetada com sucesso" });
    }

    /// <summary>
    /// Obtém informações sobre o ambiente atual
    /// </summary>
    [HttpGet("environment-info")]
    public IActionResult GetEnvironmentInfo()
    {
        return Ok(new { 
            environment = _environmentService.GetEnvironmentName(),
            isDevelopment = _environmentService.IsDevelopment(),
            isUAT = _environmentService.IsUAT(),
            isProduction = _environmentService.IsProduction(),
            isDevelopmentOrUAT = _environmentService.IsDevelopmentOrUAT()
        });
    }

    /// <summary>
    /// Baixa o template do email de reset mais recente (apenas para desenvolvimento)
    /// </summary>
    [HttpGet("download-email-template")]
    public IActionResult DownloadEmailTemplate()
    {
        // Verificar se está em ambiente de desenvolvimento ou UAT
        if (!_environmentService.IsDevelopmentOrUAT())
        {
            return BadRequest(new { error = "Esta funcionalidade está disponível apenas em ambiente de desenvolvimento ou UAT" });
        }

        try
        {
            var pickupDirectory = _userService.GetEmailPickupDirectory();
            
            if (!Directory.Exists(pickupDirectory))
            {
                return NotFound(new { error = "Diretório de emails não encontrado" });
            }

            // Buscar o arquivo .eml mais recente
            var emailFiles = Directory.GetFiles(pickupDirectory, "password_reset_*.eml")
                .OrderByDescending(f => System.IO.File.GetCreationTime(f))
                .ToArray();

            if (emailFiles.Length == 0)
            {
                return NotFound(new { error = "Nenhum email de reset encontrado" });
            }

            var latestEmailFile = emailFiles[0];
            var fileContent = System.IO.File.ReadAllText(latestEmailFile);
            var fileName = Path.GetFileName(latestEmailFile);

            return File(
                System.Text.Encoding.UTF8.GetBytes(fileContent),
                "message/rfc822",
                fileName
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Erro ao baixar template: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza perfil do usuário
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _userService.UpdateProfileAsync(userId, updateDto);
        
        if (!result.IsSuccess)
        {
            if (result.ValidationErrors?.Any() == true)
            {
                return BadRequest(new { errors = result.ValidationErrors });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Perfil atualizado com sucesso" });
    }

    /// <summary>
    /// Desativa usuário
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeactivateUser(string id)
    {
        var result = await _userService.DeactivateUserAsync(id);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Usuário desativado com sucesso" });
    }
}
