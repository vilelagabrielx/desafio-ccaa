using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using DesafioCCAA.Business.Interfaces;

namespace DesafioCCAA.Business.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly SmtpConfiguration _smtpConfig;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _smtpConfig = GetSmtpConfiguration();
    }

    public SmtpConfiguration GetSmtpConfiguration()
    {
        var smtpSection = _configuration.GetSection("Email:Smtp");
        
        return new SmtpConfiguration
        {
            Host = smtpSection["Host"] ?? "smtp.gmail.com",
            Port = int.Parse(smtpSection["Port"] ?? "587"),
            EnableSsl = bool.Parse(smtpSection["EnableSsl"] ?? "true"),
            UseDefaultCredentials = bool.Parse(smtpSection["UseDefaultCredentials"] ?? "false"),
            Username = smtpSection["Username"] ?? string.Empty,
            Password = smtpSection["Password"] ?? string.Empty,
            FromEmail = smtpSection["FromEmail"] ?? "noreply@desafioccaa.com",
            FromName = smtpSection["FromName"] ?? "Desafio CCAA"
        };
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            // Verificar se SMTP está configurado
            if (string.IsNullOrEmpty(_smtpConfig.Username) || string.IsNullOrEmpty(_smtpConfig.Password))
            {
                _logger.LogWarning("SMTP não configurado, usando PickupDirectory como fallback");
                return await SendEmailViaPickupDirectoryAsync(to, subject, body, isHtml);
            }

            using var client = new SmtpClient(_smtpConfig.Host, _smtpConfig.Port);
            client.EnableSsl = _smtpConfig.EnableSsl;
            client.UseDefaultCredentials = _smtpConfig.UseDefaultCredentials;
            
            if (!_smtpConfig.UseDefaultCredentials)
            {
                client.Credentials = new NetworkCredential(_smtpConfig.Username, _smtpConfig.Password);
            }

            using var message = new MailMessage();
            message.From = new MailAddress(_smtpConfig.FromEmail, _smtpConfig.FromName);
            message.To.Add(to);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = isHtml;

            await client.SendMailAsync(message);
            
            _logger.LogInformation("Email enviado com sucesso via SMTP para: {Email}", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email via SMTP para: {Email}", to);
            
            // Fallback para PickupDirectory em caso de erro
            _logger.LogInformation("Tentando fallback para PickupDirectory...");
            return await SendEmailViaPickupDirectoryAsync(to, subject, body, isHtml);
        }
    }

    private async Task<bool> SendEmailViaPickupDirectoryAsync(string to, string subject, string body, bool isHtml)
    {
        try
        {
            var pickupDirectory = _configuration["Email:PickupDirectory"] ?? "C:\\temp\\emails";
            
            // Ensure directory exists
            if (!Directory.Exists(pickupDirectory))
            {
                Directory.CreateDirectory(pickupDirectory);
            }

            var message = new MailMessage
            {
                From = new MailAddress(_smtpConfig.FromEmail, _smtpConfig.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };
            
            message.To.Add(new MailAddress(to));

            // Save to pickup directory
            var fileName = $"email_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid()}.eml";
            var filePath = Path.Combine(pickupDirectory, fileName);
            
            // Create .eml file content manually
            var emlContent = $@"From: {message.From}
To: {string.Join(", ", message.To.Select(t => t.ToString()))}
Subject: {message.Subject}
MIME-Version: 1.0
Content-Type: {(isHtml ? "text/html" : "text/plain")}; charset=utf-8

{message.Body}";
            
            // Save to file
            await File.WriteAllTextAsync(filePath, emlContent);
            
            _logger.LogInformation("Email salvo em PickupDirectory: {FilePath}", filePath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar email em PickupDirectory para: {Email}", to);
            return false;
        }
    }

    public async Task<bool> TestSmtpConnectionAsync()
    {
        try
        {
            if (string.IsNullOrEmpty(_smtpConfig.Username) || string.IsNullOrEmpty(_smtpConfig.Password))
            {
                _logger.LogWarning("SMTP não configurado - Username ou Password vazios");
                return false;
            }

            using var client = new SmtpClient(_smtpConfig.Host, _smtpConfig.Port);
            client.EnableSsl = _smtpConfig.EnableSsl;
            client.UseDefaultCredentials = _smtpConfig.UseDefaultCredentials;
            
            if (!_smtpConfig.UseDefaultCredentials)
            {
                client.Credentials = new NetworkCredential(_smtpConfig.Username, _smtpConfig.Password);
            }

            // Test connection with a proper message
            using var testMessage = new MailMessage();
            testMessage.From = new MailAddress(_smtpConfig.FromEmail, _smtpConfig.FromName);
            testMessage.To.Add(new MailAddress(_smtpConfig.Username)); // Send to self for testing
            testMessage.Subject = "Teste de Conexão SMTP";
            testMessage.Body = "Este é um email de teste para verificar a conexão SMTP.";
            testMessage.IsBodyHtml = false;

            // Test connection
            await client.SendMailAsync(testMessage);
            
            _logger.LogInformation("Teste de conexão SMTP bem-sucedido");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro no teste de conexão SMTP: {Error}", ex.Message);
            return false;
        }
    }

    public string GetEmailPickupDirectory()
    {
        return _configuration["Email:PickupDirectory"] ?? string.Empty;
    }
}
