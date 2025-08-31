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

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Registra um novo usuário
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .SelectMany(x => x.Value.Errors)
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
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"  - {claim.Type}: {claim.Value}");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"🔐 GetCurrentUser: UserId extraído: {userId}");
        
        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("❌ GetCurrentUser: UserId não encontrado nas claims");
            return Unauthorized(new { error = "Token inválido" });
        }

        var result = await _userService.GetUserByIdAsync(userId);
        
        if (!result.IsSuccess)
        {
            Console.WriteLine($"❌ GetCurrentUser: Erro ao buscar usuário: {result.ErrorMessage}");
            return NotFound(new { error = result.ErrorMessage });
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
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
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
    /// Atualiza perfil do usuário
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
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
