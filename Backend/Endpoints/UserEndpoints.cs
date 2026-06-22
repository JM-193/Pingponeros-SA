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
        usuarios.MapGet("/", async (IUserRepository repo) =>
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
        });

        // GET /usuarios/{correo} — Busca por clave primaria
        usuarios.MapGet("/{correo}", async (string correo, IUserRepository repo) =>
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
        });

        // POST /usuarios — Crea un nuevo usuario con contraseña temporal
        usuarios.MapPost("/", async (CreateUserDto dto, IUserService userService) =>
        {
            if (dto.Validar() is { } error)
                return Results.BadRequest(new { mensaje = error });

            return await userService.CrearAsync(dto, isDev).ConfigureAwait(false);
        });

        // PUT /usuarios/{correo} — Actualiza un usuario existente
        usuarios.MapPut("/{correo}", async (string correo, User usuario, IUserRepository repo) =>
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
        });

        // DELETE /usuarios/{correo} — Elimina un usuario
        usuarios.MapDelete("/{correo}", async (string correo, IUserRepository repo) =>
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
        });
    }
}
