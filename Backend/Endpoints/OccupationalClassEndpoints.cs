using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class OccupationalClassEndpoints
{
    public static void MapOccupationalClassEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var clases = app.MapGroup("/clases-ocupacionales");

        clases.MapGet("/", (IOccupationalClassRepository repo) => ListarAsync(repo, isDev));
        clases.MapPost("/", (CreateOccupationalClassDto dto, IOccupationalClassRepository repo) => CrearAsync(dto, repo, isDev));
        clases.MapDelete("/{id:long}", (long id, IOccupationalClassRepository repo) => EliminarAsync(id, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IOccupationalClassRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateOccupationalClassDto dto, IOccupationalClassRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDto = TextNormalizer.Nombre(dto.Nombre);

        try
        {
            var existeNombre = await repo.ExisteNombreAsync(nombreDto).ConfigureAwait(false);
            if (existeNombre)
                return Results.Conflict(new { mensaje = "Ya existe una clase ocupacional con ese nombre." });

            var existeCodigo = await repo.ExisteCodigoAsync(dto.Codigo!.Value).ConfigureAwait(false);
            if (existeCodigo)
                return Results.Conflict(new { mensaje = "Ya existe una clase ocupacional con ese código." });

            var clase = new OccupationalClass { Codigo = dto.Codigo!.Value, Nombre = nombreDto };
            var id = await repo.InsertarAsync(clase).ConfigureAwait(false);
            return Results.Created($"/clases-ocupacionales/{id}", new { mensaje = "Clase ocupacional creada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> EliminarAsync(long id, IOccupationalClassRepository repo, bool isDev)
    {
        try
        {
            var clase = await repo.ObtenerPorIdAsync(id).ConfigureAwait(false);
            if (clase is null)
                return Results.NotFound(new { mensaje = "No se encontró la clase ocupacional." });

            var asociada = await repo.EstaAsociadoAsync(id).ConfigureAwait(false);
            if (asociada)
                return Results.Conflict(new { mensaje = "La clase ocupacional está asociada a una o más plazas y no puede eliminarse." });

            var eliminado = await repo.EliminarAsync(id).ConfigureAwait(false);
            return eliminado
                ? Results.Ok(new { mensaje = "Clase ocupacional eliminada correctamente." })
                : Results.NotFound(new { mensaje = "No se encontró la clase ocupacional." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
