// AreasEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class AreasEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AreasEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAreas_Returns200ConLista()
    {
        _factory.AreaRepo.ObtenerTodasAsync().Returns(new List<Area>
        {
            new() { Id = 1, Nombre = "sistemas", Descripcion = "Área de sistemas", Estado = 1 }
        });

        var response = await _client.GetAsync("/areas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAreaPorNombre_Returns200CuandoExiste()
    {
        var area = new Area { Id = 1, Nombre = "sistemas", Descripcion = "Área de sistemas", Estado = 1 };
        _factory.AreaRepo.ObtenerPorNombreAsync("sistemas").Returns(area);

        var response = await _client.GetAsync("/areas/sistemas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAreaPorNombre_Returns404CuandoNoExiste()
    {
        _factory.AreaRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((Area?)null);

        var response = await _client.GetAsync("/areas/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearArea_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/areas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearArea_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "Sistemas", Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/areas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearArea_Returns409CuandoNombreYaExiste()
    {
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "Sistemas", Descripcion = "Área de sistemas" };

        var response = await _client.PostAsJsonAsync("/areas", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearArea_Returns201CuandoSeCreaCorrecto()
    {
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.AreaRepo.InsertarAsync(Arg.Any<Area>()).Returns(1);
        var dto = new { Nombre = "Contabilidad", Descripcion = "Área de contabilidad" };

        var response = await _client.PostAsJsonAsync("/areas", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearArea_NormalizaNombreYDescripcionAntesDeInsertar()
    {
        Area? capturada = null;
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.AreaRepo.InsertarAsync(Arg.Do<Area>(area => capturada = area)).Returns(1);
        var dto = new { Nombre = "  Sistemas  ", Descripcion = "  Area de sistemas  " };

        var response = await _client.PostAsJsonAsync("/areas", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("sistemas", capturada!.Nombre);
        Assert.Equal("Area de sistemas", capturada.Descripcion);
    }

    [Fact]
    public async Task ActualizarArea_Returns200CuandoSeActualiza()
    {
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.AreaRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Area>()).Returns(true);
        var dto = new { Nombre = "sistemas", Descripcion = "Descripción actualizada" };

        var response = await _client.PutAsJsonAsync("/areas/sistemas", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarArea_Returns409CuandoNombreNuevoExiste()
    {
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "nueva", Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/areas/vieja", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarArea_Returns404CuandoNoExiste()
    {
        _factory.AreaRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.AreaRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Area>()).Returns(false);
        var dto = new { Nombre = "noexiste", Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/areas/noexiste", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarArea_Returns204CuandoSeDesactiva()
    {
        _factory.AreaRepo.DesactivarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/areas/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarArea_Returns404CuandoNoExiste()
    {
        _factory.AreaRepo.DesactivarAsync(99).Returns(false);

        var response = await _client.DeleteAsync("/areas/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
