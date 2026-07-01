// OracleErrorMapperTests.cs
using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using System.Text.Json;
using Backend.Helpers;
using Backend.Models;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

// ── Tests para métodos puros (no requieren OracleException) ────────────────

public sealed class OracleErrorMapperStaticTests
{
    [Theory]
    [InlineData(1,     409)]
    [InlineData(2291,  409)]
    [InlineData(2292,  409)]
    [InlineData(1400,  400)]
    [InlineData(1407,  400)]
    [InlineData(1438,  400)]
    [InlineData(12541, 503)]
    [InlineData(12170, 503)]
    [InlineData(9999,  500)]
    public void MapToStatus_RetornaCodigoHttpCorrecto(int numero, int esperado)
    {
        Assert.Equal(esperado, OracleErrorMapper.MapToStatus(numero));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2289)]
    [InlineData(2291)]
    [InlineData(2292)]
    [InlineData(1400)]
    [InlineData(1407)]
    [InlineData(1438)]
    [InlineData(12541)]
    [InlineData(12170)]
    [InlineData(1017)]
    [InlineData(9999)]
    public void Traducir_NuncaRetornaCadenaVacia(int numero)
    {
        Assert.False(string.IsNullOrWhiteSpace(OracleErrorMapper.Traducir(numero)));
    }

    [Fact]
    public void Traducir_RetornaMensajeEspecifico_ParaUniqueConstraint()
    {
        Assert.Equal("El registro ya existe en el sistema.", OracleErrorMapper.Traducir(1));
    }

    [Fact]
    public void Traducir_RetornaMensajeEspecifico_ParaConexionFallida()
    {
        Assert.Equal("No se pudo conectar a la base de datos. Intente más tarde.", OracleErrorMapper.Traducir(12541));
    }

    [Fact]
    public void Traducir_RetornaMensajeGenerico_ParaCodigoDesconocido()
    {
        Assert.Equal("No se pudo completar la operación. Intente nuevamente.", OracleErrorMapper.Traducir(9999));
    }
}

// ── Tests de ToResult vía integración HTTP ──────────────────────────────────

public sealed class OracleErrorMapperEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public OracleErrorMapperEndpointTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // Crea OracleException usando el constructor interno de ODP.NET
    private static OracleException CreateOracleException(int errCode, string message)
    {
        var ctor = typeof(OracleException).GetConstructor(
            BindingFlags.NonPublic | BindingFlags.Instance, null,
            [typeof(int), typeof(string), typeof(string), typeof(string), typeof(int)], null)!;
        return (OracleException)ctor.Invoke([errCode, "", "", message, 0]);
    }

    // ── RAISE_APPLICATION_ERROR con prefijo "ORA-20001: <msg>" ────────────

    [Fact]
    public async Task ToResult_Retorna409ConMensajeExtraido_CuandoRaiseApplicationErrorConPrefijo()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Any<WorkPosition>())
            .Throws(CreateOracleException(20001, "ORA-20001: El puesto está asociado a una plaza."));

        var response = await _client.PostAsJsonAsync("/puestos-trabajo",
            new { Nombre = "Chofer", Descripcion = "Conductor" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("El puesto está asociado a una plaza.", body.GetProperty("mensaje").GetString());
    }

    // ── RAISE_APPLICATION_ERROR sin prefijo (mensaje plano) ───────────────

    [Fact]
    public async Task ToResult_Retorna409ConMensajePlano_CuandoRaiseApplicationErrorSinPrefijo()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Any<WorkPosition>())
            .Throws(CreateOracleException(20500, "Mensaje sin prefijo de Oracle"));

        var response = await _client.PostAsJsonAsync("/puestos-trabajo",
            new { Nombre = "Digitador", Descripcion = "Digitación" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Mensaje sin prefijo de Oracle", body.GetProperty("mensaje").GetString());
    }

    // ── Error Oracle conocido (ORA-1 unique constraint) → 409 traducido ───

    [Fact]
    public async Task ToResult_Retorna409ConMensajeTraducido_CuandoORA1()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Any<WorkPosition>())
            .Throws(CreateOracleException(1, "unique constraint violated"));

        var response = await _client.PostAsJsonAsync("/puestos-trabajo",
            new { Nombre = "Asistente", Descripcion = "Administrativo" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(OracleErrorMapper.Traducir(1), body.GetProperty("mensaje").GetString());
    }

    // ── Error de conexión (ORA-12541) → 503 ───────────────────────────────

    [Fact]
    public async Task ToResult_Retorna503_CuandoORA12541ConexionFallida()
    {
        _factory.PuestoRepo.ExisteNombreAsync(Arg.Any<string>()).Returns(false);
        _factory.PuestoRepo.InsertarAsync(Arg.Any<WorkPosition>())
            .Throws(CreateOracleException(12541, "TNS: no listener"));

        var response = await _client.PostAsJsonAsync("/puestos-trabajo",
            new { Nombre = "Técnico", Descripcion = "Soporte técnico" });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(OracleErrorMapper.Traducir(12541), body.GetProperty("mensaje").GetString());
    }

    // ── Error desconocido → 500 ────────────────────────────────────────────

    [Fact]
    public async Task ToResult_Retorna500_CuandoErrorOracleDesconocido()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new WorkPosition { Id = 5, Nombre = "conductor", Descripcion = "Desc" });
        _factory.PuestoRepo.EstaAsociadoAsync(5).Returns(false);
        _factory.PuestoRepo.EliminarAsync(5)
            .Throws(CreateOracleException(4031, "unable to allocate memory"));

        var response = await _client.DeleteAsync("/puestos-trabajo/conductor");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(OracleErrorMapper.Traducir(4031), body.GetProperty("mensaje").GetString());
    }

    // ── Error de integridad referencial (ORA-2292) en eliminación → 409 ───

    [Fact]
    public async Task ToResult_Retorna409_CuandoORA2292IntegridadReferencial()
    {
        _factory.PuestoRepo.ObtenerPorNombreAsync(Arg.Any<string>())
            .Returns(new WorkPosition { Id = 6, Nombre = "auditor", Descripcion = "Desc" });
        _factory.PuestoRepo.EstaAsociadoAsync(6).Returns(false);
        _factory.PuestoRepo.EliminarAsync(6)
            .Throws(CreateOracleException(2292, "integrity constraint violated - child record found"));

        var response = await _client.DeleteAsync("/puestos-trabajo/auditor");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(OracleErrorMapper.Traducir(2292), body.GetProperty("mensaje").GetString());
    }
}
