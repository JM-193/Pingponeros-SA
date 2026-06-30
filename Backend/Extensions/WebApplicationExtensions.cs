// WebApplicationExtensions.cs
using Backend.Endpoints;
using Scalar.AspNetCore;

namespace Backend.Extensions;

/// <summary>
/// Configuración del pipeline HTTP y registro de los grupos de endpoints. Separa la fase
/// de middleware del registro de servicios y deja el mapeo de rutas distribuido por recurso.
/// </summary>
internal static class WebApplicationExtensions
{
    public static void UseApiPipeline(this WebApplication app)
    {
        app.UseExceptionHandler();
        app.MapOpenApi();
        app.MapScalarApiReference();
        app.UseCors("FrontendOrigin");
    }

    public static void MapApiEndpoints(this WebApplication app, bool isDev)
    {
        app.MapUserEndpoints(isDev);
        app.MapAreaEndpoints(isDev);
        app.MapDepartmentEndpoints(isDev);
        app.MapSectionEndpoints(isDev);
        app.MapUnitEndpoints(isDev);
        app.MapPositionEndpoints(isDev);
        app.MapWorkPositionEndpoints(isDev);
        app.MapFunctionEndpoints(isDev);
        app.MapUserFunctionEndpoints(isDev);
        app.MapDeclaracionEndpoints(isDev);
        app.MapReporteEndpoints(isDev);
        app.MapAuthEndpoints(isDev);
    }
}
