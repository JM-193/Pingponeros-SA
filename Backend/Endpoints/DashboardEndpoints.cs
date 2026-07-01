using Backend.Services;

namespace Backend.Endpoints;

internal static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var dashboard = app.MapGroup("/dashboard");

        // GET /dashboard — Resumen administrativo (indicadores, gráficos, tablas y alertas)
        dashboard.MapGet("/", (IDashboardService svc) => svc.ObtenerResumenAsync(isDev));
    }
}
