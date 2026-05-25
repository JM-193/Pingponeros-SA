// EmailService.cs
using System.Net;
using System.Net.Mail;

namespace Backend.Services;

/// <summary>
/// Implementación del servicio de correo usando SMTP.
/// </summary>
internal class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromDisplayName;

    public EmailService(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        _smtpHost = configuration["Email:SmtpHost"]
            ?? throw new InvalidOperationException("Email:SmtpHost no está configurado.");
        _smtpPort = int.Parse(configuration["Email:SmtpPort"]
            ?? throw new InvalidOperationException("Email:SmtpPort no está configurado."), System.Globalization.CultureInfo.InvariantCulture);
        _smtpUser = configuration["Email:SmtpUser"]
            ?? throw new InvalidOperationException("Email:SmtpUser no está configurado.");
        _smtpPassword = configuration["Email:SmtpPassword"]
            ?? throw new InvalidOperationException("Email:SmtpPassword no está configurado.");
        _fromEmail = configuration["Email:FromEmail"]
            ?? throw new InvalidOperationException("Email:FromEmail no está configurado.");
        _fromDisplayName = configuration["Email:FromDisplayName"] ?? "Sistema Pingponeros";
    }

    public async Task<bool> EnviarAsync(string destinatario, string asunto, string cuerpo)
    {
        if (string.IsNullOrWhiteSpace(destinatario))
        {
            return false;
        }

        try
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_smtpUser, _smtpPassword),
                Timeout = 10000 // 10 seconds
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromDisplayName),
                Subject = asunto,
                Body = cuerpo,
                IsBodyHtml = true
            };

            mailMessage.To.Add(destinatario);

            await client.SendMailAsync(mailMessage).ConfigureAwait(false);
            return true;
        }
        catch (SmtpException)
        {
            return false;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}
