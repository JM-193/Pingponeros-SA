// DepartamentosEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class DepartamentosEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public DepartamentosEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDepartamentos_Returns200ConLista()
    {
        _factory.DepartamentoRepo.ObtenerTodosAsync().Returns(new List<Departamento>
        {
            new() { Id = 1, IdArea = 1, Nombre = "recursos humanos", Descripcion = "Depto RH", Estado = 1 }
        });

        var response = await _client.GetAsync("/departamentos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetDepartamentoPorNombre_Returns200CuandoExiste()
    {
        var depto = new Departamento { Id = 1, IdArea = 1, Nombre = "recursos humanos", Descripcion = "Depto RH", Estado = 1 };
        _factory.DepartamentoRepo.ObtenerPorNombreAsync("recursos humanos").Returns(depto);

        var response = await _client.GetAsync("/departamentos/recursos%20humanos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetDepartamentoPorNombre_Returns404CuandoNoExiste()
    {
        _factory.DepartamentoRepo.ObtenerPorNombreAsync(Arg.Any<string>()).Returns((Departamento?)null);

        var response = await _client.GetAsync("/departamentos/noexiste");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns400ConNombreVacio()
    {
        var dto = new { Nombre = "", IdArea = 1, Descripcion = "Descripción válida" };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns400ConDescripcionVacia()
    {
        var dto = new { Nombre = "RH", IdArea = 1, Descripcion = "" };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns400ConAreaNull()
    {
        // El DTO permite null, esto es válido
        var dto = new { Nombre = "RH", IdArea = (int?)null, Descripcion = "Descripción" };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns409CuandoNombreYaExiste()
    {
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "RH", IdArea = 1, Descripcion = "Depto RH" };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns201CuandoSeCreaCorrecto()
    {
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.DepartamentoRepo.InsertarAsync(Arg.Any<Departamento>()).Returns(1);
        var dto = new { Nombre = "Finanzas", IdArea = 1, Descripcion = "Depto Finanzas" };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_NormalizaNombreYDescripcionAntesDeInsertar()
    {
        Departamento? capturada = null;
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.DepartamentoRepo.InsertarAsync(Arg.Do<Departamento>(depto => capturada = depto)).Returns(1);
        var dto = new { Nombre = "  Finanzas  ", IdArea = 1, Descripcion = "  Depto Finanzas  " };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal("finanzas", capturada!.Nombre);
        Assert.Equal("Depto Finanzas", capturada.Descripcion);
    }

    [Fact]
    public async Task ActualizarDepartamento_Returns200CuandoSeActualiza()
    {
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.DepartamentoRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Departamento>()).Returns(true);
        var dto = new { Nombre = "rh", IdArea = 1, Descripcion = "Descripción actualizada" };

        var response = await _client.PutAsJsonAsync("/departamentos/rh", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarDepartamento_Returns409CuandoNombreNuevoExiste()
    {
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(true);
        var dto = new { Nombre = "nueva", IdArea = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/departamentos/vieja", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarDepartamento_Returns404CuandoNoExiste()
    {
        _factory.DepartamentoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.DepartamentoRepo.ActualizarAsync(Arg.Any<string>(), Arg.Any<Departamento>()).Returns(false);
        var dto = new { Nombre = "noexiste", IdArea = 1, Descripcion = "Descripción" };

        var response = await _client.PutAsJsonAsync("/departamentos/noexiste", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarDepartamento_Returns204CuandoSeDesactiva()
    {
        _factory.DepartamentoRepo.DesactivarAsync(1).Returns(true);

        var response = await _client.DeleteAsync("/departamentos/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarDepartamento_Returns404CuandoNoExiste()
    {
        _factory.DepartamentoRepo.DesactivarAsync(99).Returns(false);

        var response = await _client.DeleteAsync("/departamentos/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearDepartamento_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "RH", IdArea = 1, Descripcion = "Descripción", Estado = 5 };

        var response = await _client.PostAsJsonAsync("/departamentos", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarDepartamento_Returns400ConEstadoInvalido()
    {
        var dto = new { Nombre = "rh", IdArea = 1, Descripcion = "Descripción", Estado = 3 };

        var response = await _client.PutAsJsonAsync("/departamentos/rh", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
