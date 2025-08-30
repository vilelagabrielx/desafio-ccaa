using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Interfaces;

public interface IUserService
{
    Task<ServiceResult<UserResponseDto>> RegisterAsync(UserRegistrationDto registrationDto);
    Task<ServiceResult<string>> LoginAsync(UserLoginDto loginDto);
    Task<ServiceResult<UserResponseDto>> GetUserByIdAsync(string userId);
    Task<ServiceResult<UserResponseDto>> GetCurrentUserAsync();
    Task<ServiceResult<bool>> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
    Task<ServiceResult<bool>> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<ServiceResult<bool>> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<ServiceResult<bool>> UpdateProfileAsync(string userId, UpdateProfileDto updateDto);
    Task<ServiceResult<bool>> DeactivateUserAsync(string userId);
}

public record ServiceResult<T>
{
    public bool IsSuccess { get; init; }
    public T? Data { get; init; }
    public string? ErrorMessage { get; init; }
    public List<string>? ValidationErrors { get; init; }

    public static ServiceResult<T> Success(T data) => new() { IsSuccess = true, Data = data };
    public static ServiceResult<T> Failure(string errorMessage) => new() { IsSuccess = false, ErrorMessage = errorMessage };
    public static ServiceResult<T> ValidationFailure(List<string> validationErrors) => new() { IsSuccess = false, ValidationErrors = validationErrors };
}
