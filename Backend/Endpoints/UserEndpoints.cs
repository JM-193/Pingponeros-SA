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

        // GET /usuarios/{correo}/plazas — Lista las plazas vinculadas (activas) del usuario
        usuarios.MapGet("/{correo}/plazas", (string correo, IPositionAssignmentRepository repo) => ListarPlazasAsync(correo, repo, isDev));

        // POST /usuarios/{correo}/plazas — Vincula una plaza disponible al usuario
        usuarios.MapPost("/{correo}/plazas", (string correo, AssignPositionDto dto, IPositionAssignmentRepository asignacionRepo, IPositionRepository plazaRepo)
            => AsignarPlazaAsync(correo, dto, asignacionRepo, plazaRepo, isDev));

        // DELETE /usuarios/{correo}/plazas/{numeroPlaza} — Desvincula (libera) la plaza del usuario
        usuarios.MapDelete("/{correo}/plazas/{numeroPlaza}", (string correo, ulong numeroPlaza, IPositionAssignmentRepository repo)
            => DesasignarPlazaAsync(correo, numeroPlaza, repo, isDev));
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
                ? Results.NotFound(new { error = "No se encontró el usuario." })
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
                : Results.NotFound(new { mensaje = "No se encontró el usuario." });
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
                : Results.NotFound(new { mensaje = "No se encontró el usuario." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // ---------------------------------------------------------------- //
    // Plazas vinculadas al usuario (PLAZAS_USUARIOS)                    //
    // ---------------------------------------------------------------- //
    private static async Task<IResult> ListarPlazasAsync(string correo, IPositionAssignmentRepository repo, bool isDev)
    {
        try
        {
            var lista = await repo.ObtenerActivasPorUsuarioAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> AsignarPlazaAsync(
        string correo,
        AssignPositionDto dto,
        IPositionAssignmentRepository asignacionRepo,
        IPositionRepository plazaRepo,
        bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var correoDescodificado = Uri.UnescapeDataString(correo);

        try
        {
            var existePlaza = await plazaRepo.ExisteNumeroPlazaAsync(dto.NumeroPlaza).ConfigureAwait(false);
            if (!existePlaza)
                return Results.NotFound(new { mensaje = "No se encontró la plaza." });

            var ocupada = await asignacionRepo.PlazaTieneAsignacionActivaAsync(dto.NumeroPlaza).ConfigureAwait(false);
            if (ocupada)
                return Results.Conflict(new { mensaje = "La plaza ya está vinculada a otro usuario." });

            var asignacion = new PositionAssignment
            {
                NumeroPlaza = dto.NumeroPlaza,
                CorreoInstitucional = correoDescodificado,
                IdPuesto = dto.IdPuesto,
                ClaseOcupacional = dto.ClaseOcupacional.Trim(),
                LugarTrabajo = dto.LugarTrabajo.Trim(),
                FechaInicio = dto.FechaInicio!.Value,
                FechaFinal = dto.FechaFinal,
            };

            await asignacionRepo.AsignarAsync(asignacion).ConfigureAwait(false);
            return Results.Created(
                $"/usuarios/{Uri.EscapeDataString(correoDescodificado)}/plazas/{asignacion.NumeroPlaza}",
                new { mensaje = "Plaza vinculada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> DesasignarPlazaAsync(string correo, ulong numeroPlaza, IPositionAssignmentRepository repo, bool isDev)
    {
        try
        {
            var desvinculada = await repo.DesasignarAsync(numeroPlaza, Uri.UnescapeDataString(correo)).ConfigureAwait(false);
            return desvinculada
                ? Results.Ok(new { mensaje = "Plaza desvinculada correctamente." })
                : Results.NotFound(new { mensaje = "No se encontró una vinculación activa para el usuario." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
