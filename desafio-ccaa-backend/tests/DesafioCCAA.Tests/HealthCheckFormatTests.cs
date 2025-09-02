using Xunit;
using FluentAssertions;
using System.Text.Json;
using System.Globalization;

namespace DesafioCCAA.Tests;

public class HealthCheckFormatTests
{
    [Fact]
    public void TimeSpanFormat_ShouldBeCompatibleWithHealthChecksUI()
    {
        // Arrange
        var timeSpan = TimeSpan.FromMilliseconds(1234.567);
        
        // Act
        var formatted = timeSpan.ToString("c");
        
        // Assert
        formatted.Should().NotBeNull();
        formatted.Should().MatchRegex(@"^\d+:\d{2}:\d{2}\.\d{7}$"); // Formato: h:mm:ss.fffffff
    }

    [Fact]
    public void TimeSpanFormat_ShouldBeParseableByJsonSerializer()
    {
        // Arrange
        var timeSpan = TimeSpan.FromMilliseconds(1234.567);
        var formatted = timeSpan.ToString("c");
        
        // Act
        var json = JsonSerializer.Serialize(new { duration = formatted });
        var deserialized = JsonSerializer.Deserialize<JsonElement>(json);
        
        // Assert
        deserialized.TryGetProperty("duration", out var durationProperty).Should().BeTrue();
        durationProperty.GetString().Should().Be(formatted);
    }

    [Fact]
    public void TimeSpanFormat_ShouldBeParseableBackToTimeSpan()
    {
        // Arrange
        var originalTimeSpan = TimeSpan.FromMilliseconds(1234.567);
        var formatted = originalTimeSpan.ToString("c");
        
        // Act
        var parsed = TimeSpan.Parse(formatted, CultureInfo.InvariantCulture);
        
        // Assert
        parsed.Should().BeCloseTo(originalTimeSpan, TimeSpan.FromMilliseconds(0.001));
    }

    [Fact]
    public void HealthCheckResponseFormat_ShouldHaveCorrectStructure()
    {
        // Arrange
        var mockResponse = new
        {
            status = "Healthy",
            totalDuration = TimeSpan.FromMilliseconds(1234.567).ToString("c"),
            totalDurationMs = 1234.567,
            timestamp = DateTime.UtcNow,
            checks = new[]
            {
                new
                {
                    name = "database",
                    status = "Healthy",
                    description = "Database is healthy",
                    duration = TimeSpan.FromMilliseconds(100).ToString("c"),
                    durationMs = 100.0,
                    tags = new[] { "ready", "database" },
                    data = new { provider = "PostgreSQL" },
                    exception = (string?)null
                }
            },
            summary = new
            {
                total = 1,
                healthy = 1,
                degraded = 0,
                unhealthy = 0
            }
        };

        // Act
        var json = JsonSerializer.Serialize(mockResponse);
        var deserialized = JsonSerializer.Deserialize<JsonElement>(json);

        // Assert
        deserialized.TryGetProperty("status", out _).Should().BeTrue();
        deserialized.TryGetProperty("totalDuration", out _).Should().BeTrue();
        deserialized.TryGetProperty("totalDurationMs", out _).Should().BeTrue();
        deserialized.TryGetProperty("timestamp", out _).Should().BeTrue();
        deserialized.TryGetProperty("checks", out _).Should().BeTrue();
        deserialized.TryGetProperty("summary", out _).Should().BeTrue();
        
        // Verificar se o formato TimeSpan está correto
        var totalDuration = deserialized.GetProperty("totalDuration").GetString();
        totalDuration.Should().MatchRegex(@"^\d+:\d{2}:\d{2}\.\d{7}$");
    }
}
