// TestWebApplicationFactory.cs
using Backend.Repositories;
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

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<OracleConnection>();
            services.RemoveAll<IDbExecutor>();
            services.RemoveAll<IUsuarioRepository>();
            services.RemoveAll<IAreaRepository>();
            services.RemoveAll<IDepartamentoRepository>();
            services.RemoveAll<ISeccionRepository>();
            services.RemoveAll<IUnidadRepository>();
            services.AddScoped<IUsuarioRepository>(_ => UsuarioRepo);
            services.AddScoped<IAreaRepository>(_ => AreaRepo);
            services.AddScoped<IDepartamentoRepository>(_ => DepartamentoRepo);
            services.AddScoped<ISeccionRepository>(_ => SeccionRepo);
            services.AddScoped<IUnidadRepository>(_ => UnidadRepo);
        });
    }
}
