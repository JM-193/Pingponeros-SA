// FunctionEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class FunctionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Funciones Oficiales                                      //
    // ---------------------------------------------------------------- //
    public static void MapFunctionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var funciones = app.MapGroup("/funciones");

        // GET    /funciones         — Lista todas las funciones oficiales del catálogo institucional
        funciones.MapGet("/", (IFunctionRepository repo) => ListarAsync(repo, isDev));
        // POST   /funciones         — Crea una nueva función oficial (nombre único)
        funciones.MapPost("/", (CreateFunctionDto dto, IFunctionRepository repo) => CrearAsync(dto, repo, isDev));
        // DELETE /funciones/{nombre} — Elimina una función oficial (solo si no está usada en actividades de declaraciones)
        funciones.MapDelete("/{nombre}", (string nombre, IFunctionRepository repo) => EliminarAsync(nombre, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IFunctionRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateFunctionDto dto, IFunctionRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDto = TextNormalizer.Nombre(dto.Nombre);

        try
        {
            var existe = await repo.ExisteNombreAsync(nombreDto).ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = "Ya existe una función oficial con ese nombre." });

            var funcion = new Function { Nombre = nombreDto, Descripcion = dto.Descripcion.Trim() };
            var id = await repo.InsertarAsync(funcion).ConfigureAwait(false);
            return Results.Created($"/funciones/{id}", new { mensaje = "Función oficial creada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> EliminarAsync(string nombre, IFunctionRepository repo, bool isDev)
    {
        var nombreDescodificado = Uri.UnescapeDataString(nombre);

        try
        {
            var funcion = await repo.ObtenerPorNombreAsync(nombreDescodificado).ConfigureAwait(false);
            if (funcion is null)
                return Results.NotFound(new { mensaje = "No se encontró la función oficial." });

            var enActividades = await repo.EstaEnActividadesAsync(funcion.Id).ConfigureAwait(false);
            if (enActividades)
                return Results.Conflict(new { mensaje = "La función oficial está asociada a una o más actividades y no puede eliminarse." });

            var eliminado = await repo.EliminarAsync(funcion.Id).ConfigureAwait(false);
            return eliminado
                ? Results.Ok(new { mensaje = "Función oficial eliminada correctamente." })
                : Results.NotFound(new { mensaje = "No se encontró la función oficial." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
