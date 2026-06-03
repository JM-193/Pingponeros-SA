using Backend.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Backend.Tests;

public sealed class EmailServiceTests
{
    [Fact]
    public async Task EnviarAsync_ReturnsFalseConDestinatarioVacioSinUsarSmtp()
    {
        var service = new EmailService(CrearConfiguracionValida());

        var enviado = await service.EnviarAsync("", "Asunto", "<p>Cuerpo</p>");

        Assert.False(enviado);
    }

    [Theory]
    [InlineData("Email:SmtpHost")]
    [InlineData("Email:SmtpPort")]
    [InlineData("Email:SmtpUser")]
    [InlineData("Email:SmtpPassword")]
    [InlineData("Email:FromEmail")]
    public void Constructor_LanzaExcepcionCuandoFaltaConfiguracionRequerida(string claveFaltante)
    {
        var valores = CrearValoresConfiguracionValida();
        valores.Remove(claveFaltante);
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(valores)
            .Build();

        Assert.Throws<InvalidOperationException>(() => new EmailService(configuration));
    }

    private static IConfiguration CrearConfiguracionValida() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(CrearValoresConfiguracionValida())
            .Build();

    private static Dictionary<string, string?> CrearValoresConfiguracionValida() => new()
    {
        ["Email:SmtpHost"] = "smtp.test.local",
        ["Email:SmtpPort"] = "587",
        ["Email:SmtpUser"] = "usuario",
        ["Email:SmtpPassword"] = "secreto",
        ["Email:FromEmail"] = "noreply@test.local",
        ["Email:FromDisplayName"] = "Pingponeros Tests",
    };
}
