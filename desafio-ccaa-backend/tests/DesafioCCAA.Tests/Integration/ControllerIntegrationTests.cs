using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Entities;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Business.Services;
using DesafioCCAA.API.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace DesafioCCAA.Tests.Integration;

public class ControllerIntegrationTests
{
    private readonly Mock<IBookService> _bookServiceMock;
    private readonly Mock<IUserService> _userServiceMock;
    private readonly Mock<IImageOptimizationService> _imageServiceMock;
    private readonly Mock<IEnvironmentService> _environmentServiceMock;
    private readonly Mock<ILogger<BookController>> _bookLoggerMock;
    private readonly Mock<ILogger<UserController>> _userLoggerMock;
    private readonly BookController _bookController;
    private readonly UserController _userController;

    public ControllerIntegrationTests()
    {
        _bookServiceMock = new Mock<IBookService>();
        _userServiceMock = new Mock<IUserService>();
        _imageServiceMock = new Mock<IImageOptimizationService>();
        _environmentServiceMock = new Mock<IEnvironmentService>();
        _bookLoggerMock = new Mock<ILogger<BookController>>();
        _userLoggerMock = new Mock<ILogger<UserController>>();

        _bookController = new BookController(_bookServiceMock.Object, _imageServiceMock.Object);
        _userController = new UserController(_userServiceMock.Object, _environmentServiceMock.Object);
    }

    [Fact]
    public async Task BookController_GetAllBooks_ShouldReturnOk()
    {
        // Arrange
        var books = new List<BookResponseDto>
        {
            new() { Id = 1, Title = "Livro 1", Author = "Autor 1" },
            new() { Id = 2, Title = "Livro 2", Author = "Autor 2" }
        };

        _bookServiceMock.Setup(x => x.GetAllBooksAsync())
            .ReturnsAsync(books);

        // Act
        var result = await _bookController.GetAllBooks();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task BookController_CreateBook_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var userId = "user123";
        var createBookDto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        var bookResponse = new BookResponseDto
        {
            Id = 123,
            Title = "Livro Teste",
            Author = "Autor Teste"
        };

        _bookServiceMock.Setup(x => x.CreateBookAsync(userId, createBookDto, null))
            .ReturnsAsync(ServiceResult<BookResponseDto>.Success(bookResponse));

        // Setup user claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _bookController.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };

        // Act
        var result = await _bookController.CreateBook(createBookDto, null);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result as CreatedAtActionResult;
        createdResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task BookController_CreateBook_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        var createBookDto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // No user claims setup

        // Act
        var result = await _bookController.CreateBook(createBookDto, null);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task UserController_Register_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        var userResponse = new UserResponseDto
        {
            Id = "user123",
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com"
        };

        _userServiceMock.Setup(x => x.RegisterAsync(registrationDto))
            .ReturnsAsync(ServiceResult<UserResponseDto>.Success(userResponse));

        // Act
        var result = await _userController.Register(registrationDto);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result as CreatedAtActionResult;
        createdResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task UserController_Register_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var registrationDto = new UserRegistrationDto
        {
            FirstName = "",
            LastName = "Silva",
            Email = "email-invalido",
            Password = "123",
            ConfirmPassword = "456",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        var validationErrors = new List<string> { "Nome é obrigatório", "Email inválido" };

        _userServiceMock.Setup(x => x.RegisterAsync(registrationDto))
            .ReturnsAsync(ServiceResult<UserResponseDto>.ValidationFailure(validationErrors));

        // Act
        var result = await _userController.Register(registrationDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UserController_Login_WithValidCredentials_ShouldReturnOk()
    {
        // Arrange
        var loginDto = new UserLoginDto
        {
            Email = "joao@teste.com",
            Password = "Teste123"
        };

        var loginResponse = new UserResponseDto
        {
            Id = "user123",
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com"
        };

        _userServiceMock.Setup(x => x.LoginAsync(loginDto))
            .ReturnsAsync(ServiceResult<string>.Success("jwt-token-here"));

        // Act
        var result = await _userController.Login(loginDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task UserController_Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        // Arrange
        var loginDto = new UserLoginDto
        {
            Email = "joao@teste.com",
            Password = "senha-errada"
        };

        _userServiceMock.Setup(x => x.LoginAsync(loginDto))
            .ReturnsAsync(ServiceResult<string>.Failure("Credenciais inválidas"));

        // Act
        var result = await _userController.Login(loginDto);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task UserController_GetCurrentUser_WithValidToken_ShouldReturnOk()
    {
        // Arrange
        var userId = "user123";
        var userResponse = new UserResponseDto
        {
            Id = userId,
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com"
        };

        _userServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(ServiceResult<UserResponseDto>.Success(userResponse));

        // Setup user claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _userController.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };

        // Act
        var result = await _userController.GetCurrentUser();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task UserController_GetCurrentUser_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        // No user claims setup

        // Act
        var result = await _userController.GetCurrentUser();

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }
}
