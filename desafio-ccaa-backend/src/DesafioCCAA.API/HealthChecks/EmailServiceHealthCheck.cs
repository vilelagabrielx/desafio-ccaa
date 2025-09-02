using Microsoft.Extensions.Diagnostics.HealthChecks;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Business.Services;

namespace DesafioCCAA.API.HealthChecks;

public class EmailServiceHealthCheck : IHealthCheck
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailServiceHealthCheck> _logger;

    public EmailServiceHealthCheck(IEmailService emailService, ILogger<EmailServiceHealthCheck> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Verificando saúde do serviço de email...");
            
            // Verifica se o diretório de pickup está acessível (modo desenvolvimento)
            var pickupDirectory = _emailService.GetEmailPickupDirectory();
            
            if (!string.IsNullOrEmpty(pickupDirectory))
            {
                if (Directory.Exists(pickupDirectory))
                {
                    _logger.LogInformation("Diretório de email pickup está acessível: {Directory}", pickupDirectory);
                    return HealthCheckResult.Healthy($"Serviço de email configurado corretamente. Pickup directory: {pickupDirectory}");
                }
                else
                {
                    _logger.LogWarning("Diretório de email pickup não existe: {Directory}", pickupDirectory);
                    return HealthCheckResult.Degraded($"Diretório de email pickup não existe: {pickupDirectory}");
                }
            }
            else
            {
                // Se não há pickup directory, assume que está usando SMTP
                _logger.LogInformation("Serviço de email configurado para SMTP");
                return HealthCheckResult.Healthy("Serviço de email configurado para SMTP");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar serviço de email");
            return HealthCheckResult.Unhealthy("Erro ao verificar serviço de email", ex);
        }
    }
}
