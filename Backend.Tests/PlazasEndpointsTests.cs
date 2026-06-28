using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class PlazasEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public PlazasEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPlazas_Returns200ConLista()
    {
        _factory.PlazaRepo.ObtenerTodasAsync().Returns(new List<Position>
        {
            new() { NumeroPlaza = 1001, IdUnidad = 1, IdDepartamento = 2, IdSeccion = 3, IdArea = 4 }
        });

        var response = await _client.GetAsync("/plazas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPlazasDisponibles_Returns200ConLista()
    {
        _factory.AsignacionRepo.ObtenerPlazasDisponiblesAsync().Returns(new List<Position>
        {
            new() { NumeroPlaza = 2001, IdUnidad = 1 }
        });

        var response = await _client.GetAsync("/plazas/disponibles");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPlazaPorNumero_Returns200CuandoExiste()
    {
        _factory.PlazaRepo.ObtenerPorNumeroAsync(1001).Returns(new Position { NumeroPlaza = 1001, IdUnidad = 1 });

        var response = await _client.GetAsync("/plazas/1001");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPlazaPorNumero_Returns404CuandoNoExiste()
    {
        _factory.PlazaRepo.ObtenerPorNumeroAsync(9999).Returns((Position?)null);

        var response = await _client.GetAsync("/plazas/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearPlaza_Returns400ConNumeroInvalido()
    {
        var dto = new { NumeroPlaza = 0, IdUnidad = 1, IdDepartamento = (int?)null, IdSeccion = (int?)null, IdArea = 4 };

        var response = await _client.PostAsJsonAsync("/plazas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearPlaza_Returns409CuandoNumeroYaExiste()
    {
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(1001).Returns(true);
        var dto = new { NumeroPlaza = 1001, IdUnidad = 1, IdDepartamento = (int?)null, IdSeccion = (int?)null, IdArea = 4 };

        var response = await _client.PostAsJsonAsync("/plazas", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearPlaza_Returns201CuandoSeCreaCorrecto()
    {
        Position? capturada = null;
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(1002).Returns(false);
        _factory.PlazaRepo.InsertarAsync(Arg.Do<Position>(plaza => capturada = plaza)).Returns(Task.CompletedTask);
        var dto = new { NumeroPlaza = 1002, IdUnidad = 1, IdDepartamento = 2, IdSeccion = (int?)null, IdArea = 4 };

        var response = await _client.PostAsJsonAsync("/plazas", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal(1002UL, capturada!.NumeroPlaza);
        Assert.Equal(1, capturada.IdUnidad);
        Assert.Equal(2, capturada.IdDepartamento);
        Assert.Null(capturada.IdSeccion);
        Assert.Equal(4, capturada.IdArea);
    }

    [Fact]
    public async Task ActualizarPlaza_Returns404CuandoNoExiste()
    {
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(9999).Returns(false);
        var dto = new { NumeroPlaza = 9999, IdUnidad = 1, IdDepartamento = (int?)null, IdSeccion = (int?)null, IdArea = 4 };

        var response = await _client.PutAsJsonAsync("/plazas/9999", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarPlaza_Returns200CuandoSeActualiza()
    {
        Position? capturada = null;
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(1001).Returns(true);
        _factory.PlazaRepo.ActualizarAsync(1001, Arg.Do<Position>(plaza => capturada = plaza)).Returns(true);
        var dto = new { NumeroPlaza = 5000, IdUnidad = 1, IdDepartamento = (int?)null, IdSeccion = 3, IdArea = 4 };

        var response = await _client.PutAsJsonAsync("/plazas/1001", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal(1001UL, capturada!.NumeroPlaza);
        Assert.Equal(1, capturada.IdUnidad);
        Assert.Null(capturada.IdDepartamento);
        Assert.Equal(3, capturada.IdSeccion);
        Assert.Equal(4, capturada.IdArea);
    }
}
