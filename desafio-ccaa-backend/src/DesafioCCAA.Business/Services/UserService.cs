using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;
using System.Net.Mail;
using System.Net;

namespace DesafioCCAA.Business.Services;

public class UserService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IConfiguration configuration,
    ILogger<UserService> logger,
    IUserRepository userRepository,
    IEmailService emailService) : IUserService
{
    public async Task<ServiceResult<UserResponseDto>> RegisterAsync(UserRegistrationDto registrationDto)
    {
        try
        {
            var existingUser = await userRepository.EmailExistsAsync(registrationDto.Email);
            if (existingUser)
            {
                return ServiceResult<UserResponseDto>.Failure("Email já está em uso");
            }

            var user = new User
            {
                UserName = registrationDto.Email,
                Email = registrationDto.Email,
                FirstName = registrationDto.FirstName,
                LastName = registrationDto.LastName,
                DateOfBirth = DateTime.SpecifyKind(registrationDto.DateOfBirth, DateTimeKind.Utc),
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, registrationDto.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ServiceResult<UserResponseDto>.ValidationFailure(errors);
            }

            var userResponse = MapToUserResponseDto(user);
            logger.LogInformation("Usuário registrado com sucesso: {Email}", user.Email);
            
            return ServiceResult<UserResponseDto>.Success(userResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao registrar usuário: {Email}", registrationDto.Email);
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao registrar usuário");
        }
    }

    public async Task<ServiceResult<string>> LoginAsync(UserLoginDto loginDto)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            if (user is null || !user.IsActive)
            {
                return ServiceResult<string>.Failure("Credenciais inválidas");
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded)
            {
                return ServiceResult<string>.Failure("Credenciais inválidas");
            }

            var token = GenerateJwtToken(user);
            logger.LogInformation("Usuário logado com sucesso: {Email}", user.Email);
            logger.LogInformation("Token JWT gerado com sucesso");
            
            return ServiceResult<string>.Success(token);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao fazer login: {Email}", loginDto.Email);
            return ServiceResult<string>.Failure("Erro interno ao fazer login");
        }
    }

    public async Task<ServiceResult<UserResponseDto>> GetUserByIdAsync(string userId)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<UserResponseDto>.Failure("Usuário não encontrado");
            }

            var userResponse = MapToUserResponseDto(user);
            return ServiceResult<UserResponseDto>.Success(userResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao buscar usuário: {UserId}", userId);
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao buscar usuário");
        }
    }

    public Task<ServiceResult<UserResponseDto>> GetCurrentUserAsync()
    {
        try
        {
            // This method should be called from a controller with [Authorize] attribute
            // The user ID should be extracted from the JWT token claims
            throw new NotImplementedException("Este método deve ser implementado no controller");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter usuário atual");
            return Task.FromResult(ServiceResult<UserResponseDto>.Failure("Erro interno ao obter usuário atual"));
        }
    }

    public async Task<ServiceResult<bool>> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
    {
        try
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<bool>.Failure("Usuário não encontrado");
            }

            var result = await userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ServiceResult<bool>.ValidationFailure(errors);
            }

            logger.LogInformation("Senha alterada com sucesso para: {UserId}", userId);
            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao alterar senha para: {UserId}", userId);
            return ServiceResult<bool>.Failure("Erro interno ao alterar senha");
        }
    }

    public async Task<ServiceResult<bool>> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user is not null)
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(user);
                
                // Send email using PickupDirectory
                await SendPasswordResetEmailAsync(user.Email!, user.FullName, token);
                
                logger.LogInformation("Token de reset de senha gerado para: {Email}", forgotPasswordDto.Email);
            }

            // Always return success to prevent email enumeration
            logger.LogInformation("Solicitação de reset de senha processada para: {Email}", forgotPasswordDto.Email);
            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao processar solicitação de reset de senha: {Email}", forgotPasswordDto.Email);
            return ServiceResult<bool>.Failure("Erro interno ao processar solicitação");
        }
    }

    public async Task<ServiceResult<bool>> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user is null)
            {
                return ServiceResult<bool>.Failure("Usuário não encontrado");
            }

            var result = await userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ServiceResult<bool>.ValidationFailure(errors);
            }

            logger.LogInformation("Senha resetada com sucesso para: {Email}", resetPasswordDto.Email);
            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao resetar senha para: {Email}", resetPasswordDto.Email);
            return ServiceResult<bool>.Failure("Erro interno ao resetar senha");
        }
    }

    public async Task<ServiceResult<bool>> UpdateProfileAsync(string userId, UpdateProfileDto updateDto)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<bool>.Failure("Usuário não encontrado");
            }

            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await userRepository.UpdateAsync(user);
            if (result is null)
            {
                var errors = new List<string> { "Erro ao atualizar usuário" };
                return ServiceResult<bool>.ValidationFailure(errors);
            }

            logger.LogInformation("Perfil atualizado com sucesso para: {UserId}", userId);
            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao atualizar perfil para: {UserId}", userId);
            return ServiceResult<bool>.Failure("Erro interno ao atualizar perfil");
        }
    }

    public async Task<ServiceResult<bool>> DeactivateUserAsync(string userId)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return ServiceResult<bool>.Failure("Usuário não encontrado");
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await userRepository.UpdateAsync(user);
            if (result is null)
            {
                var errors = new List<string> { "Erro ao desativar usuário" };
                return ServiceResult<bool>.ValidationFailure(errors);
            }

            logger.LogInformation("Usuário desativado com sucesso para: {UserId}", userId);
            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao desativar usuário: {UserId}", userId);
            return ServiceResult<bool>.Failure("Erro interno ao desativar usuário");
        }
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtKey = configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException("JWT key not configured");
        }
        
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, user.FullName ?? string.Empty)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = configuration["Jwt:Issuer"],
            Audience = configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task SendPasswordResetEmailAsync(string email, string fullName, string token)
    {
        try
        {
            var frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:4200";
            
            // Criar link de reset
            var resetLink = $"{frontendBaseUrl}/reset-password-token?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(email)}";

            var subject = "Reset de Senha - Desafio CCAA";
            var body = $@"
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .reset-button {{ display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                        .reset-button:hover {{ background: #0056b3; }}
                        .token-info {{ background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; word-break: break-all; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🔐 Reset de Senha</h1>
                            <p>Desafio CCAA - Sistema de Gerenciamento de Livros</p>
                        </div>
                        <div class='content'>
                            <h2>Olá {fullName}!</h2>
                            <p>Você solicitou um reset de senha para sua conta no sistema Desafio CCAA.</p>
                            
                            <p><strong>Para redefinir sua senha, clique no botão abaixo:</strong></p>
                            
                            <div style='text-align: center;'>
                                <a href='{resetLink}' class='reset-button'>
                                    🔑 Redefinir Senha
                                </a>
                            </div>
                            
                            <p><strong>Ou copie e cole este link no seu navegador:</strong></p>
                            <div class='token-info'>
                                {resetLink}
                            </div>
                            
                            <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                                <p><strong>⚠️ Importante:</strong></p>
                                <ul>
                                    <li>Este link expira em <strong>1 hora</strong></li>
                                    <li>Use apenas uma vez</li>
                                    <li>Se você não solicitou este reset, ignore este e-mail</li>
                                </ul>
                            </div>
                            
                            <p>Se o botão não funcionar, copie o link acima e cole na barra de endereços do seu navegador.</p>
                        </div>
                        <div class='footer'>
                            <p>Atenciosamente,<br><strong>Equipe Desafio CCAA</strong></p>
                            <p>Este é um e-mail automático, não responda.</p>
                        </div>
                    </div>
                </body>
                </html>";

            // Usar o EmailService para enviar
            var emailSent = await emailService.SendEmailAsync(email, subject, body, true);
            
            if (emailSent)
            {
                logger.LogInformation("E-mail de reset de senha enviado com sucesso para: {Email}", email);
            }
            else
            {
                logger.LogWarning("Falha ao enviar e-mail de reset de senha para: {Email}", email);
            }
            
            // Em modo desenvolvimento, mostrar o token e link no console
            logger.LogWarning("🔑 TOKEN DE RESET DE SENHA (DESENVOLVIMENTO): {Token}", token);
            logger.LogWarning("🔗 LINK DE RESET (DESENVOLVIMENTO): {ResetLink}", resetLink);
            logger.LogWarning("📧 Email: {Email}", email);
            logger.LogWarning("👤 Nome: {FullName}", fullName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao enviar e-mail de reset de senha para: {Email}", email);
            // Don't throw - email failure shouldn't break the password reset flow
        }
    }

    public string GetEmailPickupDirectory()
    {
        return configuration["Email:PickupDirectory"] ?? "C:\\temp\\emails";
    }

    public async Task<ServiceResult<bool>> CheckEmailExistsAsync(string email)
    {
        try
        {
            var exists = await userRepository.EmailExistsAsync(email);
            return ServiceResult<bool>.Success(exists);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao verificar se email existe: {Email}", email);
            return ServiceResult<bool>.Failure("Erro interno ao verificar email");
        }
    }

    private static UserResponseDto MapToUserResponseDto(User user) =>
        new()
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName ?? string.Empty,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive
        };
}
