// PositionEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class PositionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Plazas                                                  //
    // ---------------------------------------------------------------- //
    public static void MapPositionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var plazas = app.MapGroup("/plazas");

        // GET /plazas — Lista todas las plazas
        plazas.MapGet("/", (IPositionRepository repo) => ListarAsync(repo, isDev));

        // GET /plazas/disponibles — Lista las plazas sin vinculación activa (disponibles para asignar)
        plazas.MapGet("/disponibles", (IPositionAssignmentRepository repo) => ListarDisponiblesAsync(repo, isDev));

        // GET /plazas/{numeroPlaza} — Obtiene una plaza por número (entero sin signo)
        plazas.MapGet("/{numeroPlaza}", (ulong numeroPlaza, IPositionRepository repo) => ObtenerPorNumeroAsync(numeroPlaza, repo, isDev));

        // POST /plazas — Crea una nueva plaza
        plazas.MapPost("/", (CreatePositionDto dto, IPositionRepository repo) => CrearAsync(dto, repo, isDev));

        // PUT /plazas/{numeroPlaza} — Actualiza las asignaciones de una plaza existente
        plazas.MapPut("/{numeroPlaza}", (ulong numeroPlaza, CreatePositionDto dto, IPositionRepository repo) => ActualizarAsync(numeroPlaza, dto, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IPositionRepository repo, bool isDev)
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
    }

    private static async Task<IResult> ListarDisponiblesAsync(IPositionAssignmentRepository repo, bool isDev)
    {
        try
        {
            var lista = await repo.ObtenerPlazasDisponiblesAsync().ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ObtenerPorNumeroAsync(ulong numeroPlaza, IPositionRepository repo, bool isDev)
    {
        try
        {
            var plaza = await repo.ObtenerPorNumeroAsync(numeroPlaza).ConfigureAwait(false);
            return plaza is null
                ? Results.NotFound(new { mensaje = "No se encontró la plaza." })
                : Results.Ok(plaza);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> CrearAsync(CreatePositionDto dto, IPositionRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            var existe = await repo.ExisteNumeroPlazaAsync(dto.NumeroPlaza).ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = "Ya existe una plaza con ese número." });
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
            return Results.Created($"/plazas/{plaza.NumeroPlaza}", new { mensaje = "Plaza creada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ActualizarAsync(ulong numeroPlaza, CreatePositionDto dto, IPositionRepository repo, bool isDev)
    {
        try
        {
            var existe = await repo.ExisteNumeroPlazaAsync(numeroPlaza).ConfigureAwait(false);
            if (!existe)
                return Results.NotFound(new { mensaje = "No se encontró la plaza." });
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
            "Plaza actualizada correctamente.",
            "No se encontró la plaza.",
            isDev).ConfigureAwait(false);
    }
}
