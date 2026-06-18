// AuthEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class AuthEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_Returns400ConCamposVacios()
    {
        var dto = new { CorreoInstitucional = "", Contrasena = "" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401CuandoUsuarioNoExiste()
    {
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync(Arg.Any<string>())
            .Returns((Password?)null);
        var dto = new { CorreoInstitucional = "noexiste@test.com", Contrasena = "password123" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401ConContrasenaIncorrecta()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("contrasenaCorrecta!");
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync("test@test.com")
            .Returns(new Password { Hash = hash, EsTemporal = false, FechaExpiracion = DateTime.Now.AddDays(30) });
        var dto = new { CorreoInstitucional = "test@test.com", Contrasena = "contrasenaIncorrecta" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns200ConCredencialesCorrectas()
    {
        const string password = "contrasenaCorrecta!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var usuario = new User
        {
            CorreoInstitucional = "test@test.com",
            PrimerNombre = "Test",
            PrimerApellido = "Usuario",
            Rol = 0,
            Estado = 1
        };
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync("test@test.com")
            .Returns(new Password { Hash = hash, EsTemporal = false, FechaExpiracion = DateTime.Now.AddDays(30) });
        _factory.UsuarioRepo
            .ObtenerPorCorreoAsync("test@test.com")
            .Returns(usuario);
        var dto = new { CorreoInstitucional = "test@test.com", Contrasena = password };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns200ConContrasenaTemporalVigente()
    {
        const string password = "temporalVigente!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var usuario = new User
        {
            CorreoInstitucional = "temp@test.com",
            PrimerNombre = "Temp",
            PrimerApellido = "Usuario",
            Rol = 0,
            Estado = 1
        };
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync("temp@test.com")
            .Returns(new Password { Hash = hash, EsTemporal = true, FechaExpiracion = DateTime.Now.AddHours(4) });
        _factory.UsuarioRepo
            .ObtenerPorCorreoAsync("temp@test.com")
            .Returns(usuario);
        var dto = new { CorreoInstitucional = "temp@test.com", Contrasena = password };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await _factory.UsuarioRepo
            .DidNotReceive()
            .DesactivarPorContrasenaTemporalExpiradaAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task Login_Returns403YDesactivaConContrasenaTemporalVencida()
    {
        const string password = "temporalVencida!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var usuario = new User
        {
            CorreoInstitucional = "expirada@test.com",
            PrimerNombre = "Temp",
            PrimerApellido = "Expirada",
            Rol = 0,
            Estado = 1
        };
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync("expirada@test.com")
            .Returns(new Password { Hash = hash, EsTemporal = true, FechaExpiracion = DateTime.Now.AddMinutes(-1) });
        _factory.UsuarioRepo
            .ObtenerPorCorreoAsync("expirada@test.com")
            .Returns(usuario);
        var dto = new { CorreoInstitucional = "expirada@test.com", Contrasena = password };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Contains("contraseña temporal ha expirado", body, StringComparison.OrdinalIgnoreCase);
        await _factory.UsuarioRepo
            .Received(1)
            .DesactivarPorContrasenaTemporalExpiradaAsync("expirada@test.com");
    }

    [Fact]
    public async Task RecuperarContrasena_Returns403SiUsuarioFueDesactivadoPorTemporalVencida()
    {
        var usuario = new User
        {
            CorreoInstitucional = "expirada@test.com",
            PrimerNombre = "Temp",
            PrimerApellido = "Expirada",
            Rol = 0,
            Estado = 0
        };
        _factory.UsuarioRepo
            .ObtenerPorCorreoAsync("expirada@test.com")
            .Returns(usuario);
        _factory.UsuarioRepo
            .ObtenerContrasenaMasRecienteAsync("expirada@test.com")
            .Returns(new Password
            {
                Hash = BCrypt.Net.BCrypt.HashPassword("Temporal123!"),
                EsTemporal = true,
                FechaExpiracion = DateTime.Now.AddDays(-1)
            });
        var dto = new { CorreoInstitucional = "expirada@test.com" };

        var response = await _client.PostAsJsonAsync("/auth/recuperar-contrasena", dto);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await _factory.UsuarioRepo
            .DidNotReceive()
            .InsertarContraseñaAsync("expirada@test.com", Arg.Any<string>());
    }
}
