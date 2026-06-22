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
        areas.MapGet("/", (IAreaRepository repo) => ListarAsync(repo, isDev));

        // POST /areas — Crea una nueva área
        areas.MapPost("/", (CreateAreaDto dto, IAreaRepository repo) => CrearAsync(dto, repo, isDev));

        // GET /areas/{nombre} — Obtiene un área por nombre
        areas.MapGet("/{nombre}", (string nombre, IAreaRepository repo) => ObtenerPorNombreAsync(nombre, repo, isDev));

        // PUT /areas/{nombre} — Actualiza un área
        areas.MapPut("/{nombre}", (string nombre, CreateAreaDto dto, IAreaRepository repo) => ActualizarAsync(nombre, dto, repo, isDev));

        // DELETE /areas/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        areas.MapDelete("/{id:int}", (int id, IAreaRepository repo) => DesactivarAsync(id, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IAreaRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateAreaDto dto, IAreaRepository repo, bool isDev)
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
    }

    private static async Task<IResult> ObtenerPorNombreAsync(string nombre, IAreaRepository repo, bool isDev)
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
    }

    private static async Task<IResult> ActualizarAsync(string nombre, CreateAreaDto dto, IAreaRepository repo, bool isDev)
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
    }

    private static async Task<IResult> DesactivarAsync(int id, IAreaRepository repo, bool isDev)
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
    }
}
