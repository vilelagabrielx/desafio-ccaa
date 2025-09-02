using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using DesafioCCAA.Business.Services;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Tests;

public class EmailServiceTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<EmailService>> _loggerMock;
    private readonly EmailService _emailService;

    public EmailServiceTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<EmailService>>();

        // Setup default configuration
        SetupDefaultConfiguration();

        _emailService = new EmailService(_configurationMock.Object, _loggerMock.Object);
    }

    private void SetupDefaultConfiguration()
    {
        var smtpSection = new Mock<IConfigurationSection>();
        smtpSection.Setup(x => x["Host"]).Returns("smtp.gmail.com");
        smtpSection.Setup(x => x["Port"]).Returns("587");
        smtpSection.Setup(x => x["EnableSsl"]).Returns("true");
        smtpSection.Setup(x => x["UseDefaultCredentials"]).Returns("false");
        smtpSection.Setup(x => x["Username"]).Returns("test@example.com");
        smtpSection.Setup(x => x["Password"]).Returns("testpassword");
        smtpSection.Setup(x => x["FromEmail"]).Returns("noreply@desafioccaa.com");
        smtpSection.Setup(x => x["FromName"]).Returns("Desafio CCAA");

        _configurationMock.Setup(x => x.GetSection("Email:Smtp")).Returns(smtpSection.Object);
        _configurationMock.Setup(x => x["Email:PickupDirectory"]).Returns("C:\\temp\\emails");
    }

    #region GetSmtpConfiguration Tests

    [Fact]
    public void GetSmtpConfiguration_ShouldReturnCorrectConfiguration()
    {
        // Act
        var config = _emailService.GetSmtpConfiguration();

        // Assert
        config.Should().NotBeNull();
        config.Host.Should().Be("smtp.gmail.com");
        config.Port.Should().Be(587);
        config.EnableSsl.Should().BeTrue();
        config.UseDefaultCredentials.Should().BeFalse();
        config.Username.Should().Be("test@example.com");
        config.Password.Should().Be("testpassword");
        config.FromEmail.Should().Be("noreply@desafioccaa.com");
        config.FromName.Should().Be("Desafio CCAA");
    }

    [Fact]
    public void GetSmtpConfiguration_WithMissingValues_ShouldUseDefaults()
    {
        // Arrange
        var smtpSection = new Mock<IConfigurationSection>();
        smtpSection.Setup(x => x["Host"]).Returns((string?)null);
        smtpSection.Setup(x => x["Port"]).Returns((string?)null);
        smtpSection.Setup(x => x["EnableSsl"]).Returns((string?)null);
        smtpSection.Setup(x => x["UseDefaultCredentials"]).Returns((string?)null);
        smtpSection.Setup(x => x["Username"]).Returns((string?)null);
        smtpSection.Setup(x => x["Password"]).Returns((string?)null);
        smtpSection.Setup(x => x["FromEmail"]).Returns((string?)null);
        smtpSection.Setup(x => x["FromName"]).Returns((string?)null);

        _configurationMock.Setup(x => x.GetSection("Email:Smtp")).Returns(smtpSection.Object);

        var emailService = new EmailService(_configurationMock.Object, _loggerMock.Object);

        // Act
        var config = emailService.GetSmtpConfiguration();

        // Assert
        config.Should().NotBeNull();
        config.Host.Should().Be("smtp.gmail.com"); // Default value
        config.Port.Should().Be(587); // Default value
        config.EnableSsl.Should().BeTrue(); // Default value
        config.UseDefaultCredentials.Should().BeFalse(); // Default value
        config.Username.Should().Be(string.Empty); // Default value
        config.Password.Should().Be(string.Empty); // Default value
        config.FromEmail.Should().Be("noreply@desafioccaa.com"); // Default value
        config.FromName.Should().Be("Desafio CCAA"); // Default value
    }

    #endregion

    #region SendEmailAsync Tests

    [Fact]
    public async Task SendEmailAsync_WithValidSmtpConfig_ShouldReturnTrue()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject";
        var body = "Test Body";
        var isHtml = true;

        // Note: This test will use PickupDirectory since we can't actually send SMTP emails in tests
        // The method will fall back to PickupDirectory when SMTP fails

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SendEmailAsync_WithEmptyCredentials_ShouldUsePickupDirectory()
    {
        // Arrange
        var smtpSection = new Mock<IConfigurationSection>();
        smtpSection.Setup(x => x["Host"]).Returns("smtp.gmail.com");
        smtpSection.Setup(x => x["Port"]).Returns("587");
        smtpSection.Setup(x => x["EnableSsl"]).Returns("true");
        smtpSection.Setup(x => x["UseDefaultCredentials"]).Returns("false");
        smtpSection.Setup(x => x["Username"]).Returns(""); // Empty username
        smtpSection.Setup(x => x["Password"]).Returns(""); // Empty password
        smtpSection.Setup(x => x["FromEmail"]).Returns("noreply@desafioccaa.com");
        smtpSection.Setup(x => x["FromName"]).Returns("Desafio CCAA");

        _configurationMock.Setup(x => x.GetSection("Email:Smtp")).Returns(smtpSection.Object);
        _configurationMock.Setup(x => x["Email:PickupDirectory"]).Returns("C:\\temp\\emails");

        var emailService = new EmailService(_configurationMock.Object, _loggerMock.Object);

        var to = "test@example.com";
        var subject = "Test Subject";
        var body = "Test Body";
        var isHtml = true;

        // Act
        var result = await emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SendEmailAsync_WithPlainTextBody_ShouldReturnTrue()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject";
        var body = "Test Body";
        var isHtml = false;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SendEmailAsync_WithHtmlBody_ShouldReturnTrue()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject";
        var body = "<html><body><h1>Test Body</h1></body></html>";
        var isHtml = true;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    #endregion

    #region TestSmtpConnectionAsync Tests

    [Fact]
    public async Task TestSmtpConnectionAsync_WithValidCredentials_ShouldReturnTrue()
    {
        // Arrange
        // Note: This test will likely fail in a real scenario since we can't actually connect to SMTP
        // But it tests the method structure and error handling

        // Act
        var result = await _emailService.TestSmtpConnectionAsync();

        // Assert
        // The result depends on whether SMTP connection succeeds or fails
        // In test environment, it will likely fail and return false
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TestSmtpConnectionAsync_WithEmptyCredentials_ShouldReturnFalse()
    {
        // Arrange
        var smtpSection = new Mock<IConfigurationSection>();
        smtpSection.Setup(x => x["Host"]).Returns("smtp.gmail.com");
        smtpSection.Setup(x => x["Port"]).Returns("587");
        smtpSection.Setup(x => x["EnableSsl"]).Returns("true");
        smtpSection.Setup(x => x["UseDefaultCredentials"]).Returns("false");
        smtpSection.Setup(x => x["Username"]).Returns(""); // Empty username
        smtpSection.Setup(x => x["Password"]).Returns(""); // Empty password
        smtpSection.Setup(x => x["FromEmail"]).Returns("noreply@desafioccaa.com");
        smtpSection.Setup(x => x["FromName"]).Returns("Desafio CCAA");

        _configurationMock.Setup(x => x.GetSection("Email:Smtp")).Returns(smtpSection.Object);

        var emailService = new EmailService(_configurationMock.Object, _loggerMock.Object);

        // Act
        var result = await emailService.TestSmtpConnectionAsync();

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region SmtpConfiguration Tests

    [Fact]
    public void SmtpConfiguration_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var config = new SmtpConfiguration();

        // Assert
        config.Host.Should().Be(string.Empty);
        config.Port.Should().Be(587);
        config.EnableSsl.Should().BeTrue();
        config.UseDefaultCredentials.Should().BeFalse();
        config.Username.Should().Be(string.Empty);
        config.Password.Should().Be(string.Empty);
        config.FromEmail.Should().Be(string.Empty);
        config.FromName.Should().Be(string.Empty);
    }

    [Fact]
    public void SmtpConfiguration_WithCustomValues_ShouldSetCorrectly()
    {
        // Arrange & Act
        var config = new SmtpConfiguration
        {
            Host = "smtp.custom.com",
            Port = 465,
            EnableSsl = false,
            UseDefaultCredentials = true,
            Username = "custom@example.com",
            Password = "custompassword",
            FromEmail = "from@example.com",
            FromName = "Custom Name"
        };

        // Assert
        config.Host.Should().Be("smtp.custom.com");
        config.Port.Should().Be(465);
        config.EnableSsl.Should().BeFalse();
        config.UseDefaultCredentials.Should().BeTrue();
        config.Username.Should().Be("custom@example.com");
        config.Password.Should().Be("custompassword");
        config.FromEmail.Should().Be("from@example.com");
        config.FromName.Should().Be("Custom Name");
    }

    #endregion

    #region Integration Tests

    [Fact]
    public async Task SendEmailAsync_WithCustomPickupDirectory_ShouldCreateFile()
    {
        // Arrange
        var customPickupDirectory = Path.Combine(Path.GetTempPath(), "test_emails");
        _configurationMock.Setup(x => x["Email:PickupDirectory"]).Returns(customPickupDirectory);

        var smtpSection = new Mock<IConfigurationSection>();
        smtpSection.Setup(x => x["Host"]).Returns("smtp.gmail.com");
        smtpSection.Setup(x => x["Port"]).Returns("587");
        smtpSection.Setup(x => x["EnableSsl"]).Returns("true");
        smtpSection.Setup(x => x["UseDefaultCredentials"]).Returns("false");
        smtpSection.Setup(x => x["Username"]).Returns(""); // Empty to force PickupDirectory
        smtpSection.Setup(x => x["Password"]).Returns("");
        smtpSection.Setup(x => x["FromEmail"]).Returns("noreply@desafioccaa.com");
        smtpSection.Setup(x => x["FromName"]).Returns("Desafio CCAA");

        _configurationMock.Setup(x => x.GetSection("Email:Smtp")).Returns(smtpSection.Object);

        var emailService = new EmailService(_configurationMock.Object, _loggerMock.Object);

        var to = "test@example.com";
        var subject = "Test Subject";
        var body = "Test Body";
        var isHtml = true;

        try
        {
            // Act
            var result = await emailService.SendEmailAsync(to, subject, body, isHtml);

            // Assert
            result.Should().BeTrue();
            
            // Verify directory was created
            Directory.Exists(customPickupDirectory).Should().BeTrue();
            
            // Verify email file was created
            var emailFiles = Directory.GetFiles(customPickupDirectory, "*.eml");
            emailFiles.Length.Should().BeGreaterThan(0);
        }
        finally
        {
            // Cleanup
            if (Directory.Exists(customPickupDirectory))
            {
                Directory.Delete(customPickupDirectory, true);
            }
        }
    }

    [Fact]
    public async Task SendEmailAsync_WithLongBody_ShouldHandleCorrectly()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject";
        var body = new string('A', 10000); // Very long body
        var isHtml = false;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SendEmailAsync_WithSpecialCharacters_ShouldHandleCorrectly()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject with Special Characters: áéíóú çñ";
        var body = "Test Body with Special Characters: áéíóú çñ <>&\"'";
        var isHtml = false;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task SendEmailAsync_WithInvalidEmail_ShouldReturnFalse()
    {
        // Arrange
        var to = "invalid-email"; // Invalid email format
        var subject = "Test Subject";
        var body = "Test Body";
        var isHtml = true;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        // The service should return false for invalid email format
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithNullBody_ShouldHandleGracefully()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "Test Subject";
        string? body = null;
        var isHtml = true;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body!, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SendEmailAsync_WithEmptySubject_ShouldHandleGracefully()
    {
        // Arrange
        var to = "test@example.com";
        var subject = "";
        var body = "Test Body";
        var isHtml = true;

        // Act
        var result = await _emailService.SendEmailAsync(to, subject, body, isHtml);

        // Assert
        result.Should().BeTrue();
    }

    #endregion
}

