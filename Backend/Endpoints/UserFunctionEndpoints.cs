using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class UserFunctionEndpoints
{
    public static void MapUserFunctionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var funciones = app.MapGroup("/funciones-usuarios");

        // GET /funciones-usuarios — Todas (administrador)
        funciones.MapGet("/", (IUserFunctionRepository repo) => ListarTodasAsync(repo, isDev));

        // GET /funciones-usuarios/{correo} — Las del usuario indicado
        funciones.MapGet("/{correo}", (string correo, IUserFunctionRepository repo) => ListarPorCorreoAsync(correo, repo, isDev));

        // POST /funciones-usuarios — Crea una función de usuario
        funciones.MapPost("/", (CreateUserFunctionDto dto, IUserFunctionRepository repo) => CrearAsync(dto, repo, isDev));

        // DELETE /funciones-usuarios/{id} — Elimina por ID
        funciones.MapDelete("/{id}", (string id, IUserFunctionRepository repo) => EliminarAsync(id, repo, isDev));
    }

    private static async Task<IResult> ListarTodasAsync(IUserFunctionRepository repo, bool isDev)
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

    private static async Task<IResult> ListarPorCorreoAsync(string correo, IUserFunctionRepository repo, bool isDev)
    {
        try
        {
            var lista = await repo.ObtenerPorCorreoAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> CrearAsync(CreateUserFunctionDto dto, IUserFunctionRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            var funcion = new UserFunction
            {
                CorreoInstitucional = dto.CorreoInstitucional.Trim(),
                Nombre = dto.Nombre.Trim(),
                Descripcion = dto.Descripcion.Trim(),
            };
            var id = await repo.InsertarAsync(funcion).ConfigureAwait(false);
            return Results.Created($"/funciones-usuarios/{id}", new { mensaje = "Función de usuario creada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> EliminarAsync(string idStr, IUserFunctionRepository repo, bool isDev)
    {
        if (!int.TryParse(idStr, out var id))
            return Results.BadRequest(new { mensaje = "ID inválido." });

        try
        {
            var enActividades = await repo.EstaEnActividadesAsync(id).ConfigureAwait(false);
            if (enActividades)
                return Results.Conflict(new { mensaje = "La función está asociada a una o más actividades y no puede eliminarse." });

            var eliminado = await repo.EliminarAsync(id).ConfigureAwait(false);
            return eliminado
                ? Results.Ok(new { mensaje = "Función de usuario eliminada correctamente." })
                : Results.NotFound(new { mensaje = "No se encontró la función de usuario." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
