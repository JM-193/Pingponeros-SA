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
            .ObtenerHashMasRecienteAsync(Arg.Any<string>())
            .Returns((string?)null);
        var dto = new { CorreoInstitucional = "noexiste@test.com", Contrasena = "password123" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401ConContrasenaIncorrecta()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("contrasenaCorrecta!");
        _factory.UsuarioRepo
            .ObtenerHashMasRecienteAsync("test@test.com")
            .Returns(hash);
        var dto = new { CorreoInstitucional = "test@test.com", Contrasena = "contrasenaIncorrecta" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns200ConCredencialesCorrectas()
    {
        const string password = "contrasenaCorrecta!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var usuario = new Usuario
        {
            CorreoInstitucional = "test@test.com",
            PrimerNombre = "Test",
            PrimerApellido = "Usuario",
            Rol = 0,
            Estado = 1
        };
        _factory.UsuarioRepo
            .ObtenerHashMasRecienteAsync("test@test.com")
            .Returns(hash);
        _factory.UsuarioRepo
            .ObtenerPorCorreoAsync("test@test.com")
            .Returns(usuario);
        var dto = new { CorreoInstitucional = "test@test.com", Contrasena = password };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
