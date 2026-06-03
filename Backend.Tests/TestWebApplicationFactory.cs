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
    internal IUsuarioRepository UsuarioRepo { get; } = Substitute.For<IUsuarioRepository>();
    internal IAreaRepository AreaRepo { get; } = Substitute.For<IAreaRepository>();
    internal IDepartamentoRepository DepartamentoRepo { get; } = Substitute.For<IDepartamentoRepository>();
    internal ISeccionRepository SeccionRepo { get; } = Substitute.For<ISeccionRepository>();
    internal IUnidadRepository UnidadRepo { get; } = Substitute.For<IUnidadRepository>();
    internal IPlazaRepository PlazaRepo { get; } = Substitute.For<IPlazaRepository>();
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
            services.RemoveAll<IUsuarioRepository>();
            services.RemoveAll<IAreaRepository>();
            services.RemoveAll<IDepartamentoRepository>();
            services.RemoveAll<ISeccionRepository>();
            services.RemoveAll<IUnidadRepository>();
            services.RemoveAll<IPlazaRepository>();
            services.RemoveAll<IEmailService>();
            services.AddScoped<IDbExecutor>(_ => DbExecutor);
            services.AddScoped<IQueryExecutor>(_ => QueryExecutor);
            services.AddScoped<IUsuarioRepository>(_ => UsuarioRepo);
            services.AddScoped<IAreaRepository>(_ => AreaRepo);
            services.AddScoped<IDepartamentoRepository>(_ => DepartamentoRepo);
            services.AddScoped<ISeccionRepository>(_ => SeccionRepo);
            services.AddScoped<IUnidadRepository>(_ => UnidadRepo);
            services.AddScoped<IPlazaRepository>(_ => PlazaRepo);
            services.AddScoped<IEmailService>(_ => EmailService);
        });
    }
}
