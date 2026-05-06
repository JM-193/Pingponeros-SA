// AreaRepositoryIntegrationTests.cs
using Backend.Models;
using Backend.Repositories;
using DotNetEnv;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class AreaRepositoryIntegrationTests : IAsyncLifetime
{
    private readonly string _connectionString;
    private readonly string _testNombre;
    private int _testAreaId;

    public AreaRepositoryIntegrationTests()
    {
        // Carga el .env del proyecto Backend (relativo al directorio de salida de tests)
        var backendEnv = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "../../../../Backend/.env"));
        if (File.Exists(backendEnv)) Env.Load(backendEnv);

        // TnsAdmin solo se puede fijar una vez; si ya fue configurado por otro test, se ignora
        var walletPath = Path.Combine(AppContext.BaseDirectory, "wallet");
        try { OracleConfiguration.TnsAdmin = walletPath; }
        catch (InvalidOperationException) { /* ODP.NET solo permite fijar TnsAdmin una vez por proceso se ignora si ya fue configurado. */ }

        try { OracleConfiguration.WalletLocation = walletPath; }
        catch (InvalidOperationException) { /* Ídem para WalletLocation. */ }

        var config = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        _connectionString = config.GetConnectionString("OracleDB")
            ?? throw new InvalidOperationException("Cadena de conexión 'OracleDB' no configurada.");

        _testNombre = $"_test_{Guid.NewGuid():N}";
    }

    private AreaRepository CreateRepository() => new(new OracleConnection(_connectionString));

    public async Task InitializeAsync()
    {
        var area = new Area { Nombre = _testNombre, Descripcion = "Área de prueba de integración", Estado = 1 };
        _testAreaId = await CreateRepository().InsertarAsync(area);
    }

    public async Task DisposeAsync()
    {
        if (_testAreaId > 0)
            await CreateRepository().DesactivarAsync(_testAreaId);
    }

    [Fact]
    public async Task ObtenerTodasAsync_RetornaLista()
    {
        var areas = await CreateRepository().ObtenerTodasAsync();

        Assert.NotNull(areas);
        Assert.Contains(areas, a => a.Id == _testAreaId);
    }

    [Fact]
    public async Task ExisteNombreAsync_RetornaTrue_CuandoExiste()
    {
        var existe = await CreateRepository().ExisteNombreAsync(_testNombre);

        Assert.True(existe);
    }

    [Fact]
    public async Task ExisteNombreAsync_RetornaFalse_CuandoNoExiste()
    {
        var existe = await CreateRepository().ExisteNombreAsync("__area_inexistente_test__");

        Assert.False(existe);
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_RetornaArea_CuandoExiste()
    {
        var area = await CreateRepository().ObtenerPorNombreAsync(_testNombre);

        Assert.NotNull(area);
        Assert.Equal(_testAreaId, area.Id);
        Assert.Equal(_testNombre.ToUpperInvariant(), area.Nombre.ToUpperInvariant());
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_RetornaNull_CuandoNoExiste()
    {
        var area = await CreateRepository().ObtenerPorNombreAsync("__area_inexistente_test__");

        Assert.Null(area);
    }

    [Fact]
    public async Task InsertarAsync_RetornaIdPositivo()
    {
        var nombre = $"_test_ins_{Guid.NewGuid():N}";
        var id = await CreateRepository().InsertarAsync(
            new Area { Nombre = nombre, Descripcion = "Inserción de prueba", Estado = 1 });

        Assert.True(id > 0);

        await CreateRepository().DesactivarAsync(id);
    }

    [Fact]
    public async Task ActualizarAsync_RetornaTrue_CuandoExiste()
    {
        var areaActualizada = new Area { Nombre = _testNombre, Descripcion = "Descripción actualizada", Estado = 1 };

        var actualizado = await CreateRepository().ActualizarAsync(_testNombre, areaActualizada);

        Assert.True(actualizado);
    }

    [Fact]
    public async Task ActualizarAsync_RetornaFalse_CuandoNoExiste()
    {
        var area = new Area { Nombre = "__no_existe_test__", Descripcion = "No existe", Estado = 1 };

        var actualizado = await CreateRepository().ActualizarAsync("__no_existe_test__", area);

        Assert.False(actualizado);
    }

    [Fact]
    public async Task DesactivarAsync_RetornaTrue_CuandoExiste()
    {
        var resultado = await CreateRepository().DesactivarAsync(_testAreaId);

        Assert.True(resultado);
        // DisposeAsync intentará desactivar de nuevo (retornará false), lo cual es aceptable
    }

    [Fact]
    public async Task DesactivarAsync_RetornaFalse_CuandoNoExiste()
    {
        var resultado = await CreateRepository().DesactivarAsync(-999);

        Assert.False(resultado);
    }
}
