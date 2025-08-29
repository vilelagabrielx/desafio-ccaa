using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.Services;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Tests;

public class UserServiceTests
{
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly Mock<SignInManager<User>> _mockSignInManager;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _mockUserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);
        _mockSignInManager = new Mock<SignInManager<User>>(
            _mockUserManager.Object, null, null, null, null, null, null);
        _mockConfiguration = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockUserRepository = new Mock<IUserRepository>();

        _userService = new UserService(
            _mockUserManager.Object,
            _mockSignInManager.Object,
            _mockConfiguration.Object,
            _mockLogger.Object,
            _mockUserRepository.Object);
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldReturnSuccess()
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

        var user = new User
        {
            Id = "1",
            FirstName = registrationDto.FirstName,
            LastName = registrationDto.LastName,
            Email = registrationDto.Email
        };

        _mockUserRepository.Setup(x => x.EmailExistsAsync(registrationDto.Email))
            .ReturnsAsync(false);

        _mockUserManager.Setup(x => x.CreateAsync(It.IsAny<User>(), registrationDto.Password))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _userService.RegisterAsync(registrationDto);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Email.Should().Be(registrationDto.Email);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldReturnFailure()
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

        _mockUserRepository.Setup(x => x.EmailExistsAsync(registrationDto.Email))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.RegisterAsync(registrationDto);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Email já está em uso");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnSuccess()
    {
        // Arrange
        var loginDto = new UserLoginDto
        {
            Email = "joao@teste.com",
            Password = "Teste123"
        };

        var user = new User
        {
            Id = "1",
            Email = loginDto.Email,
            IsActive = true
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email))
            .ReturnsAsync(user);

        _mockSignInManager.Setup(x => x.CheckPasswordSignInAsync(user, loginDto.Password, false))
            .ReturnsAsync(SignInResult.Success);

        _mockConfiguration.Setup(x => x["Jwt:Key"])
            .Returns("TestKey123456789012345678901234567890");

        // Act
        var result = await _userService.LoginAsync(loginDto);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidCredentials_ShouldReturnFailure()
    {
        // Arrange
        var loginDto = new UserLoginDto
        {
            Email = "joao@teste.com",
            Password = "WrongPassword"
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.LoginAsync(loginDto);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Credenciais inválidas");
    }
}
