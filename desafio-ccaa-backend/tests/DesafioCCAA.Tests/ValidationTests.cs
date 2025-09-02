using Xunit;
using FluentAssertions;
using FluentValidation;
using DesafioCCAA.Business.DTOs;
using DesafioCCAA.Business.Validators;
using DesafioCCAA.Business.Entities;

namespace DesafioCCAA.Tests;

public class ValidationTests
{
    #region UserRegistrationDtoValidator Tests

    [Fact]
    public void UserRegistrationDtoValidator_WithValidData_ShouldPass()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithEmptyFirstName_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName" && e.ErrorMessage == "Nome é obrigatório");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithShortFirstName_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "J",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName" && e.ErrorMessage == "Nome deve ter entre 2 e 50 caracteres");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithLongFirstName_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = new string('A', 51), // 51 characters
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName" && e.ErrorMessage == "Nome deve ter entre 2 e 50 caracteres");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithEmptyLastName_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "LastName" && e.ErrorMessage == "Sobrenome é obrigatório");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithInvalidEmail_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "invalid-email",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "Email deve ser válido");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithLongEmail_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = new string('a', 95) + "@teste.com", // 101 characters total
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "Email deve ter no máximo 100 caracteres");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithShortPassword_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "12345", // Only 5 characters
            ConfirmPassword = "12345",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password" && e.ErrorMessage == "Senha deve ter no mínimo 6 caracteres");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithWeakPassword_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "123456", // No uppercase, no lowercase
            ConfirmPassword = "123456",
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password" && e.ErrorMessage == "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithMismatchedPasswords_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste456", // Different password
            DateOfBirth = DateTime.Today.AddYears(-25)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ConfirmPassword" && e.ErrorMessage == "Confirmação de senha deve ser igual à senha");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithFutureDateOfBirth_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddDays(1) // Future date
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DateOfBirth" && e.ErrorMessage == "Data de nascimento deve ser anterior à data atual");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithVeryOldDateOfBirth_ShouldFail()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "João",
            LastName = "Silva",
            Email = "joao@teste.com",
            Password = "Teste123",
            ConfirmPassword = "Teste123",
            DateOfBirth = DateTime.Today.AddYears(-121) // More than 120 years old
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DateOfBirth" && e.ErrorMessage == "Data de nascimento inválida");
    }

    [Fact]
    public void UserRegistrationDtoValidator_WithMultipleErrors_ShouldReturnAllErrors()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "", // Empty
            LastName = "", // Empty
            Email = "invalid-email", // Invalid
            Password = "123", // Too short
            ConfirmPassword = "456", // Mismatched
            DateOfBirth = DateTime.Today.AddDays(1) // Future date
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Count.Should().BeGreaterThan(5); // Multiple errors
    }

    #endregion

    #region CreateBookDtoValidator Tests

    [Fact]
    public void CreateBookDtoValidator_WithValidData_ShouldPass()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateBookDtoValidator_WithEmptyTitle_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title" && e.ErrorMessage == "Título é obrigatório");
    }

    [Fact]
    public void CreateBookDtoValidator_WithLongTitle_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = new string('A', 201), // 201 characters
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title" && e.ErrorMessage == "Título deve ter entre 1 e 200 caracteres");
    }

    [Fact]
    public void CreateBookDtoValidator_WithEmptyISBN_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ISBN" && e.ErrorMessage == "ISBN é obrigatório");
    }

    [Fact]
    public void CreateBookDtoValidator_WithShortISBN_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "123456789", // Only 9 characters
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ISBN" && e.ErrorMessage == "ISBN deve ter entre 10 e 13 caracteres");
    }

    [Fact]
    public void CreateBookDtoValidator_WithLongISBN_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "12345678901234", // 14 characters
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ISBN" && e.ErrorMessage == "ISBN deve ter entre 10 e 13 caracteres");
    }

    [Fact]
    public void CreateBookDtoValidator_WithInvalidISBNFormat_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "978-123-456-789-0-abc", // Contains letters
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ISBN" && e.ErrorMessage == "ISBN deve conter apenas números, hífens e X");
    }

    [Fact]
    public void CreateBookDtoValidator_WithValidISBNWithHyphens_ShouldPass()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "978-123-456-7", // Valid ISBN with hyphens (13 chars)
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateBookDtoValidator_WithValidISBNWithX_ShouldPass()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "978123456789X", // Valid ISBN with X
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateBookDtoValidator_WithEmptyAuthor_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "",
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Author" && e.ErrorMessage == "Autor é obrigatório");
    }

    [Fact]
    public void CreateBookDtoValidator_WithLongAuthor_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = new string('A', 101), // 101 characters
            Publisher = BookPublisher.Other,
            Synopsis = "Sinopse do livro teste"
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Author" && e.ErrorMessage == "Autor deve ter entre 1 e 100 caracteres");
    }

    [Fact]
    public void CreateBookDtoValidator_WithEmptySynopsis_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = ""
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Synopsis" && e.ErrorMessage == "Sinopse é obrigatória");
    }

    [Fact]
    public void CreateBookDtoValidator_WithLongSynopsis_ShouldFail()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "Livro Teste",
            ISBN = "9781234567890",
            Genre = BookGenre.Fiction,
            Author = "Autor Teste",
            Publisher = BookPublisher.Other,
            Synopsis = new string('A', 5001) // 5001 characters
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Synopsis" && e.ErrorMessage == "Sinopse deve ter no máximo 5000 caracteres");
    }

    [Fact]
    public void CreateBookDtoValidator_WithMultipleErrors_ShouldReturnAllErrors()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = "", // Empty
            ISBN = "123", // Too short
            Genre = BookGenre.Fiction,
            Author = "", // Empty
            Publisher = BookPublisher.Other,
            Synopsis = "" // Empty
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Count.Should().BeGreaterThan(3); // Multiple errors
    }

    #endregion

    #region Edge Cases and Boundary Tests

    [Fact]
    public void UserRegistrationDtoValidator_WithBoundaryValues_ShouldPass()
    {
        // Arrange
        var validator = new UserRegistrationDtoValidator();
        var dto = new UserRegistrationDto
        {
            FirstName = "Jo", // Exactly 2 characters
            LastName = "Si", // Exactly 2 characters
            Email = new string('a', 90) + "@teste.com", // Exactly 100 characters
            Password = "Teste123!", // Exactly 9 characters with required pattern
            ConfirmPassword = "Teste123!",
            DateOfBirth = DateTime.Today.AddYears(-119) // 119 years old (less than 120)
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateBookDtoValidator_WithBoundaryValues_ShouldPass()
    {
        // Arrange
        var validator = new CreateBookDtoValidator();
        var dto = new CreateBookDto
        {
            Title = new string('A', 200), // Exactly 200 characters
            ISBN = "1234567890", // Exactly 10 characters
            Genre = BookGenre.Fiction,
            Author = new string('A', 100), // Exactly 100 characters
            Publisher = BookPublisher.Other,
            Synopsis = new string('A', 5000) // Exactly 5000 characters
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #endregion
}

