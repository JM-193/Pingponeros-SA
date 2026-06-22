// DepartmentEndpoints.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints;

internal static class DepartmentEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Departamentos                                            //
    // ---------------------------------------------------------------- //
    public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        var departamentos = app.MapGroup("/departamentos");

        // GET /departamentos — Lista todos los departamentos
        departamentos.MapGet("/", (IDepartmentRepository repo) => ListarAsync(repo, isDev));

        // POST /departamentos — Crea un nuevo departamento
        departamentos.MapPost("/", (CreateDepartmentDto dto, IDepartmentRepository repo) => CrearAsync(dto, repo, isDev));

        // GET /departamentos/{nombre} — Obtiene un departamento por nombre
        departamentos.MapGet("/{nombre}", (string nombre, IDepartmentRepository repo) => ObtenerPorNombreAsync(nombre, repo, isDev));

        // PUT /departamentos/{nombre} — Actualiza un departamento
        departamentos.MapPut("/{nombre}", (string nombre, CreateDepartmentDto dto, IDepartmentRepository repo) => ActualizarAsync(nombre, dto, repo, isDev));

        // DELETE /departamentos/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        departamentos.MapDelete("/{id:int}", (int id, IDepartmentRepository repo) => DesactivarAsync(id, repo, isDev));
    }

    private static async Task<IResult> ListarAsync(IDepartmentRepository repo, bool isDev)
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

    private static async Task<IResult> CrearAsync(CreateDepartmentDto dto, IDepartmentRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = $"Ya existe un departamento con el nombre '{dto.Nombre}'." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }

        var departamento = new Department
        {
            Nombre = TextNormalizer.Nombre(dto.Nombre),
            Descripcion = dto.Descripcion.Trim(),
            IdArea = dto.IdArea,
            Estado = dto.Estado ?? 1,
        };

        try
        {
            var id = await repo.InsertarAsync(departamento).ConfigureAwait(false);
            return Results.Created($"/departamentos/{id}", new { mensaje = $"Departamento '{departamento.Nombre}' creado correctamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ObtenerPorNombreAsync(string nombre, IDepartmentRepository repo, bool isDev)
    {
        try
        {
            var departamento = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
            return departamento is null
                ? Results.NotFound(new { mensaje = $"No se encontró el departamento '{nombre}'." })
                : Results.Ok(departamento);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ActualizarAsync(string nombre, CreateDepartmentDto dto, IDepartmentRepository repo, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDescodificado = Uri.UnescapeDataString(nombre);

        var conflicto = await VerificarConflictoNombreAsync(
            () => repo.ExisteNombreAsync(dto.Nombre),
            dto.Nombre,
            nombreDescodificado,
            $"Ya existe un departamento con el nombre '{dto.Nombre}'.",
            isDev).ConfigureAwait(false);
        if (conflicto is not null)
            return conflicto;

        var departamento = new Department
        {
            Nombre = TextNormalizer.Nombre(dto.Nombre),
            Descripcion = dto.Descripcion.Trim(),
            IdArea = dto.IdArea,
            Estado = dto.Estado ?? 1,
        };

        return await EjecutarActualizacionAsync(
            () => repo.ActualizarAsync(nombreDescodificado, departamento),
            $"Departamento '{departamento.Nombre}' actualizado correctamente.",
            $"No se encontró el departamento '{nombre}'.",
            isDev).ConfigureAwait(false);
    }

    private static async Task<IResult> DesactivarAsync(int id, IDepartmentRepository repo, bool isDev)
    {
        try
        {
            var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
            return desactivado
                ? Results.NoContent()
                : Results.NotFound(new { mensaje = $"No se encontró el departamento activo con ID '{id}'." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
