// PlazaEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class PlazaEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Plazas                                                  //
    // ---------------------------------------------------------------- //
    public static void MapPlazaEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var plazas = app.MapGroup("/plazas");

        // GET /plazas — Lista todas las plazas
        plazas.MapGet("/", async (IPositionRepository repo) =>
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

        // GET /plazas/{numeroPlaza} — Obtiene una plaza por número
        plazas.MapGet("/{numeroPlaza:long}", async (long numeroPlaza, IPositionRepository repo) =>
        {
            try
            {
                var plaza = await repo.ObtenerPorNumeroAsync(numeroPlaza).ConfigureAwait(false);
                return plaza is null
                    ? Results.NotFound(new { mensaje = $"No se encontró la plaza '{numeroPlaza}'." })
                    : Results.Ok(plaza);
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // POST /plazas — Crea una nueva plaza
        plazas.MapPost("/", async (CreatePositionDto dto, IPositionRepository repo) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            try
            {
                var existe = await repo.ExisteNumeroPlazaAsync(dto.NumeroPlaza).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe una plaza con el número '{dto.NumeroPlaza}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }

            var plaza = new Position
            {
                NumeroPlaza = dto.NumeroPlaza,
                IdUnidad = dto.IdUnidad,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                IdArea = dto.IdArea,
            };

            try
            {
                await repo.InsertarAsync(plaza).ConfigureAwait(false);
                return Results.Created($"/plazas/{plaza.NumeroPlaza}", new { mensaje = $"Plaza '{plaza.NumeroPlaza}' creada correctamente." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }
        });

        // PUT /plazas/{numeroPlaza} — Actualiza las asignaciones de una plaza existente
        plazas.MapPut("/{numeroPlaza:long}", async (long numeroPlaza, CreatePositionDto dto, IPositionRepository repo) =>
        {
            try
            {
                var existe = await repo.ExisteNumeroPlazaAsync(numeroPlaza).ConfigureAwait(false);
                if (!existe)
                    return Results.NotFound(new { mensaje = $"No se encontró la plaza '{numeroPlaza}'." });
            }
            catch (OracleException ex)
            {
                return OracleErrorMapper.ToResult(ex, isDev);
            }

            var plaza = new Position
            {
                NumeroPlaza = numeroPlaza,
                IdUnidad = dto.IdUnidad,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                IdArea = dto.IdArea,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(numeroPlaza, plaza),
                $"Plaza '{numeroPlaza}' actualizada correctamente.",
                $"No se encontró la plaza '{numeroPlaza}'.",
                isDev).ConfigureAwait(false);
        });
    }
}
