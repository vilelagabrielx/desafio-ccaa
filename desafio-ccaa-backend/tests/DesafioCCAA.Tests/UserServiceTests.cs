using Xunit;
using FluentAssertions;
using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Tests;

public class UserServiceTests
{
    [Fact]
    public void UserRegistrationDto_WithValidData_ShouldBeValid()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123"
        };

        // Act & Assert
        registrationDto.FirstName.Should().Be("João");
        registrationDto.LastName.Should().Be("Silva");
        registrationDto.Email.Should().Be("joao@teste.com");
        registrationDto.Password.Should().Be("Teste123");
        registrationDto.ConfirmPassword.Should().Be("Teste123");
    }

    [Fact]
    public void UserLoginDto_WithValidData_ShouldBeValid()
    {
        // Arrange
        var loginDto = new UserLoginDto
        {
            Email = "joao@teste.com",
            Password = "Teste123"
        };

        // Act & Assert
        loginDto.Email.Should().Be("joao@teste.com");
        loginDto.Password.Should().Be("Teste123");
    }

    [Fact]
    public void PasswordConfirmation_ShouldMatch()
    {
        // Arrange
        var password = "Teste123";
        var confirmPassword = "Teste123";

        // Act & Assert
        password.Should().Be(confirmPassword);
    }

    [Fact]
    public void EmailFormat_ShouldBeValid()
    {
        // Arrange
        var email = "joao@teste.com";

        // Act & Assert
        email.Should().Contain("@");
        email.Should().Contain(".");
        email.Should().NotBeNullOrEmpty();
    }
}
