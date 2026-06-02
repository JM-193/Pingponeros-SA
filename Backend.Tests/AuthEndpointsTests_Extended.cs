// AuthEndpointsTests_Extended.cs
using System.Net;
using System.Net.Http.Json;
using Backend.DTOs;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class AuthEndpointsTests_Extended : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthEndpointsTests_Extended(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // Login Tests
    [Fact]
    public async Task Login_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "", Contrasena = "Password123!" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns400ConContraseñaVacia()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", Contrasena = "" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401ConCredencialesInvalidas()
    {
        _factory.UsuarioRepo.ObtenerHashMasRecienteAsync(Arg.Any<string>()).Returns((string?)null);

        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", Contrasena = "WrongPassword123!" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns200ConCredencialesValidas()
    {
        var correo = "test@ucr.ac.cr";
        var contrasena = "ValidPassword123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(contrasena);
        var usuario = new Usuario
        {
            CorreoInstitucional = correo,
            PrimerNombre = "Test",
            SegundoNombre = null,
            PrimerApellido = "User",
            SegundoApellido = "Name",
            Rol = 0,
            Estado = 1
        };

        _factory.UsuarioRepo.ObtenerHashMasRecienteAsync(correo).Returns(hash);
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(correo).Returns(usuario);

        var dto = new { CorreoInstitucional = correo, Contrasena = contrasena };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401ConContraseñaIncorrecta()
    {
        var correo = "test@ucr.ac.cr";
        var hash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!");

        _factory.UsuarioRepo.ObtenerHashMasRecienteAsync(correo).Returns(hash);

        var dto = new { CorreoInstitucional = correo, Contrasena = "WrongPassword123!" };

        var response = await _client.PostAsJsonAsync("/auth/login", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Recuperar Contraseña Tests
    [Fact]
    public async Task RecuperarContrasena_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "" };

        var response = await _client.PostAsJsonAsync("/auth/recuperar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RecuperarContrasena_Returns200CuandoCorreoNoExiste()
    {
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns((Usuario?)null);

        var dto = new { CorreoInstitucional = "noexiste@ucr.ac.cr" };

        var response = await _client.PostAsJsonAsync("/auth/recuperar-contrasena", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RecuperarContrasena_Returns200CuandoCorreoExiste()
    {
        var usuario = new Usuario
        {
            CorreoInstitucional = "test@ucr.ac.cr",
            PrimerNombre = "Test",
            PrimerApellido = "User",
            SegundoApellido = "Name",
            Rol = 0,
            Estado = 1
        };

        _factory.UsuarioRepo.ObtenerPorCorreoAsync("test@ucr.ac.cr").Returns(usuario);
        _factory.UsuarioRepo.InsertarContraseñaAsync("test@ucr.ac.cr", Arg.Any<string>()).Returns(Task.CompletedTask);

        var dto = new { CorreoInstitucional = "test@ucr.ac.cr" };

        var response = await _client.PostAsJsonAsync("/auth/recuperar-contrasena", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // Cambiar Contraseña Tests
    [Fact]
    public async Task CambiarContrasena_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "", ContraseñaActual = "Old123!", ContraseñaNueva = "New123!Aa" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaActualVacia()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "", ContraseñaNueva = "New123!Aa" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaNuevaVacia()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!", ContraseñaNueva = "" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400CuandoContraseñasIguales()
    {
        var mismaContrasena = "Same123!Aa";
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = mismaContrasena, ContraseñaNueva = mismaContrasena };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaNuevaMuyCortaAsync()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "Short1!" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaSinMayuscula()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "newpassword123!" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaSinMinuscula()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "NEWPASSWORD123!" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaSinNumero()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "NewPassword!Aa" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns400ConContraseñaSinCaracterEspecial()
    {
        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "NewPassword123Aa" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns404CuandoUsuarioNoExiste()
    {
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns((Usuario?)null);

        var dto = new { CorreoInstitucional = "noexiste@ucr.ac.cr", ContraseñaActual = "Old123!Aa", ContraseñaNueva = "New123!Bbbbbb" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns401ConContraseñaActualIncorrecta()
    {
        var usuario = new Usuario
        {
            CorreoInstitucional = "test@ucr.ac.cr",
            PrimerNombre = "Test",
            PrimerApellido = "User",
            SegundoApellido = "Name",
            Rol = 0,
            Estado = 1
        };

        var hashIncorrecto = BCrypt.Net.BCrypt.HashPassword("DifferentPassword123!Xyz");

        _factory.UsuarioRepo.ObtenerPorCorreoAsync("test@ucr.ac.cr").Returns(usuario);
        _factory.UsuarioRepo.ObtenerHashMasRecienteAsync("test@ucr.ac.cr").Returns(hashIncorrecto);

        var dto = new { CorreoInstitucional = "test@ucr.ac.cr", ContraseñaActual = "Wrong123!Aa", ContraseñaNueva = "New123!Bbbbbb" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CambiarContrasena_Returns200CuandoSeActualizaCorrectamente()
    {
        var correo = "test@ucr.ac.cr";
        var usuario = new Usuario
        {
            CorreoInstitucional = correo,
            PrimerNombre = "Test",
            PrimerApellido = "User",
            SegundoApellido = "Name",
            Rol = 0,
            Estado = 1
        };

        var hashActual = BCrypt.Net.BCrypt.HashPassword("Old123!Aa");

        _factory.UsuarioRepo.ObtenerPorCorreoAsync(correo).Returns(usuario);
        _factory.UsuarioRepo.ObtenerHashMasRecienteAsync(correo).Returns(hashActual);
        _factory.UsuarioRepo.CambiarContraseñaAsync(correo, Arg.Any<string>()).Returns(Task.CompletedTask);

        var dto = new { CorreoInstitucional = correo, ContraseñaActual = "Old123!Aa", ContraseñaNueva = "New123!Bbbbbb" };

        var response = await _client.PostAsJsonAsync("/auth/cambiar-contrasena", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
