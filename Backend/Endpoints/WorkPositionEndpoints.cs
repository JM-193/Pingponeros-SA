using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class WorkPositionEndpoints
{
    public static void MapWorkPositionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var puestos = app.MapGroup("/puestos-trabajo");

        puestos.MapGet("/", (IWorkPositionRepository repo) => ListarAsync(repo, isDev));
        puestos.MapPost("/", (CreateWorkPositionDto dto, IWorkPositionRepository repo) => CrearAsync(dto, repo, isDev));
        puestos.MapDelete("/{nombre}", (string nombre, IWorkPositionRepository repo) => EliminarAsync(nombre, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IWorkPositionRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateWorkPositionDto dto, IWorkPositionRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDto = TextNormalizer.Nombre(dto.Nombre);

        try
        {
            var existe = await repo.ExisteNombreAsync(nombreDto).ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = "Ya existe un puesto con ese nombre." });

            var puesto = new WorkPosition { Nombre = nombreDto, Descripcion = dto.Descripcion.Trim() };
            var id = await repo.InsertarAsync(puesto).ConfigureAwait(false);
            return Results.Created($"/puestos-trabajo/{id}", new { mensaje = "Puesto creado correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> EliminarAsync(string nombre, IWorkPositionRepository repo, bool isDev)
    {
        var nombreDescodificado = Uri.UnescapeDataString(nombre);

        try
        {
            var puesto = await repo.ObtenerPorNombreAsync(nombreDescodificado).ConfigureAwait(false);
            if (puesto is null)
                return Results.NotFound(new { mensaje = "No se encontró el puesto." });

            var asociado = await repo.EstaAsociadoAsync(puesto.Id).ConfigureAwait(false);
            if (asociado)
                return Results.Conflict(new { mensaje = "El puesto está asociado a una o más plazas y no puede eliminarse." });

            var eliminado = await repo.EliminarAsync(puesto.Id).ConfigureAwait(false);
            return eliminado
                ? Results.Ok(new { mensaje = "Puesto eliminado correctamente." })
                : Results.NotFound(new { mensaje = "No se encontró el puesto." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
