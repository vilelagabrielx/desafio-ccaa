namespace DesafioCCAA.Business.DTOs;

public record UserRegistrationDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
}

public record UserLoginDto
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}

public record Auth0UserSyncDto
{
    public string Auth0Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? Picture { get; init; }
    public bool EmailVerified { get; init; }
}

public record UserResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public bool IsActive { get; init; }
}

public record ChangePasswordDto
{
    public string CurrentPassword { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmNewPassword { get; init; } = string.Empty;
}

public record ForgotPasswordDto
{
    public string Email { get; init; } = string.Empty;
}

public record ResetPasswordDto
{
    public string Email { get; init; } = string.Empty;
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmNewPassword { get; init; } = string.Empty;
}

public record EnsureUserExistsRequest
{
    public string Email { get; init; } = string.Empty;
    public string Auth0Id { get; init; } = string.Empty;
}
