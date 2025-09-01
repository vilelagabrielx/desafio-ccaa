using DesafioCCAA.Business.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;

namespace DesafioCCAA.Business.Services;

public class EnvironmentService : IEnvironmentService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public EnvironmentService(IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
    {
        _configuration = configuration;
        _webHostEnvironment = webHostEnvironment;
    }

    public string GetEnvironmentName()
    {
        // Prioridade: configuração manual > ASP.NET Environment
        var manualEnvironment = _configuration["Environment:Name"];
        if (!string.IsNullOrEmpty(manualEnvironment))
        {
            return manualEnvironment.ToLower();
        }

        // Fallback para ASP.NET Environment
        return _webHostEnvironment.EnvironmentName.ToLower();
    }

    public bool IsDevelopment()
    {
        return GetEnvironmentName() == "dev" || GetEnvironmentName() == "development";
    }

    public bool IsUAT()
    {
        return GetEnvironmentName() == "uat";
    }

    public bool IsProduction()
    {
        return GetEnvironmentName() == "prod" || GetEnvironmentName() == "production";
    }

    public bool IsDevelopmentOrUAT()
    {
        return IsDevelopment() || IsUAT();
    }
}
