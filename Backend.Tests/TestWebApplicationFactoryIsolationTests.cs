using Backend.Repositories;
using Backend.Services;
using Microsoft.Extensions.DependencyInjection;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class TestWebApplicationFactoryIsolationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public TestWebApplicationFactoryIsolationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void ConfigureWebHost_ReemplazaServiciosConEfectosSecundariosPorSustitutos()
    {
        using var _ = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        Assert.Empty(services.GetServices<OracleConnection>());
        Assert.Same(_factory.DbExecutor, services.GetRequiredService<IDbExecutor>());
        Assert.Same(_factory.QueryExecutor, services.GetRequiredService<IQueryExecutor>());
        Assert.Same(_factory.UsuarioRepo, services.GetRequiredService<IUserRepository>());
        Assert.Same(_factory.AreaRepo, services.GetRequiredService<IAreaRepository>());
        Assert.Same(_factory.DepartamentoRepo, services.GetRequiredService<IDepartmentRepository>());
        Assert.Same(_factory.SeccionRepo, services.GetRequiredService<ISectionRepository>());
        Assert.Same(_factory.UnidadRepo, services.GetRequiredService<IUnitRepository>());
        Assert.Same(_factory.PlazaRepo, services.GetRequiredService<IPositionRepository>());
        Assert.Same(_factory.EmailService, services.GetRequiredService<IEmailService>());
    }
}
