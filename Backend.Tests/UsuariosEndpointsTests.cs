// UsuariosEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class UsuariosEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public UsuariosEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsuarios_Returns200ConLista()
    {
        var lista = new List<Usuario>
        {
            new() { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 }
        };
        _factory.UsuarioRepo.ObtenerTodosAsync().Returns(lista);

        var response = await _client.GetAsync("/usuarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsuarioPorCorreo_Returns200CuandoExiste()
    {
        var usuario = new Usuario { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };
        _factory.UsuarioRepo.ObtenerPorCorreoAsync("ana@test.com").Returns(usuario);

        var response = await _client.GetAsync("/usuarios/ana%40test.com");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsuarioPorCorreo_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns((Usuario?)null);

        var response = await _client.GetAsync("/usuarios/noexiste%40test.com");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConRolInvalido()
    {
        var dto = new { CorreoInstitucional = "test@test.com", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 5 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConNombreVacio()
    {
        var dto = new { CorreoInstitucional = "test@test.com", PrimerNombre = "", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConApellidoVacio()
    {
        var dto = new { CorreoInstitucional = "test@test.com", PrimerNombre = "Juan", PrimerApellido = "", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns201CuandoSeCreaCorrecto()
    {
        _factory.UsuarioRepo
            .InsertarConContrasenaAsync(Arg.Any<Usuario>(), Arg.Any<string>())
            .Returns(Task.CompletedTask);
        var dto = new { CorreoInstitucional = "nuevo@test.com", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUsuario_Returns200CuandoSeActualiza()
    {
        _factory.UsuarioRepo
            .ActualizarAsync(Arg.Any<string>(), Arg.Any<Usuario>())
            .Returns(true);
        var body = new { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };

        var response = await _client.PutAsJsonAsync("/usuarios/ana%40test.com", body);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUsuario_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo
            .ActualizarAsync(Arg.Any<string>(), Arg.Any<Usuario>())
            .Returns(false);
        var body = new { CorreoInstitucional = "noexiste@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };

        var response = await _client.PutAsJsonAsync("/usuarios/noexiste%40test.com", body);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUsuario_Returns204CuandoSeElimina()
    {
        _factory.UsuarioRepo.EliminarAsync(Arg.Any<string>()).Returns(true);

        var response = await _client.DeleteAsync("/usuarios/ana%40test.com");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUsuario_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo.EliminarAsync(Arg.Any<string>()).Returns(false);

        var response = await _client.DeleteAsync("/usuarios/noexiste%40test.com");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
