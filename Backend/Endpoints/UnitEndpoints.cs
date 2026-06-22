// UnitEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class UnitEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Unidades                                                 //
    // ---------------------------------------------------------------- //
    public static void MapUnitEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var unidades = app.MapGroup("/unidades");

        // GET /unidades — Lista todas las unidades
        unidades.MapGet("/", (IUnitRepository repo) => ListarAsync(repo, isDev));

        // POST /unidades — Crea una nueva unidad
        unidades.MapPost("/", (CreateUnitDto dto, IUnitRepository repo) => CrearAsync(dto, repo, isDev));

        // GET /unidades/{nombre} — Obtiene una unidad por nombre
        unidades.MapGet("/{nombre}", (string nombre, IUnitRepository repo) => ObtenerPorNombreAsync(nombre, repo, isDev));

        // PUT /unidades/{nombre} — Actualiza una unidad
        unidades.MapPut("/{nombre}", (string nombre, CreateUnitDto dto, IUnitRepository repo) => ActualizarAsync(nombre, dto, repo, isDev));

        // DELETE /unidades/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        unidades.MapDelete("/{id:int}", (int id, IUnitRepository repo) => DesactivarAsync(id, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IUnitRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateUnitDto dto, IUnitRepository repo, bool isDev)
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
    }

    private static async Task<IResult> ObtenerPorNombreAsync(string nombre, IUnitRepository repo, bool isDev)
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
    }

    private static async Task<IResult> ActualizarAsync(string nombre, CreateUnitDto dto, IUnitRepository repo, bool isDev)
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
    }

    private static async Task<IResult> DesactivarAsync(int id, IUnitRepository repo, bool isDev)
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
    }
}
