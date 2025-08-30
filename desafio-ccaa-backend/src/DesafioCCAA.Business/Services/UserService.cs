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
    IUserRepository userRepository) : IUserService
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
            var user = await userRepository.GetByIdAsync(int.Parse(userId));
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

    public async Task<ServiceResult<UserResponseDto>> GetCurrentUserAsync()
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
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao obter usuário atual");
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
            var user = await userRepository.GetByIdAsync(int.Parse(userId));
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
            var user = await userRepository.GetByIdAsync(int.Parse(userId));
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
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task SendPasswordResetEmailAsync(string email, string fullName, string token)
    {
        try
        {
            var pickupDirectory = configuration["Email:PickupDirectory"] ?? "C:\\temp\\emails";
            
            // Ensure directory exists
            if (!Directory.Exists(pickupDirectory))
            {
                Directory.CreateDirectory(pickupDirectory);
            }

            var message = new MailMessage
            {
                From = new MailAddress("noreply@desafioccaa.com", "Desafio CCAA"),
                Subject = "Reset de Senha",
                Body = $@"
                    <html>
                    <body>
                        <h2>Reset de Senha</h2>
                        <p>Olá {fullName},</p>
                        <p>Você solicitou um reset de senha para sua conta.</p>
                        <p>Use o token abaixo para redefinir sua senha:</p>
                        <h3>{token}</h3>
                        <p>Este token expira em 1 hora.</p>
                        <p>Se você não solicitou este reset, ignore este e-mail.</p>
                        <br>
                        <p>Atenciosamente,<br>Equipe Desafio CCAA</p>
                    </body>
                    </html>",
                IsBodyHtml = true
            };
            
            message.To.Add(new MailAddress(email, fullName));

            // Save to pickup directory
            var fileName = $"password_reset_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid()}.eml";
            var filePath = Path.Combine(pickupDirectory, fileName);
            
            // Create .eml file content manually
            var emlContent = $@"From: {message.From}
To: {string.Join(", ", message.To.Select(t => t.ToString()))}
Subject: {message.Subject}
MIME-Version: 1.0
Content-Type: {message.BodyEncoding?.WebName ?? "text/html; charset=utf-8"}

{message.Body}";
            
            // Save to file
            await File.WriteAllTextAsync(filePath, emlContent);
            
            logger.LogInformation("E-mail de reset de senha salvo em: {FilePath}", filePath);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao enviar e-mail de reset de senha para: {Email}", email);
            // Don't throw - email failure shouldn't break the password reset flow
        }
    }

    private static UserResponseDto MapToUserResponseDto(User user) =>
        new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive
        };
}
