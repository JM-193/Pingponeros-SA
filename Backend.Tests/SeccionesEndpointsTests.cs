// SeccionesEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class SeccionesEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public SeccionesEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSecciones_Returns200ConLista()
    {
        _factory.SeccionRepo.ObtenerTodasAsync().Returns(new List<Section>
        {
            new() { Id = 1, IdArea = 1, Nombre = "sistemas", Descripcion = "Sección Sistemas", Estado = 1 }
        });

        var response = await _client.GetAsync("/secciones");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetSeccionPorNombre_Returns200CuandoExiste()
    {
        var seccion = new Section { Id = 1, IdArea = 1, Nombre = "sistemas", Descripcion = "Sección Sistemas", Estado = 1 };
        _factory.SeccionRepo.ObtenerPorNombreAsync("sistemas").Returns(seccion);

        var response = await _client.GetAsync("/secciones/sistemas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetSeccionPorNombre_Returns404CuandoNoExiste()
    {
        _factory.SeccionRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((Section?)null);

        var response = await _client.GetAsync("/secciones/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", IdArea = 1, Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "Sistemas", IdArea = 1, Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns400ConAreaNull()
    {
        // El DTO permite null, esto es válido
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.SeccionRepo.InsertarAsync(Arg.Any<Section>()).Returns(1);
        var dto = new { Nombre = "Sistemas", IdArea = (int?)null, Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns409CuandoNombreYaExiste()
    {
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "Sistemas", IdArea = 1, Descripcion = "Sección Sistemas" };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns201CuandoSeCreaCorrecto()
    {
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.SeccionRepo.InsertarAsync(Arg.Any<Section>()).Returns(1);
        var dto = new { Nombre = "Soporte", IdArea = 1, Descripcion = "Sección Soporte" };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_NormalizaNombreYDescripcionAntesDeInsertar()
    {
        Section? capturada = null;
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.SeccionRepo.InsertarAsync(Arg.Do<Section>(sec => capturada = sec)).Returns(1);
        var dto = new { Nombre = "  Soporte  ", IdArea = 1, Descripcion = "  Sección Soporte  " };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("Soporte", capturada!.Nombre);
        Assert.Equal("Sección Soporte", capturada.Descripcion);
    }

    [Fact]
    public async Task ActualizarSeccion_Returns200CuandoSeActualiza()
    {
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.SeccionRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Section>()).Returns(true);
        var dto = new { Nombre = "sistemas", IdArea = 1, Descripcion = "Descripción actualizada" };

        var response = await _client.PutAsJsonAsync("/secciones/sistemas", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarSeccion_Returns409CuandoNombreNuevoExiste()
    {
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "nueva", IdArea = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/secciones/vieja", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarSeccion_Returns404CuandoNoExiste()
    {
        _factory.SeccionRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.SeccionRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Section>()).Returns(false);
        var dto = new { Nombre = "noexiste", IdArea = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/secciones/noexiste", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarSeccion_Returns204CuandoSeDesactiva()
    {
        _factory.SeccionRepo.DesactivarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/secciones/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarSeccion_Returns404CuandoNoExiste()
    {
        _factory.SeccionRepo.DesactivarAsync(99).Returns(false);

        var response = await _client.DeleteAsync("/secciones/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearSeccion_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "Sistemas", IdArea = 1, Descripcion = "Descripción", Estado = 5 };

        var response = await _client.PostAsJsonAsync("/secciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarSeccion_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "sistemas", IdArea = 1, Descripcion = "Descripción", Estado = 3 };

        var response = await _client.PutAsJsonAsync("/secciones/sistemas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
