// OccupationalClassEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class OccupationalClassEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public OccupationalClassEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ── GET /clases-ocupacionales ───────────────────────────────────────────

    [Fact]
    public async Task GetClases_Returns200ConLista()
    {
        _factory.ClasesRepo.ObtenerTodasAsync().Returns(new List<OccupationalClass>
        {
            new() { IdClaseOcupacional = 1, Codigo = 100, Nombre = "Profesional 1" },
        });

        var response = await _client.GetAsync("/clases-ocupacionales");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetClases_Returns200ConListaVacia()
    {
        _factory.ClasesRepo.ObtenerTodasAsync().Returns(new List<OccupationalClass>());

        var response = await _client.GetAsync("/clases-ocupacionales");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── POST /clases-ocupacionales ──────────────────────────────────────────

    [Fact]
    public async Task CrearClase_Returns400ConNombreVacio()
    {
        var dto = new { Codigo = 100, Nombre = "" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns400CuandoCodigoEsNulo()
    {
        var dto = new { Nombre = "Profesional 1" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns400CuandoCodigoNoEsPositivo()
    {
        var dto = new { Codigo = 0, Nombre = "Profesional 1" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns400ConNombreMayorA100Caracteres()
    {
        var dto = new { Codigo = 100, Nombre = new string('A', 101) };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns409CuandoNombreYaExiste()
    {
        _factory.ClasesRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Codigo = 100, Nombre = "Profesional 1" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns409CuandoCodigoYaExiste()
    {
        _factory.ClasesRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.ClasesRepo.ExisteCodigoAsync(Arg.Any<int>()).Returns(true);
        var dto = new { Codigo = 100, Nombre = "Profesional Unico" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_Returns201CuandoSeCreaCorrecto()
    {
        _factory.ClasesRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.ClasesRepo.ExisteCodigoAsync(Arg.Any<int>()).Returns(false);
        _factory.ClasesRepo.InsertarAsync(Arg.Any<OccupationalClass>()).Returns(5L);
        var dto = new { Codigo = 200, Nombre = "Tecnico" };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearClase_NormalizaNombreAntesDeInsertar()
    {
        OccupationalClass? capturada = null;
        _factory.ClasesRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.ClasesRepo.ExisteCodigoAsync(Arg.Any<int>()).Returns(false);
        _factory.ClasesRepo.InsertarAsync(Arg.Do<OccupationalClass>(c => capturada = c)).Returns(5L);
        var dto = new { Codigo = 300, Nombre = "  Servicio General  " };

        var response = await _client.PostAsJsonAsync("/clases-ocupacionales", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("Servicio General", capturada!.Nombre);
        Assert.Equal(300, capturada.Codigo);
    }

    // ── DELETE /clases-ocupacionales/{id} ───────────────────────────────────

    [Fact]
    public async Task EliminarClase_Returns404CuandoNoExiste()
    {
        _factory.ClasesRepo.ObtenerPorIdAsync(Arg.Any<long>()).Returns((OccupationalClass?)null);

        var response = await _client.DeleteAsync("/clases-ocupacionales/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarClase_Returns409CuandoEstaAsociada()
    {
        _factory.ClasesRepo.ObtenerPorIdAsync(Arg.Any<long>())
            .Returns(new OccupationalClass { IdClaseOcupacional = 1, Codigo = 100, Nombre = "Profesional 1" });
        _factory.ClasesRepo.EstaAsociadoAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/clases-ocupacionales/1");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EliminarClase_Returns200CuandoSeElimina()
    {
        _factory.ClasesRepo.ObtenerPorIdAsync(Arg.Any<long>())
            .Returns(new OccupationalClass { IdClaseOcupacional = 2, Codigo = 100, Nombre = "Profesional 1" });
        _factory.ClasesRepo.EstaAsociadoAsync(2).Returns(false);
        _factory.ClasesRepo.EliminarAsync(2).Returns(true);

        var response = await _client.DeleteAsync("/clases-ocupacionales/2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EliminarClase_Returns404CuandoEliminarFalla()
    {
        _factory.ClasesRepo.ObtenerPorIdAsync(Arg.Any<long>())
            .Returns(new OccupationalClass { IdClaseOcupacional = 3, Codigo = 100, Nombre = "Profesional 1" });
        _factory.ClasesRepo.EstaAsociadoAsync(3).Returns(false);
        _factory.ClasesRepo.EliminarAsync(3).Returns(false);

        var response = await _client.DeleteAsync("/clases-ocupacionales/3");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
