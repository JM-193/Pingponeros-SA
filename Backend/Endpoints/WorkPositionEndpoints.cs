// WorkPositionEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints;

internal static class WorkPositionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Puestos de Trabajo                                       //
    // ---------------------------------------------------------------- //
    public static void MapWorkPositionEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var puestos = app.MapGroup("/puestos-trabajo");

        // GET  /puestos-trabajo            — Lista todos los puestos de trabajo
        puestos.MapGet("/", (IWorkPositionRepository repo) => ListarAsync(repo, isDev));
        // POST /puestos-trabajo            — Crea un nuevo puesto de trabajo
        puestos.MapPost("/", (CreateWorkPositionDto dto, IWorkPositionRepository repo) => CrearAsync(dto, repo, isDev));
        // DELETE /puestos-trabajo/{nombre} — Elimina un puesto (solo si no está vinculado a ninguna plaza)
        puestos.MapDelete("/{nombre}", (string nombre, IWorkPositionRepository repo) => EliminarAsync(nombre, repo, isDev));

        // GET  /puestos-trabajo/{id}/funciones               — Lista las funciones oficiales asignadas al puesto
        puestos.MapGet("/{id:int}/funciones", (int id, IWorkPositionFunctionRepository repo) => ListarFuncionesAsync(id, repo, isDev));
        // POST /puestos-trabajo/{id}/funciones               — Asigna una función oficial al puesto
        puestos.MapPost("/{id:int}/funciones", (int id, AssignFunctionToPositionDto dto, IWorkPositionFunctionRepository repo) => AgregarFuncionAsync(id, dto, repo, isDev));
        // DELETE /puestos-trabajo/{id}/funciones/{idFuncion} — Desvincula una función del puesto
        puestos.MapDelete("/{id:int}/funciones/{idFuncion:int}", (int id, int idFuncion, IWorkPositionFunctionRepository repo) => QuitarFuncionAsync(id, idFuncion, repo, isDev));
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

    private static async Task<IResult> ListarFuncionesAsync(int id, IWorkPositionFunctionRepository repo, bool isDev)
    {
        try
        {
            var lista = await repo.ObtenerFuncionesDePuestoAsync(id).ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> AgregarFuncionAsync(int id, AssignFunctionToPositionDto dto, IWorkPositionFunctionRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            var yaAsociada = await repo.EstaAsociadaAsync(id, dto.IdFuncion).ConfigureAwait(false);
            if (yaAsociada)
                return Results.Conflict(new { mensaje = "La función ya está asignada a este puesto." });

            await repo.AgregarAsync(id, dto.IdFuncion).ConfigureAwait(false);
            return Results.Created($"/puestos-trabajo/{id}/funciones/{dto.IdFuncion}", new { mensaje = "Función asignada correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> QuitarFuncionAsync(int id, int idFuncion, IWorkPositionFunctionRepository repo, bool isDev)
    {
        try
        {
            var quitada = await repo.QuitarAsync(id, idFuncion).ConfigureAwait(false);
            return quitada
                ? Results.Ok(new { mensaje = "Función desasignada correctamente." })
                : Results.NotFound(new { mensaje = "La función no estaba asignada a este puesto." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
