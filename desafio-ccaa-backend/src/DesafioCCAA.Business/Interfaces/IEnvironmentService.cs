namespace DesafioCCAA.Business.Interfaces;

public interface IEnvironmentService
{
    string GetEnvironmentName();
    bool IsDevelopment();
    bool IsUAT();
    bool IsProduction();
    bool IsDevelopmentOrUAT();
}
