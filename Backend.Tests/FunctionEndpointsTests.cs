// FunctionEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class FunctionEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public FunctionEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ── GET /funciones ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetFunciones_Returns200ConLista()
    {
        _factory.FuncionRepo.ObtenerTodasAsync().Returns(new List<Function>
        {
            new() { Id = 1, Nombre = "Elaborar informes", Descripcion = "Redactar informes" },
        });

        var response = await _client.GetAsync("/funciones");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFunciones_Returns200ConListaVacia()
    {
        _factory.FuncionRepo.ObtenerTodasAsync().Returns(new List<Function>());

        var response = await _client.GetAsync("/funciones");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── POST /funciones ─────────────────────────────────────────────────────

    [Fact]
    public async Task CrearFuncion_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncion_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "Elaborar informes", Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncion_Returns400ConNombreMayorA100Caracteres()
    {
        var dto = new { Nombre = new string('A', 101), Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncion_Returns409CuandoNombreYaExiste()
    {
        _factory.FuncionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "Elaborar informes", Descripcion = "Redactar informes" };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncion_Returns201CuandoSeCreaCorrecto()
    {
        _factory.FuncionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.FuncionRepo.InsertarAsync(Arg.Any<Function>()).Returns(1);
        var dto = new { Nombre = "Atención al cliente", Descripcion = "Brindar atención al público" };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearFuncion_NormalizaNombreAntesDeInsertar()
    {
        Function? capturada = null;
        _factory.FuncionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.FuncionRepo.InsertarAsync(Arg.Do<Function>(f => capturada = f)).Returns(1);
        var dto = new { Nombre = "  Elaborar Informes  ", Descripcion = "  Redactar informes mensuales  " };

        var response = await _client.PostAsJsonAsync("/funciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("Elaborar Informes", capturada!.Nombre);
        Assert.Equal("Redactar informes mensuales", capturada.Descripcion);
    }

    // ── DELETE /funciones/{nombre} ──────────────────────────────────────────

    [Fact]
    public async Task EliminarFuncion_Returns404CuandoNoExiste()
    {
        _factory.FuncionRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((Function?)null);

        var response = await _client.DeleteAsync("/funciones/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncion_Returns409CuandoEstaEnActividades()
    {
        _factory.FuncionRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new Function { Id = 1, Nombre = "Elaborar informes", Descripcion = "Redactar informes" });
        _factory.FuncionRepo.EstaEnActividadesAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/funciones/Elaborar%20informes");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncion_Returns200CuandoSeElimina()
    {
        _factory.FuncionRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new Function { Id = 1, Nombre = "Elaborar informes", Descripcion = "Redactar informes" });
        _factory.FuncionRepo.EstaEnActividadesAsync(1).Returns(false);
        _factory.FuncionRepo.EliminarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/funciones/Elaborar%20informes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EliminarFuncion_Returns404CuandoEliminarFalla()
    {
        _factory.FuncionRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new Function { Id = 1, Nombre = "Elaborar informes", Descripcion = "Redactar informes" });
        _factory.FuncionRepo.EstaEnActividadesAsync(1).Returns(false);
        _factory.FuncionRepo.EliminarAsync(1).Returns(false);

        var response = await _client.DeleteAsync("/funciones/Elaborar%20informes");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
