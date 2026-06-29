// TestWebApplicationFactory.cs
using Backend.Repositories;
using Backend.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Tests;

public sealed class TestWebApplicationFactory : WebApplicationFactory<TestEntryPoint>
{
    internal IUserRepository UsuarioRepo { get; } = Substitute.For<IUserRepository>();
    internal IAreaRepository AreaRepo { get; } = Substitute.For<IAreaRepository>();
    internal IDepartmentRepository DepartamentoRepo { get; } = Substitute.For<IDepartmentRepository>();
    internal ISectionRepository SeccionRepo { get; } = Substitute.For<ISectionRepository>();
    internal IUnitRepository UnidadRepo { get; } = Substitute.For<IUnitRepository>();
    internal IPositionRepository PlazaRepo { get; } = Substitute.For<IPositionRepository>();
    internal IPositionAssignmentRepository AsignacionRepo { get; } = Substitute.For<IPositionAssignmentRepository>();
    internal IWorkPositionRepository PuestoRepo { get; } = Substitute.For<IWorkPositionRepository>();
    internal IWorkPositionFunctionRepository FuncionPuestoRepo { get; } = Substitute.For<IWorkPositionFunctionRepository>();
    internal IFunctionRepository FuncionRepo { get; } = Substitute.For<IFunctionRepository>();
    internal IUserFunctionRepository FuncionUsuarioRepo { get; } = Substitute.For<IUserFunctionRepository>();
    internal IDeclaracionRepository DeclaracionRepo { get; } = Substitute.For<IDeclaracionRepository>();
    internal IDbExecutor DbExecutor { get; } = Substitute.For<IDbExecutor>();
    internal IQueryExecutor QueryExecutor { get; } = Substitute.For<IQueryExecutor>();
    internal IEmailService EmailService { get; } = Substitute.For<IEmailService>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-secret-key-for-unit-tests-at-least-32-chars",
                ["Jwt:Issuer"] = "PingponerosApi",
                ["Jwt:Audience"] = "PingponerosApp",
                ["Jwt:MinutosExpiracion"] = "60",
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<OracleConnection>();
            services.RemoveAll<IDbExecutor>();
            services.RemoveAll<IQueryExecutor>();
            services.RemoveAll<IUserRepository>();
            services.RemoveAll<IAreaRepository>();
            services.RemoveAll<IDepartmentRepository>();
            services.RemoveAll<ISectionRepository>();
            services.RemoveAll<IUnitRepository>();
            services.RemoveAll<IPositionRepository>();
            services.RemoveAll<IPositionAssignmentRepository>();
            services.RemoveAll<IWorkPositionRepository>();
            services.RemoveAll<IWorkPositionFunctionRepository>();
            services.RemoveAll<IFunctionRepository>();
            services.RemoveAll<IUserFunctionRepository>();
            services.RemoveAll<IDeclaracionRepository>();
            services.RemoveAll<IEmailService>();
            services.AddScoped<IDbExecutor>(_ => DbExecutor);
            services.AddScoped<IQueryExecutor>(_ => QueryExecutor);
            services.AddScoped<IUserRepository>(_ => UsuarioRepo);
            services.AddScoped<IAreaRepository>(_ => AreaRepo);
            services.AddScoped<IDepartmentRepository>(_ => DepartamentoRepo);
            services.AddScoped<ISectionRepository>(_ => SeccionRepo);
            services.AddScoped<IUnitRepository>(_ => UnidadRepo);
            services.AddScoped<IPositionRepository>(_ => PlazaRepo);
            services.AddScoped<IPositionAssignmentRepository>(_ => AsignacionRepo);
            services.AddScoped<IWorkPositionRepository>(_ => PuestoRepo);
            services.AddScoped<IWorkPositionFunctionRepository>(_ => FuncionPuestoRepo);
            services.AddScoped<IFunctionRepository>(_ => FuncionRepo);
            services.AddScoped<IUserFunctionRepository>(_ => FuncionUsuarioRepo);
            services.AddScoped<IDeclaracionRepository>(_ => DeclaracionRepo);
            services.AddScoped<IEmailService>(_ => EmailService);
        });
    }
}
