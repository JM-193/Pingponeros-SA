// Program.cs
using Backend.Extensions;
using DotNetEnv;
using QuestPDF.Infrastructure;

namespace Backend;

internal static class Program
{
    public static void Main(string[] args)
    {
        Env.Load();

        // QuestPDF requiere fijar la licencia una vez al arrancar; Community es gratuita para este uso.
        QuestPDF.Settings.License = LicenseType.Community;

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
