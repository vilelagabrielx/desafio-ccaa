using Microsoft.Extensions.Diagnostics.HealthChecks;
using DesafioCCAA.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DesafioCCAA.API.HealthChecks;

public class DatabaseHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseHealthCheck> _logger;

    public DatabaseHealthCheck(ApplicationDbContext context, ILogger<DatabaseHealthCheck> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Verificando saúde do banco de dados...");
            
            // Testa a conectividade básica
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            
            if (!canConnect)
            {
                _logger.LogError("Não foi possível conectar ao banco de dados");
                return HealthCheckResult.Unhealthy("Não foi possível conectar ao banco de dados");
            }

            // Testa uma query simples
            var bookCount = await _context.Books.CountAsync(cancellationToken);
            var userCount = await _context.Users.CountAsync(cancellationToken);
            
            // Obtém informações do provider
            var providerName = _context.Database.ProviderName ?? "Unknown";
            
            _logger.LogInformation("Banco de dados está saudável. Provider: {Provider}, Livros: {BookCount}, Usuários: {UserCount}", 
                providerName, bookCount, userCount);
            
            var data = new Dictionary<string, object>
            {
                { "provider", providerName },
                { "books_count", bookCount },
                { "users_count", userCount },
                { "can_connect", true }
            };
            
            return HealthCheckResult.Healthy($"Banco de dados está funcionando corretamente. Provider: {providerName}", data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar saúde do banco de dados");
            return HealthCheckResult.Unhealthy("Erro ao verificar saúde do banco de dados", ex);
        }
    }
}
