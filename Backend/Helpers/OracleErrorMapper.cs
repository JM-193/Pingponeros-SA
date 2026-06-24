// OracleErrorMapper.cs
using Oracle.ManagedDataAccess.Client;

namespace Backend.Helpers;

/// <summary>
/// Punto único de traducción de errores de Oracle a respuestas HTTP consistentes.
/// Convierte un <see cref="OracleException"/> en un mensaje en español apto para el
/// usuario y en un código de estado HTTP acorde a la causa del error. Nunca expone
/// el texto crudo "ORA-xxxxx" al cliente, salvo en modo desarrollo.
/// </summary>
internal static class OracleErrorMapper
{
    /// <summary>
    /// Traduce un número de error de Oracle a un mensaje en español para el usuario.
    /// </summary>
    public static string Traducir(int numero) => numero switch
    {
        1 => "El registro ya existe en el sistema.",
        2289 => "Error de configuración interna: objeto de base de datos no encontrado.",
        2291 => "Operación rechazada: referencia a un registro que no existe.",
        2292 => "No se puede eliminar: el registro tiene datos relacionados.",
        1400 => "Hay campos obligatorios sin valor.",
        1407 => "Hay campos obligatorios sin valor.",
        1438 => "El valor ingresado es demasiado grande para el campo.",
        12541 => "No se pudo conectar a la base de datos. Intente más tarde.",
        12170 => "La conexión a la base de datos expiró. Intente más tarde.",
        1017 => "Error de autenticación con la base de datos.",
        _ => "No se pudo completar la operación. Intente nuevamente.",
    };

    /// <summary>
    /// Asocia un número de error de Oracle al código de estado HTTP que mejor
    /// describe la causa (conflicto, datos inválidos, servicio no disponible, etc.).
    /// </summary>
    public static int MapToStatus(int numero) => numero switch
    {
        1 => StatusCodes.Status409Conflict,
        2291 => StatusCodes.Status409Conflict,
        2292 => StatusCodes.Status409Conflict,
        1400 => StatusCodes.Status400BadRequest,
        1407 => StatusCodes.Status400BadRequest,
        1438 => StatusCodes.Status400BadRequest,
        12541 => StatusCodes.Status503ServiceUnavailable,
        12170 => StatusCodes.Status503ServiceUnavailable,
        _ => StatusCodes.Status500InternalServerError,
    };

    /// <summary>
    /// Construye el <see cref="IResult"/> de error para un <see cref="OracleException"/>.
    /// El cuerpo siempre usa el campo <c>mensaje</c> que el frontend ya consume.
    /// En desarrollo se incluye el detalle "[ORA-xxxxx]" para depuración.
    /// </summary>
    public static IResult ToResult(OracleException ex, bool isDev)
    {
        // Errores de usuario definidos con RAISE_APPLICATION_ERROR (-20000 a -20999)
        if (ex.Number is >= 20000 and <= 20999)
        {
            var linea = ex.Message.Split('\n')[0];
            // ODP.NET formatea la primera línea como "ORA-20001: <mensaje>"
            var separador = linea.IndexOf(": ", StringComparison.Ordinal);
            var mensajeUsuario = separador >= 0 ? linea[(separador + 2)..].Trim() : linea.Trim();
            return Results.Conflict(new { mensaje = mensajeUsuario });
        }

        var mensaje = isDev
            ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
            : Traducir(ex.Number);
        return Results.Json(new { mensaje }, statusCode: MapToStatus(ex.Number));
    }
}
