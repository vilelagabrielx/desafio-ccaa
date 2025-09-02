using Microsoft.Extensions.Diagnostics.HealthChecks;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Business.Services;

namespace DesafioCCAA.API.HealthChecks;

public class OpenLibraryHealthCheck : IHealthCheck
{
    private readonly IOpenLibraryService _openLibraryService;
    private readonly ILogger<OpenLibraryHealthCheck> _logger;

    public OpenLibraryHealthCheck(IOpenLibraryService openLibraryService, ILogger<OpenLibraryHealthCheck> logger)
    {
        _openLibraryService = openLibraryService;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Verificando saúde do OpenLibrary API...");
            
            // Testa a conectividade com uma busca simples
            var testResult = await _openLibraryService.SearchBookByIsbnAsync("9780134685991"); // ISBN de teste
            
            if (testResult.IsSuccess)
            {
                _logger.LogInformation("OpenLibrary API está funcionando corretamente");
                return HealthCheckResult.Healthy("OpenLibrary API está acessível e funcionando");
            }
            else
            {
                _logger.LogWarning("OpenLibrary API retornou erro: {ErrorMessage}", testResult.ErrorMessage);
                return HealthCheckResult.Degraded($"OpenLibrary API retornou erro: {testResult.ErrorMessage}");
            }
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro de conectividade com OpenLibrary API");
            return HealthCheckResult.Unhealthy("Erro de conectividade com OpenLibrary API", ex);
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout ao conectar com OpenLibrary API");
            return HealthCheckResult.Unhealthy("Timeout ao conectar com OpenLibrary API", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao verificar OpenLibrary API");
            return HealthCheckResult.Unhealthy("Erro inesperado ao verificar OpenLibrary API", ex);
        }
    }
}
