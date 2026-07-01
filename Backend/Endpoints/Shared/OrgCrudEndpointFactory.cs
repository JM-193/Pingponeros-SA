// OrgCrudEndpointFactory.cs
using System.Diagnostics.CodeAnalysis;
using Backend.Helpers;
using Oracle.ManagedDataAccess.Client;
using static Backend.Endpoints.Shared.CrudEndpointHelpers;

namespace Backend.Endpoints.Shared;

/// <summary>
/// Mensajes HTTP de un recurso CRUD. Cada entidad provee el texto con la concordancia de
/// género correcta ("creada"/"creado", "el área"/"la sección", etc.), de modo que la fábrica
/// genérica no necesita conocer el sustantivo concreto.
/// </summary>
internal sealed class CrudMessages
{
    public required Func<string, string> Conflicto { get; init; }
    public required Func<string, string> Creado { get; init; }
    public required Func<string, string> Actualizado { get; init; }
    public required Func<string, string> NoEncontradoPorNombre { get; init; }
    public required Func<int, string> NoEncontradoActivoPorId { get; init; }
}

/// <summary>
/// Describe un recurso CRUD "por nombre" (listar, crear, obtener por nombre, actualizar y
/// borrado lógico) de forma agnóstica a la entidad. Reúne los delegados del repositorio, del
/// DTO y de la entidad para que <see cref="OrgCrudEndpointFactory"/> implemente el flujo
/// HTTP una sola vez. Se usan delegados (en lugar de interfaces compartidas) para no acoplar
/// los modelos ni los repositorios, que difieren en nombres ("ObtenerTodas/os") y en campos.
/// </summary>
[SuppressMessage("Major Code Smell",
    "S2436:Types and methods should not have too many generic parameters",
    Justification =
        "Los tres parámetros (TRepo, TEntity, TCreateDto) aportan tipado real y no " +
        "redundante: TCreateDto es el cuerpo enlazado por el model binder, TEntity es el " +
        "modelo de dominio y TRepo es el repositorio inyectado por petición. Se usan " +
        "delegados en lugar de una interfaz de repositorio compartida porque los " +
        "repositorios divergen en el nombre del método de listado (ObtenerTodas/os); " +
        "unificarlo rompería la concordancia de género y generaría churn en pruebas/DI.")]
internal sealed class OrgCrudEndpoints<TRepo, TEntity, TCreateDto>
    where TRepo : notnull
{
    /// <summary>Prefijo de ruta del grupo, p. ej. "/areas".</summary>
    public required string RouteGroup { get; init; }
    public required CrudMessages Messages { get; init; }

    /// <summary>Valida el DTO; devuelve null si es válido o el primer error encontrado.</summary>
    public required Func<TCreateDto, string?> Validar { get; init; }
    /// <summary>Nombre declarado en el DTO (para conflictos y búsquedas de duplicados).</summary>
    public required Func<TCreateDto, string> NombreDto { get; init; }
    /// <summary>Construye la entidad a partir del DTO (normalización incluida).</summary>
    public required Func<TCreateDto, TEntity> CrearEntidad { get; init; }
    /// <summary>Nombre ya normalizado de la entidad (para los mensajes de éxito).</summary>
    public required Func<TEntity, string> NombreEntidad { get; init; }

    public required Func<TRepo, Task<List<TEntity>>> ObtenerTodos { get; init; }
    public required Func<TRepo, string, Task<TEntity?>> ObtenerPorNombre { get; init; }
    public required Func<TRepo, string, Task<bool>> ExisteNombre { get; init; }
    public required Func<TRepo, TEntity, Task<int>> Insertar { get; init; }
    public required Func<TRepo, string, TEntity, Task<bool>> Actualizar { get; init; }
    public required Func<TRepo, int, Task<bool>> Desactivar { get; init; }
}

/// <summary>
/// Fábrica que registra el conjunto estándar de rutas CRUD "por nombre" descrito por un
/// <see cref="OrgCrudEndpoints{TRepo,TEntity,TCreateDto}"/>. Centraliza el flujo HTTP
/// (validación, conflicto de nombre, mapeo de errores Oracle y respuestas uniformes) que antes
/// se repetía en cada archivo de endpoints.
/// </summary>
internal static class OrgCrudEndpointFactory
{
    public static void MapOrgCrudEndpoints<TRepo, TEntity, TCreateDto>(
        this IEndpointRouteBuilder app,
        OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud,
        bool isDev)
        where TRepo : notnull
    {
        var group = app.MapGroup(crud.RouteGroup);

        group.MapGet("/", (TRepo repo) => ListarAsync(repo, crud, isDev));
        group.MapPost("/", (TCreateDto dto, TRepo repo) => CrearAsync(dto, repo, crud, isDev));
        group.MapGet("/{nombre}", (string nombre, TRepo repo) => ObtenerPorNombreAsync(nombre, repo, crud, isDev));
        group.MapPut("/{nombre}", (string nombre, TCreateDto dto, TRepo repo) => ActualizarAsync(nombre, dto, repo, crud, isDev));
        group.MapDelete("/{id:int}", (int id, TRepo repo) => DesactivarAsync(id, repo, crud, isDev));
    }

    private static async Task<IResult> ListarAsync<TRepo, TEntity, TCreateDto>(
        TRepo repo, OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud, bool isDev)
        where TRepo : notnull
    {
        try
        {
            var lista = await crud.ObtenerTodos(repo).ConfigureAwait(false);
            return Results.Ok(lista);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> CrearAsync<TRepo, TEntity, TCreateDto>(
        TCreateDto dto, TRepo repo, OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud, bool isDev)
        where TRepo : notnull
    {
        if (crud.Validar(dto) is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDto = crud.NombreDto(dto);

        try
        {
            var existe = await crud.ExisteNombre(repo, nombreDto).ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = crud.Messages.Conflicto(nombreDto) });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }

        var entidad = crud.CrearEntidad(dto);

        try
        {
            var id = await crud.Insertar(repo, entidad).ConfigureAwait(false);
            return Results.Created($"{crud.RouteGroup}/{id}", new { mensaje = crud.Messages.Creado(crud.NombreEntidad(entidad)) });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ObtenerPorNombreAsync<TRepo, TEntity, TCreateDto>(
        string nombre, TRepo repo, OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud, bool isDev)
        where TRepo : notnull
    {
        try
        {
            var entidad = await crud.ObtenerPorNombre(repo, Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
            return entidad is null
                ? Results.NotFound(new { mensaje = crud.Messages.NoEncontradoPorNombre(nombre) })
                : Results.Ok(entidad);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private static async Task<IResult> ActualizarAsync<TRepo, TEntity, TCreateDto>(
        string nombre, TCreateDto dto, TRepo repo, OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud, bool isDev)
        where TRepo : notnull
    {
        if (crud.Validar(dto) is { } error)
            return Results.BadRequest(new { mensaje = error });

        var nombreDto = crud.NombreDto(dto);
        var nombreDescodificado = Uri.UnescapeDataString(nombre);

        var conflicto = await VerificarConflictoNombreAsync(
            () => crud.ExisteNombre(repo, nombreDto),
            nombreDto,
            nombreDescodificado,
            crud.Messages.Conflicto(nombreDto),
            isDev).ConfigureAwait(false);
        if (conflicto is not null)
            return conflicto;

        var entidad = crud.CrearEntidad(dto);

        return await EjecutarActualizacionAsync(
            () => crud.Actualizar(repo, nombreDescodificado, entidad),
            crud.Messages.Actualizado(crud.NombreEntidad(entidad)),
            crud.Messages.NoEncontradoPorNombre(nombre),
            isDev).ConfigureAwait(false);
    }

    private static async Task<IResult> DesactivarAsync<TRepo, TEntity, TCreateDto>(
        int id, TRepo repo, OrgCrudEndpoints<TRepo, TEntity, TCreateDto> crud, bool isDev)
        where TRepo : notnull
    {
        try
        {
            var desactivado = await crud.Desactivar(repo, id).ConfigureAwait(false);
            return desactivado
                ? Results.NoContent()
                : Results.NotFound(new { mensaje = crud.Messages.NoEncontradoActivoPorId(id) });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
