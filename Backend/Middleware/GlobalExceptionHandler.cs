// GlobalExceptionHandler.cs
using Backend.Helpers;
using Microsoft.AspNetCore.Diagnostics;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Middleware;

/// <summary>
/// Red de seguridad para cualquier excepción que escape de los manejadores de ruta.
/// Las rutas siguen atrapando sus propios casos de negocio (400/401/403/404/409);
/// este manejador solo actúa cuando algo no fue controlado, garantizando que el
/// cliente nunca reciba un stack trace ni el texto crudo de Oracle.
/// </summary>
internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(IHostEnvironment env) => _env = env;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var isDev = _env.IsDevelopment();

        if (exception is OracleException oracleEx)
        {
            httpContext.Response.StatusCode = OracleErrorMapper.MapToStatus(oracleEx.Number);
            var mensaje = isDev
                ? $"[ORA-{oracleEx.Number}] {oracleEx.Message.Split('\n')[0]}"
                : OracleErrorMapper.Traducir(oracleEx.Number);
            await httpContext.Response
                .WriteAsJsonAsync(new { mensaje }, cancellationToken)
                .ConfigureAwait(false);
            return true;
        }

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var generico = isDev
            ? exception.Message
            : "No se pudo completar la operación. Intente nuevamente.";
        await httpContext.Response
            .WriteAsJsonAsync(new { mensaje = generico }, cancellationToken)
            .ConfigureAwait(false);
        return true;
    }
}
