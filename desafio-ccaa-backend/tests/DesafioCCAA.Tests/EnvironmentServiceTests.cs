using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Moq;
using Xunit;
using FluentAssertions;
using DesafioCCAA.Business.Services;

namespace DesafioCCAA.Tests;

public class EnvironmentServiceTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<IWebHostEnvironment> _webHostEnvironmentMock;
    private readonly EnvironmentService _environmentService;

    public EnvironmentServiceTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        _webHostEnvironmentMock = new Mock<IWebHostEnvironment>();
        _environmentService = new EnvironmentService(_configurationMock.Object, _webHostEnvironmentMock.Object);
    }

    [Fact]
    public void GetEnvironmentName_ValidConfiguration_ReturnsEnvironmentName()
    {
        // Arrange
        var expectedEnvironment = "development";
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns(expectedEnvironment);

        // Act
        var result = _environmentService.GetEnvironmentName();

        // Assert
        result.Should().Be(expectedEnvironment);
    }

    [Fact]
    public void GetEnvironmentName_NullConfiguration_ReturnsWebHostEnvironment()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns((string?)null);
        _webHostEnvironmentMock
            .Setup(x => x.EnvironmentName)
            .Returns("Development");

        // Act
        var result = _environmentService.GetEnvironmentName();

        // Assert
        result.Should().Be("development");
    }

    [Fact]
    public void IsDevelopment_DevelopmentEnvironment_ReturnsTrue()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("development");

        // Act
        var result = _environmentService.IsDevelopment();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDevelopment_ProductionEnvironment_ReturnsFalse()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("production");

        // Act
        var result = _environmentService.IsDevelopment();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsUAT_UATEnvironment_ReturnsTrue()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("uat");

        // Act
        var result = _environmentService.IsUAT();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsProduction_ProductionEnvironment_ReturnsTrue()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("production");

        // Act
        var result = _environmentService.IsProduction();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDevelopmentOrUAT_DevelopmentEnvironment_ReturnsTrue()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("development");

        // Act
        var result = _environmentService.IsDevelopmentOrUAT();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDevelopmentOrUAT_UATEnvironment_ReturnsTrue()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("uat");

        // Act
        var result = _environmentService.IsDevelopmentOrUAT();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsDevelopmentOrUAT_ProductionEnvironment_ReturnsFalse()
    {
        // Arrange
        _configurationMock
            .Setup(x => x["Environment:Name"])
            .Returns("production");

        // Act
        var result = _environmentService.IsDevelopmentOrUAT();

        // Assert
        result.Should().BeFalse();
    }
}
