// UnidadesEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class UnidadesEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public UnidadesEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUnidades_Returns200ConLista()
    {
        _factory.UnidadRepo.ObtenerTodasAsync().Returns(new List<Unit>
        {
            new() { Id = 1, IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Nombre = "infraestructura", Descripcion = "Unidad Infraestructura", Estado = 1 }
        });

        var response = await _client.GetAsync("/unidades");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUnidadPorNombre_Returns200CuandoExiste()
    {
        var unidad = new Unit { Id = 1, IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Nombre = "infraestructura", Descripcion = "Unidad Infraestructura", Estado = 1 };
        _factory.UnidadRepo.ObtenerPorNombreAsync("infraestructura").Returns(unidad);

        var response = await _client.GetAsync("/unidades/infraestructura");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUnidadPorNombre_Returns404CuandoNoExiste()
    {
        _factory.UnidadRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((Unit?)null);

        var response = await _client.GetAsync("/unidades/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "Infraestructura", IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConAreaNull()
    {
        // El DTO permite null, esto es válido
        var dto = new { Nombre = "Infraestructura", IdArea = (int?)null, IdDepartamento = 1, IdSeccion = (int?)null, Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConDepartamentoNull()
    {
        // El DTO permite null, esto es válido
        var dto = new { Nombre = "Infraestructura", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = (int?)null, Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConSeccionNull()
    {
        // El DTO permite null, esto es válido
        var dto = new { Nombre = "Infraestructura", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = (int?)null, Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns409CuandoNombreYaExiste()
    {
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "Infraestructura", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "Unidad Infraestructura" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns201CuandoSeCreaCorrecto()
    {
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.UnidadRepo.InsertarAsync(Arg.Any<Unit>()).Returns(1);
        var dto = new { Nombre = "Redes", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "Unidad Redes" };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_NormalizaNombreYDescripcionAntesDeInsertar()
    {
        Unit? capturada = null;
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.UnidadRepo.InsertarAsync(Arg.Do<Unit>(unidad => capturada = unidad)).Returns(1);
        var dto = new { Nombre = "  Redes  ", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "  Unidad Redes  " };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("Redes", capturada!.Nombre);
        Assert.Equal("Unidad Redes", capturada.Descripcion);
    }

    [Fact]
    public async Task ActualizarUnidad_Returns200CuandoSeActualiza()
    {
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.UnidadRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Unit>()).Returns(true);
        var dto = new { Nombre = "infraestructura", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "Descripción actualizada" };

        var response = await _client.PutAsJsonAsync("/unidades/infraestructura", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUnidad_Returns409CuandoNombreNuevoExiste()
    {
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "nueva", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/unidades/vieja", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUnidad_Returns404CuandoNoExiste()
    {
        _factory.UnidadRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.UnidadRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Unit>()).Returns(false);
        var dto = new { Nombre = "noexiste", IdArea = 1, IdDepartamento = (int?)null, IdSeccion = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/unidades/noexiste", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUnidad_Returns204CuandoSeDesactiva()
    {
        _factory.UnidadRepo.DesactivarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/unidades/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUnidad_Returns404CuandoNoExiste()
    {
        _factory.UnidadRepo.DesactivarAsync(99).Returns(false);

        var response = await _client.DeleteAsync("/unidades/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearUnidad_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "Infraestructura", IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Descripcion = "Descripción", Estado = 5 };

        var response = await _client.PostAsJsonAsync("/unidades", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUnidad_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "infraestructura", IdArea = 1, IdDepartamento = 1, IdSeccion = 1, Descripcion = "Descripción", Estado = 3 };

        var response = await _client.PutAsJsonAsync("/unidades/infraestructura", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
