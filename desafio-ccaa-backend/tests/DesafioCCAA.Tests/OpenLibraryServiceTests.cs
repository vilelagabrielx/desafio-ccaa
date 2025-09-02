using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using DesafioCCAA.Business.Services;
using System.Text.Json;

namespace DesafioCCAA.Tests;

public class OpenLibraryServiceTests
{
    private readonly Mock<ILogger<OpenLibraryService>> _mockLogger;
    private readonly Mock<HttpClient> _mockHttpClient;
    private readonly OpenLibraryService _service;

    public OpenLibraryServiceTests()
    {
        _mockLogger = new Mock<ILogger<OpenLibraryService>>();
        _mockHttpClient = new Mock<HttpClient>();
        _service = new OpenLibraryService(_mockLogger.Object, _mockHttpClient.Object);
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithStringDescription_ShouldReturnString()
    {
        // Arrange
        var description = "This is a test description";
        
        // Act
        var result = CallExtractDescriptionFromWorkData(description);
        
        // Assert
        result.Should().Be("This is a test description");
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithJsonElementString_ShouldReturnString()
    {
        // Arrange
        var jsonElement = JsonSerializer.Deserialize<JsonElement>("\"This is a JSON string description\"");
        
        // Act
        var result = CallExtractDescriptionFromWorkData(jsonElement);
        
        // Assert
        result.Should().Be("This is a JSON string description");
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithJsonElementObject_ShouldExtractValue()
    {
        // Arrange
        var jsonElement = JsonSerializer.Deserialize<JsonElement>("{\"value\": \"This is a value from object\"}");
        
        // Act
        var result = CallExtractDescriptionFromWorkData(jsonElement);
        
        // Assert
        result.Should().Be("This is a value from object");
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithJsonElementObjectWithDescription_ShouldExtractDescription()
    {
        // Arrange
        var jsonElement = JsonSerializer.Deserialize<JsonElement>("{\"description\": \"This is a description from object\"}");
        
        // Act
        var result = CallExtractDescriptionFromWorkData(jsonElement);
        
        // Assert
        result.Should().Be("This is a description from object");
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithNull_ShouldReturnNull()
    {
        // Act
        var result = CallExtractDescriptionFromWorkData(null);
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void ExtractDescriptionFromWorkData_WithComplexObject_ShouldReturnToString()
    {
        // Arrange
        var jsonElement = JsonSerializer.Deserialize<JsonElement>("{\"type\": \"text\", \"content\": \"Some content\"}");
        
        // Act
        var result = CallExtractDescriptionFromWorkData(jsonElement);
        
        // Assert
        result.Should().NotBeNull();
        result.Should().Contain("type");
        result.Should().Contain("content");
    }

    // Método auxiliar para acessar o método privado via reflection
    private string? CallExtractDescriptionFromWorkData(object? description)
    {
        var method = typeof(OpenLibraryService).GetMethod("ExtractDescriptionFromWorkData", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        return method?.Invoke(_service, new[] { description }) as string;
    }
}
