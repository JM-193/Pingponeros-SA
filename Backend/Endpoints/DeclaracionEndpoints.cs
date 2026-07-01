// DeclaracionEndpoints.cs
using Backend.DTOs;
using Backend.Services;

namespace Backend.Endpoints;

internal static class DeclaracionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Declaraciones Juradas de Carga de Trabajo               //
    // ---------------------------------------------------------------- //
    public static void MapDeclaracionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var declaraciones = app.MapGroup("/declaraciones");

        // POST /declaraciones/usuario/{correo} — Abre un borrador para una plaza del usuario
        declaraciones.MapPost("/usuario/{correo}", (string correo, CreateDeclaracionDto dto, IDeclaracionService svc)
            => svc.CrearAsync(Uri.UnescapeDataString(correo), dto, isDev));

        // GET /declaraciones/usuario/{correo}/activa — Borrador activo (con detalle) o 204
        declaraciones.MapGet("/usuario/{correo}/activa", (string correo, IDeclaracionService svc)
            => svc.ObtenerActivaAsync(Uri.UnescapeDataString(correo), isDev));

        // GET /declaraciones/usuario/{correo}/autocompletado — Datos preexistentes para rellenar el formulario
        declaraciones.MapGet("/usuario/{correo}/autocompletado", (string correo, IDeclaracionService svc)
            => svc.ObtenerAutocompletadoAsync(Uri.UnescapeDataString(correo), isDev));

        // GET /declaraciones/usuario/{correo} — Historial de declaraciones completas
        declaraciones.MapGet("/usuario/{correo}", (string correo, IDeclaracionService svc)
            => svc.ObtenerHistorialAsync(Uri.UnescapeDataString(correo), isDev));

        // GET /declaraciones/{id} — Detalle completo (vista de solo lectura)
        declaraciones.MapGet("/{id:int}", (int id, IDeclaracionService svc) => svc.ObtenerDetalleAsync(id, isDev));

        // PUT /declaraciones/{id} — Guarda el borrador (reemplaza sus hijos)
        declaraciones.MapPut("/{id:int}", (int id, GuardarDeclaracionDto dto, IDeclaracionService svc)
            => svc.GuardarAsync(id, dto, isDev));

        // PUT /declaraciones/{id}/completar — Finaliza el borrador (solo lectura en adelante)
        declaraciones.MapPut("/{id:int}/completar", (int id, IDeclaracionService svc) => svc.CompletarAsync(id, isDev));

        // DELETE /declaraciones/{id} — Cancela (elimina) el borrador
        declaraciones.MapDelete("/{id:int}", (int id, IDeclaracionService svc) => svc.CancelarAsync(id, isDev));
    }
}
