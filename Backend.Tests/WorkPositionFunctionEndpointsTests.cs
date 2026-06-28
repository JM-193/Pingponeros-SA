// WorkPositionFunctionEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class WorkPositionFunctionEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public WorkPositionFunctionEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ── GET /puestos-trabajo/{id}/funciones ──────────────────────────────────

    [Fact]
    public async Task GetFuncionesDePuesto_Returns200ConLista()
    {
        _factory.FuncionPuestoRepo.ObtenerFuncionesDePuestoAsync(1).Returns(new List<Function>
        {
            new() { Id = 1, Nombre = "Elaborar informes", Descripcion = "Redactar informes" },
            new() { Id = 2, Nombre = "Atención al cliente", Descripcion = "Brindar atención al público" },
        });

        var response = await _client.GetAsync("/puestos-trabajo/1/funciones");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFuncionesDePuesto_Returns200ConListaVacia()
    {
        _factory.FuncionPuestoRepo.ObtenerFuncionesDePuestoAsync(2).Returns(new List<Function>());

        var response = await _client.GetAsync("/puestos-trabajo/2/funciones");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── POST /puestos-trabajo/{id}/funciones ─────────────────────────────────

    [Fact]
    public async Task AgregarFuncion_Returns400CuandoIdFuncionEsCero()
    {
        var dto = new { IdFuncion = 0 };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo/1/funciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AgregarFuncion_Returns400CuandoIdFuncionEsNegativo()
    {
        var dto = new { IdFuncion = -5 };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo/1/funciones", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AgregarFuncion_Returns409CuandoYaEstaAsociada()
    {
        _factory.FuncionPuestoRepo.EstaAsociadaAsync(1, 3).Returns(true);
        var dto = new { IdFuncion = 3 };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo/1/funciones", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task AgregarFuncion_Returns201CuandoSeAgregaCorrectamente()
    {
        _factory.FuncionPuestoRepo.EstaAsociadaAsync(1, 4).Returns(false);
        var dto = new { IdFuncion = 4 };

        var response = await _client.PostAsJsonAsync("/puestos-trabajo/1/funciones", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task AgregarFuncion_LlamaAgregarAsyncCuandoNoExisteAsociacion()
    {
        _factory.FuncionPuestoRepo.EstaAsociadaAsync(Arg.Any<int>(), Arg.Any<int>()).Returns(false);
        var dto = new { IdFuncion = 5 };

        await _client.PostAsJsonAsync("/puestos-trabajo/1/funciones", dto);

        await _factory.FuncionPuestoRepo.Received(1).AgregarAsync(1, 5);
    }

    // ── DELETE /puestos-trabajo/{id}/funciones/{idFuncion} ───────────────────

    [Fact]
    public async Task QuitarFuncion_Returns200CuandoSeQuita()
    {
        _factory.FuncionPuestoRepo.QuitarAsync(1, 2).Returns(true);

        var response = await _client.DeleteAsync("/puestos-trabajo/1/funciones/2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task QuitarFuncion_Returns404CuandoNoEstaAsociada()
    {
        _factory.FuncionPuestoRepo.QuitarAsync(1, 99).Returns(false);

        var response = await _client.DeleteAsync("/puestos-trabajo/1/funciones/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
