// Program.cs
using Backend.Extensions;
using DotNetEnv;

namespace Backend;

internal static class Program
{
    public static void Main(string[] args)
    {
        Env.Load();

        var builder = WebApplication.CreateBuilder(args);

        builder.AddOracle();
        builder.AddApplicationServices();

        var app = builder.Build();
        var isDev = app.Environment.IsDevelopment();

        app.UseApiPipeline();
        app.MapApiEndpoints(isDev);

        app.Run();
    }
}
