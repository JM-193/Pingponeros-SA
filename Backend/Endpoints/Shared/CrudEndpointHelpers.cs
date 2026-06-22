// CrudEndpointHelpers.cs
using Backend.Helpers;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Endpoints.Shared;

/// <summary>
/// Helpers compartidos del flujo HTTP de actualización CRUD (verificación de conflicto de
/// nombre y ejecución de la actualización). No contienen reglas de negocio ni acceso a
/// datos directo; solo coordinan delegados de repositorio con respuestas HTTP uniformes.
/// </summary>
internal static class CrudEndpointHelpers
{
    /// <summary>
    /// Verifica si ya existe otra entidad con el mismo nombre cuando éste cambia.
    /// Devuelve un IResult de conflicto o error, o null si no hay problema.
    /// </summary>
    public static async Task<IResult?> VerificarConflictoNombreAsync(
        Func<Task<bool>> existeAsync,
        string nombreNuevo,
        string nombreDescodificado,
        string mensajeConflicto,
        bool isDev)
    {
        if (nombreNuevo.Trim().Equals(nombreDescodificado, StringComparison.OrdinalIgnoreCase))
            return null;

        try
        {
            var existe = await existeAsync().ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = mensajeConflicto });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }

        return null;
    }

    /// <summary>
    /// Ejecuta la actualización delegada y devuelve Ok, NotFound o 500 según el resultado.
    /// </summary>
    public static async Task<IResult> EjecutarActualizacionAsync(
        Func<Task<bool>> actualizarAsync,
        string mensajeOk,
        string mensajeNoEncontrado,
        bool isDev)
    {
        try
        {
            var actualizado = await actualizarAsync().ConfigureAwait(false);
            return actualizado
                ? Results.Ok(new { mensaje = mensajeOk })
                : Results.NotFound(new { mensaje = mensajeNoEncontrado });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
