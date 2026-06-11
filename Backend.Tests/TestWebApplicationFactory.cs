// TestWebApplicationFactory.cs
using Backend.Repositories;
using Backend.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
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
    internal IDbExecutor DbExecutor { get; } = Substitute.For<IDbExecutor>();
    internal IQueryExecutor QueryExecutor { get; } = Substitute.For<IQueryExecutor>();
    internal IEmailService EmailService { get; } = Substitute.For<IEmailService>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
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
            services.RemoveAll<IEmailService>();
            services.AddScoped<IDbExecutor>(_ => DbExecutor);
            services.AddScoped<IQueryExecutor>(_ => QueryExecutor);
            services.AddScoped<IUserRepository>(_ => UsuarioRepo);
            services.AddScoped<IAreaRepository>(_ => AreaRepo);
            services.AddScoped<IDepartmentRepository>(_ => DepartamentoRepo);
            services.AddScoped<ISectionRepository>(_ => SeccionRepo);
            services.AddScoped<IUnitRepository>(_ => UnidadRepo);
            services.AddScoped<IPositionRepository>(_ => PlazaRepo);
            services.AddScoped<IEmailService>(_ => EmailService);
        });
    }
}
