// UnidadEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class UnidadEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Unidades                                                 //
    // ---------------------------------------------------------------- //
    public static void MapUnidadEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var unidades = app.MapGroup("/unidades");

        // GET /unidades — Lista todas las unidades
        unidades.MapGet("/", async (IUnitRepository repo) =>
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

        // POST /unidades — Crea una nueva unidad
        unidades.MapPost("/", async (CreateUnitDto dto, IUnitRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe una unidad con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }

            var unidad = new Unit
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                Estado = dto.Estado ?? 1,
            };

            try
            {
                var id = await repo.InsertarAsync(unidad).ConfigureAwait(false);
                return Results.Created($"/unidades/{id}", new { mensaje = $"Unidad '{unidad.Nombre}' creada correctamente." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // GET /unidades/{nombre} — Obtiene una unidad por nombre
        unidades.MapGet("/{nombre}", async (string nombre, IUnitRepository repo) =>
        {
            try
            {
                var unidad = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return unidad is null
                    ? Results.NotFound(new { mensaje = $"No se encontró la unidad '{nombre}'." })
                    : Results.Ok(unidad);
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // PUT /unidades/{nombre} — Actualiza una unidad
        unidades.MapPut("/{nombre}", async (string nombre, CreateUnitDto dto, IUnitRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe una unidad con el nombre '{dto.Nombre}'.",
                isDev).ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var unidad = new Unit
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, unidad),
                $"Unidad '{unidad.Nombre}' actualizada correctamente.",
                $"No se encontró la unidad '{nombre}'.",
                isDev).ConfigureAwait(false);
        });

        // DELETE /unidades/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        unidades.MapDelete("/{id:int}", async (int id, IUnitRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró la unidad activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });
    }
}
