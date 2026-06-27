// UserFunctionEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class UserFunctionEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public UserFunctionEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ── GET /funciones-usuarios ─────────────────────────────────────────────

    [Fact]
    public async Task GetFuncionesUsuarios_Returns200ConLista()
    {
        _factory.FuncionUsuarioRepo.ObtenerTodasAsync().Returns(new List<UserFunction>
        {
            new() { Id = 1, CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = "Mi función", Descripcion = "Descripción" },
        });

        var response = await _client.GetAsync("/funciones-usuarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFuncionesUsuarios_Returns200ConListaVacia()
    {
        _factory.FuncionUsuarioRepo.ObtenerTodasAsync().Returns(new List<UserFunction>());

        var response = await _client.GetAsync("/funciones-usuarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── GET /funciones-usuarios/{correo} ────────────────────────────────────

    [Fact]
    public async Task GetFuncionesUsuariosPorCorreo_Returns200ConFunciones()
    {
        _factory.FuncionUsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(new List<UserFunction>
        {
            new() { Id = 1, CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = "Mi función", Descripcion = "Descripción" },
        });

        var response = await _client.GetAsync("/funciones-usuarios/carlos%40ucr.ac.cr");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFuncionesUsuariosPorCorreo_Returns200ConListaVacia()
    {
        _factory.FuncionUsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns(new List<UserFunction>());

        var response = await _client.GetAsync("/funciones-usuarios/sinregistros%40ucr.ac.cr");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── POST /funciones-usuarios ────────────────────────────────────────────

    [Fact]
    public async Task CrearFuncionUsuario_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "", Nombre = "Mi función", Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncionUsuario_Returns400ConNombreVacio()
    {
        var dto = new { CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = "", Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncionUsuario_Returns400ConDescripcionVacia()
    {
        var dto = new { CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = "Mi función", Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncionUsuario_Returns400ConNombreMayorA100Caracteres()
    {
        var dto = new { CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = new string('A', 101), Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncionUsuario_Returns201CuandoSeCreaCorrecto()
    {
        _factory.FuncionUsuarioRepo.InsertarAsync(Arg.Any<UserFunction>()).Returns(1);
        var dto = new { CorreoInstitucional = "carlos@ucr.ac.cr", Nombre = "Mi función", Descripcion = "Descripción de la función" };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncionUsuario_TrimeaCamposAntesDeInsertar()
    {
        UserFunction? capturada = null;
        _factory.FuncionUsuarioRepo.InsertarAsync(Arg.Do<UserFunction>(f => capturada = f)).Returns(1);
        var dto = new { CorreoInstitucional = "  carlos@ucr.ac.cr  ", Nombre = "  Mi función  ", Descripcion = "  Descripción  " };

        var response = await _client.PostAsJsonAsync("/funciones-usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("carlos@ucr.ac.cr", capturada!.CorreoInstitucional);
        Assert.Equal("Mi función", capturada.Nombre);
        Assert.Equal("Descripción", capturada.Descripcion);
    }

    // ── DELETE /funciones-usuarios/{id} ─────────────────────────────────────

    [Fact]
    public async Task EliminarFuncionUsuario_Returns400ConIdInvalido()
    {
        var response = await _client.DeleteAsync("/funciones-usuarios/noesunnumero");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncionUsuario_Returns409CuandoEstaEnActividades()
    {
        _factory.FuncionUsuarioRepo.EstaEnActividadesAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/funciones-usuarios/1");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncionUsuario_Returns200CuandoSeElimina()
    {
        _factory.FuncionUsuarioRepo.EstaEnActividadesAsync(2).Returns(false);
        _factory.FuncionUsuarioRepo.EliminarAsync(2).Returns(true);

        var response = await _client.DeleteAsync("/funciones-usuarios/2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncionUsuario_Returns404CuandoNoExiste()
    {
        _factory.FuncionUsuarioRepo.EstaEnActividadesAsync(99).Returns(false);
        _factory.FuncionUsuarioRepo.EliminarAsync(99).Returns(false);

        var response = await _client.DeleteAsync("/funciones-usuarios/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
