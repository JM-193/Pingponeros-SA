// UserEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Backend.Services;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class UserEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Usuarios                                                 //
    // ---------------------------------------------------------------- //
    public static void MapUserEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var usuarios = app.MapGroup("/usuarios");

        // GET /usuarios — Lista todos los usuarios
        usuarios.MapGet("/", (IUserRepository repo) => ListarAsync(repo, isDev));

        // GET /usuarios/{correo} — Busca por clave primaria
        usuarios.MapGet("/{correo}", (string correo, IUserRepository repo) => ObtenerPorCorreoAsync(correo, repo, isDev));

        // POST /usuarios — Crea un nuevo usuario con contraseña temporal
        usuarios.MapPost("/", (CreateUserDto dto, IUserService userService) => CrearAsync(dto, userService, isDev));

        // PUT /usuarios/{correo} — Actualiza un usuario existente
        usuarios.MapPut("/{correo}", (string correo, User usuario, IUserRepository repo) => ActualizarAsync(correo, usuario, repo, isDev));

        // DELETE /usuarios/{correo} — Elimina un usuario
        usuarios.MapDelete("/{correo}", (string correo, IUserRepository repo) => EliminarAsync(correo, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IUserRepository repo, bool isDev)
    {
        try
        {
            var lista = await repo.ObtenerTodosAsync().ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ObtenerPorCorreoAsync(string correo, IUserRepository repo, bool isDev)
    {
        try
        {
            var usuario = await repo.ObtenerPorCorreoAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
            return usuario is null
                ? Results.NotFound(new { error = $"No se encontró el usuario '{correo}'." })
                : Results.Ok(usuario);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> CrearAsync(CreateUserDto dto, IUserService userService, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        return await userService.CrearAsync(dto, isDev).ConfigureAwait(false);
    }

    private static async Task<IResult> ActualizarAsync(string correo, User usuario, IUserRepository repo, bool isDev)
    {
        try
        {
            var actualizado = await repo.ActualizarAsync(Uri.UnescapeDataString(correo), usuario).ConfigureAwait(false);
            return actualizado
                ? Results.Ok(usuario)
                : Results.NotFound(new { mensaje = $"No se encontró el usuario '{correo}'." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> EliminarAsync(string correo, IUserRepository repo, bool isDev)
    {
        try
        {
            var eliminado = await repo.EliminarAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
            return eliminado
                ? Results.NoContent()
                : Results.NotFound(new { mensaje = $"No se encontró el usuario '{correo}'." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
