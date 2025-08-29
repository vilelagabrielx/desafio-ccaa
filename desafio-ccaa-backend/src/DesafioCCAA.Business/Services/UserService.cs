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
            // Implementation will be added here
            throw new NotImplementedException();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao obter usuário atual");
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao obter usuário atual");
        }
    }

    /// <summary>
    /// Sincroniza usuário do Auth0 com o sistema local
    /// </summary>
    public async Task<ServiceResult<UserResponseDto>> SyncAuth0UserAsync(Auth0UserSyncDto auth0User)
    {
        try
        {
            // Verificar se usuário já existe
            var existingUser = await userRepository.GetByEmailAsync(auth0User.Email);
            
            if (existingUser != null)
            {
                // Atualizar usuário existente com Auth0Id se necessário
                if (string.IsNullOrEmpty(existingUser.Auth0Id))
                {
                    existingUser.Auth0Id = auth0User.Auth0Id;
                    existingUser.UpdatedAt = DateTime.UtcNow;
                    await userRepository.UpdateAsync(existingUser);
                    logger.LogInformation("Usuário existente atualizado com Auth0Id: {Email}", auth0User.Email);
                }
                
                return ServiceResult<UserResponseDto>.Success(MapToUserResponseDto(existingUser));
            }

            // Criar novo usuário
            var user = new User
            {
                UserName = auth0User.Email,
                Email = auth0User.Email,
                FirstName = auth0User.FirstName,
                LastName = auth0User.LastName,
                Auth0Id = auth0User.Auth0Id,
                EmailConfirmed = auth0User.EmailVerified,
                DateOfBirth = DateTime.UtcNow.AddYears(-18), // Default age
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // Criar usuário sem senha (Auth0 gerencia autenticação)
            var result = await userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                logger.LogError("Erro ao criar usuário Auth0: {Errors}", string.Join(", ", errors));
                return ServiceResult<UserResponseDto>.ValidationFailure(errors);
            }

            var userResponse = MapToUserResponseDto(user);
            logger.LogInformation("Usuário Auth0 sincronizado com sucesso: {Email}", auth0User.Email);
            
            return ServiceResult<UserResponseDto>.Success(userResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao sincronizar usuário Auth0: {Email}", auth0User.Email);
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao sincronizar usuário Auth0");
        }
    }

    /// <summary>
    /// Garante que o usuário existe no sistema local
    /// </summary>
    public async Task<ServiceResult<UserResponseDto>> EnsureUserExistsAsync(string email, string auth0Id)
    {
        try
        {
            var user = await userRepository.GetByEmailAsync(email);
            
            if (user == null)
            {
                // Criar usuário básico se não existir
                var newUser = new User
                {
                    UserName = email,
                    Email = email,
                    FirstName = "Usuário",
                    LastName = "Auth0",
                    Auth0Id = auth0Id,
                    EmailConfirmed = true,
                    DateOfBirth = DateTime.UtcNow.AddYears(-18),
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var result = await userManager.CreateAsync(newUser);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    logger.LogError("Erro ao criar usuário básico: {Errors}", string.Join(", ", errors));
                    return ServiceResult<UserResponseDto>.ValidationFailure(errors);
                }

                user = newUser;
                logger.LogInformation("Usuário básico criado automaticamente: {Email}", email);
            }
            else if (string.IsNullOrEmpty(user.Auth0Id))
            {
                // Atualizar usuário existente com Auth0Id
                user.Auth0Id = auth0Id;
                user.UpdatedAt = DateTime.UtcNow;
                await userRepository.UpdateAsync(user);
                logger.LogInformation("Usuário existente atualizado com Auth0Id: {Email}", email);
            }

            return ServiceResult<UserResponseDto>.Success(MapToUserResponseDto(user));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao garantir existência do usuário: {Email}", email);
            return ServiceResult<UserResponseDto>.Failure("Erro interno ao garantir existência do usuário");
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
                // Here you would send the token via email
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

    public async Task<ServiceResult<bool>> UpdateProfileAsync(string userId, UserResponseDto updateDto)
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
