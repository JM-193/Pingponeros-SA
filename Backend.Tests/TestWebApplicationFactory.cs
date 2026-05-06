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

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<OracleConnection>();
            services.RemoveAll<IUsuarioRepository>();
            services.RemoveAll<IAreaRepository>();
            services.AddScoped<IUsuarioRepository>(_ => UsuarioRepo);
            services.AddScoped<IAreaRepository>(_ => AreaRepo);
        });
    }
}
