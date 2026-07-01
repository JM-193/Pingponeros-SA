using Backend.Services;

namespace Backend.Endpoints;

internal static class ReporteEndpoints
{
    public static void MapReporteEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var reportes = app.MapGroup("/reportes");

        // GET /reportes/funcionarios?formato=pdf|excel — Reporte administrativo de funcionarios
        reportes.MapGet("/funcionarios", (string? formato, IReporteService svc)
            => svc.GenerarFuncionariosAsync(formato, isDev));

        // GET /reportes/declaraciones?formato=pdf|excel — Reporte administrativo de declaraciones juradas
        reportes.MapGet("/declaraciones", (string? formato, IReporteService svc)
            => svc.GenerarDeclaracionesAsync(formato, isDev));

        // GET /reportes/horas?formato=pdf|excel — Reporte administrativo de horas / carga laboral
        reportes.MapGet("/horas", (string? formato, IReporteService svc)
            => svc.GenerarHorasAsync(formato, isDev));

        // GET /reportes/declaraciones/{id}/horas — Reporte personal (PDF) de las horas de una declaración
        reportes.MapGet("/declaraciones/{id:int}/horas", (int id, IReporteService svc)
            => svc.GenerarHorasDeclaracionAsync(id, isDev));

        // GET /reportes/declaraciones/{id}/documento — Documento oficial (PDF) de la declaración para firma física
        reportes.MapGet("/declaraciones/{id:int}/documento", (int id, IReporteService svc)
            => svc.GenerarDeclaracionDocumentoAsync(id, isDev));
    }
}
