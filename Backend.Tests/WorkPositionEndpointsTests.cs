// WorkPositionEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class WorkPositionEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public WorkPositionEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ── GET /puestos-trabajo ────────────────────────────────────────────────

    [Fact]
    public async Task GetPuestos_Returns200ConLista()
    {
        _factory.PuestoRepo.ObtenerTodasAsync().Returns(new List<WorkPosition>
        {
            new() { Id = 1, Nombre = "chofer", Descripcion = "Puesto de chofer" },
        });

        var response = await _client.GetAsync("/puestos-trabajo");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPuestos_Returns200ConListaVacia()
    {
        _factory.PuestoRepo.ObtenerTodasAsync().Returns(new List<WorkPosition>());

        var response = await _client.GetAsync("/puestos-trabajo");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── POST /puestos-trabajo ───────────────────────────────────────────────

    [Fact]
    public async Task CrearPuesto_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearPuesto_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "Chofer", Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearPuesto_Returns400ConNombreMayorA50Caracteres()
    {
        var dto = new { Nombre = new string('A', 51), Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearPuesto_Returns409CuandoNombreYaExiste()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "Chofer", Descripcion = "Puesto de chofer" };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearPuesto_Returns201CuandoSeCreaCorrecto()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Any<WorkPosition>()).Returns(1);
        var dto = new { Nombre = "Digitador", Descripcion = "Puesto de digitador" };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearPuesto_NormalizaNombreAntesDeInsertar()
    {
        WorkPosition? capturado = null;
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Do<WorkPosition>(p => capturado = p)).Returns(1);
        var dto = new { Nombre = "  Digitador  ", Descripcion = "  Puesto de digitador  " };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturado);
        Assert.Equal("Digitador", capturado!.Nombre);
        Assert.Equal("Puesto de digitador", capturado.Descripcion);
    }

    // ── DELETE /puestos-trabajo/{nombre} ────────────────────────────────────

    [Fact]
    public async Task EliminarPuesto_Returns404CuandoNoExiste()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((WorkPosition?)null);

        var response = await _client.DeleteAsync("/puestos-trabajo/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarPuesto_Returns409CuandoEstaAsociado()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new WorkPosition { Id = 1, Nombre = "chofer", Descripcion = "Puesto de chofer" });
        _factory.PuestoRepo.EstaAsociadoAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/puestos-trabajo/chofer");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EliminarPuesto_Returns200CuandoSeElimina()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new WorkPosition { Id = 1, Nombre = "chofer", Descripcion = "Puesto de chofer" });
        _factory.PuestoRepo.EstaAsociadoAsync(1).Returns(false);
        _factory.PuestoRepo.EliminarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/puestos-trabajo/chofer");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EliminarPuesto_Returns404CuandoEliminarFalla()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new WorkPosition { Id = 1, Nombre = "chofer", Descripcion = "Puesto de chofer" });
        _factory.PuestoRepo.EstaAsociadoAsync(1).Returns(false);
        _factory.PuestoRepo.EliminarAsync(1).Returns(false);

        var response = await _client.DeleteAsync("/puestos-trabajo/chofer");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
