// SeccionEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class SeccionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Secciones                                                //
    // ---------------------------------------------------------------- //
    public static void MapSeccionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var secciones = app.MapGroup("/secciones");

        // GET /secciones — Lista todas las secciones
        secciones.MapGet("/", async (ISectionRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodasAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // POST /secciones — Crea una nueva sección
        secciones.MapPost("/", async (CreateSectionDto dto, ISectionRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe una sección con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }

            var seccion = new Section
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            try
            {
                var id = await repo.InsertarAsync(seccion).ConfigureAwait(false);
                return Results.Created($"/secciones/{id}", new { mensaje = $"Sección '{seccion.Nombre}' creada correctamente." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // GET /secciones/{nombre} — Obtiene una sección por nombre
        secciones.MapGet("/{nombre}", async (string nombre, ISectionRepository repo) =>
        {
            try
            {
                var seccion = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return seccion is null
                    ? Results.NotFound(new { mensaje = $"No se encontró la sección '{nombre}'." })
                    : Results.Ok(seccion);
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // PUT /secciones/{nombre} — Actualiza una sección
        secciones.MapPut("/{nombre}", async (string nombre, CreateSectionDto dto, ISectionRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe una sección con el nombre '{dto.Nombre}'.",
                isDev).ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var seccion = new Section
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, seccion),
                $"Sección '{seccion.Nombre}' actualizada correctamente.",
                $"No se encontró la sección '{nombre}'.",
                isDev).ConfigureAwait(false);
        });

        // DELETE /secciones/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        secciones.MapDelete("/{id:int}", async (int id, ISectionRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró la sección activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });
    }
}
