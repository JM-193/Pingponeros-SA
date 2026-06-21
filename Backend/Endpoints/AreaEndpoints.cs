// AreaEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class AreaEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Áreas                                                    //
    // ---------------------------------------------------------------- //
    public static void MapAreaEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var areas = app.MapGroup("/areas");

        // GET /areas — Lista todas las áreas
        areas.MapGet("/", async (IAreaRepository repo) =>
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

        // POST /areas — Crea una nueva área
        areas.MapPost("/", async (CreateAreaDto dto, IAreaRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe un área con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }

            var area = new Area
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = dto.Estado ?? 1,
            };

            try
            {
                var id = await repo.InsertarAsync(area).ConfigureAwait(false);
                return Results.Created($"/areas/{id}", new { mensaje = $"Área '{area.Nombre}' creada correctamente." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // GET /areas/{nombre} — Obtiene un área por nombre
        areas.MapGet("/{nombre}", async (string nombre, IAreaRepository repo) =>
        {
            try
            {
                var area = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return area is null
                    ? Results.NotFound(new { mensaje = $"No se encontró el área '{nombre}'." })
                    : Results.Ok(area);
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // PUT /areas/{nombre} — Actualiza un área
        areas.MapPut("/{nombre}", async (string nombre, CreateAreaDto dto, IAreaRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe un área con el nombre '{dto.Nombre}'.",
                isDev).ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var area = new Area
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, area),
                $"Área '{area.Nombre}' actualizada correctamente.",
                $"No se encontró el área '{nombre}'.",
                isDev).ConfigureAwait(false);
        });

        // DELETE /areas/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        areas.MapDelete("/{id:int}", async (int id, IAreaRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró el área activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });
    }
}
