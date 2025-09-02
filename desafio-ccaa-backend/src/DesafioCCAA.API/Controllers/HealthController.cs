using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DesafioCCAA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly HealthCheckService _healthCheckService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        HealthCheckService healthCheckService,
        ApplicationDbContext context,
        ILogger<HealthController> logger)
    {
        _healthCheckService = healthCheckService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtém informações detalhadas sobre a saúde da aplicação
    /// </summary>
    [HttpGet("detailed")]
    public async Task<IActionResult> GetDetailedHealth()
    {
        try
        {
            var healthReport = await _healthCheckService.CheckHealthAsync();
            
            var response = new
            {
                status = healthReport.Status.ToString(),
                totalDuration = healthReport.TotalDuration.ToString("c"), // Formato TimeSpan compatível
                totalDurationMs = healthReport.TotalDuration.TotalMilliseconds, // Para compatibilidade
                timestamp = DateTime.UtcNow,
                checks = healthReport.Entries.Select(entry => new
                {
                    name = entry.Key,
                    status = entry.Value.Status.ToString(),
                    description = entry.Value.Description,
                    duration = entry.Value.Duration.ToString("c"), // Formato TimeSpan compatível
                    durationMs = entry.Value.Duration.TotalMilliseconds, // Para compatibilidade
                    tags = entry.Value.Tags,
                    data = entry.Value.Data,
                    exception = entry.Value.Exception?.Message
                }),
                summary = new
                {
                    total = healthReport.Entries.Count,
                    healthy = healthReport.Entries.Count(e => e.Value.Status == HealthStatus.Healthy),
                    degraded = healthReport.Entries.Count(e => e.Value.Status == HealthStatus.Degraded),
                    unhealthy = healthReport.Entries.Count(e => e.Value.Status == HealthStatus.Unhealthy)
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter health check detalhado");
            return StatusCode(500, new { error = "Erro interno ao verificar saúde da aplicação" });
        }
    }

    /// <summary>
    /// Obtém estatísticas do banco de dados
    /// </summary>
    [HttpGet("database-stats")]
    public async Task<IActionResult> GetDatabaseStats()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (!canConnect)
            {
                return StatusCode(503, new { error = "Banco de dados não acessível" });
            }

            var stats = new
            {
                provider = _context.Database.ProviderName,
                canConnect = true,
                booksCount = await _context.Books.CountAsync(),
                usersCount = await _context.Users.CountAsync(),
                lastBookCreated = await _context.Books
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => b.CreatedAt)
                    .FirstOrDefaultAsync(),
                lastUserCreated = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => u.CreatedAt)
                    .FirstOrDefaultAsync()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas do banco de dados");
            return StatusCode(500, new { error = "Erro ao obter estatísticas do banco de dados" });
        }
    }

    /// <summary>
    /// Verifica se a aplicação está pronta para receber tráfego
    /// </summary>
    [HttpGet("ready")]
    public async Task<IActionResult> IsReady()
    {
        try
        {
            var healthReport = await _healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"));
            
            if (healthReport.Status == HealthStatus.Healthy)
            {
                return Ok(new { status = "ready", timestamp = DateTime.UtcNow });
            }
            else
            {
                return StatusCode(503, new 
                { 
                    status = "not ready", 
                    timestamp = DateTime.UtcNow,
                    issues = healthReport.Entries
                        .Where(e => e.Value.Status != HealthStatus.Healthy)
                        .Select(e => new { name = e.Key, status = e.Value.Status.ToString(), description = e.Value.Description })
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar readiness");
            return StatusCode(500, new { error = "Erro ao verificar readiness" });
        }
    }

    /// <summary>
    /// Verifica se a aplicação está viva (liveness probe)
    /// </summary>
    [HttpGet("live")]
    public IActionResult IsAlive()
    {
        return Ok(new { status = "alive", timestamp = DateTime.UtcNow });
    }
}
