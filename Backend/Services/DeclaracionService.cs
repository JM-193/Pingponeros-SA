using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Services;

/// <summary>
/// Orquesta el flujo de declaraciones juradas: regla de declaración única activa, validación de
/// pertenencia de la plaza, guardado del borrador, finalización y cancelación.
/// </summary>
internal sealed class DeclaracionService : IDeclaracionService
{
    private readonly IDeclaracionRepository _declaraciones;
    private readonly IPositionAssignmentRepository _asignaciones;

    public DeclaracionService(IDeclaracionRepository declaraciones, IPositionAssignmentRepository asignaciones)
    {
        _declaraciones = declaraciones;
        _asignaciones = asignaciones;
    }

    public async Task<IResult> CrearAsync(string correo, CreateDeclaracionDto dto, bool isDev)
    {
        ArgumentNullException.ThrowIfNull(dto);

        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            if (await _declaraciones.ExisteActivaPorUsuarioAsync(correo).ConfigureAwait(false))
                return Results.Conflict(new { mensaje = "Ya tiene una declaración activa. Complétela o cancélela antes de crear otra." });

            var asignaciones = await _asignaciones.ObtenerActivasPorUsuarioAsync(correo).ConfigureAwait(false);
            if (!asignaciones.Exists(a => a.NumeroPlaza == dto.NumeroPlaza))
                return Results.BadRequest(new { mensaje = "La plaza seleccionada no está asignada a su usuario." });

            var id = await _declaraciones.CrearAsync(dto.NumeroPlaza, correo).ConfigureAwait(false);
            return Results.Created($"/declaraciones/{id}", new { id, mensaje = "Borrador de declaración creado." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> GuardarAsync(int id, GuardarDeclaracionDto dto, bool isDev)
    {
        ArgumentNullException.ThrowIfNull(dto);

        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        try
        {
            var cabecera = await _declaraciones.ObtenerCabeceraAsync(id).ConfigureAwait(false);
            if (cabecera is null)
                return Results.NotFound(new { mensaje = "No se encontró la declaración." });
            if (cabecera.Completa == 1)
                return Results.Conflict(new { mensaje = "La declaración ya fue completada y no puede modificarse." });

            await _declaraciones.GuardarBorradorAsync(id, MapearDetalle(dto)).ConfigureAwait(false);
            return Results.Ok(new { mensaje = "Borrador guardado." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> CompletarAsync(int id, bool isDev)
    {
        try
        {
            var cabecera = await _declaraciones.ObtenerCabeceraAsync(id).ConfigureAwait(false);
            if (cabecera is null)
                return Results.NotFound(new { mensaje = "No se encontró la declaración." });
            if (cabecera.Completa == 1)
                return Results.Conflict(new { mensaje = "La declaración ya está completa." });

            var detalle = await _declaraciones.ObtenerDetalleAsync(id).ConfigureAwait(false);
            if (detalle!.Horario is null)
                return Results.BadRequest(new { mensaje = "Debe registrar el horario laboral antes de finalizar." });
            if (detalle.Actividades.Count == 0)
                return Results.BadRequest(new { mensaje = "Debe registrar al menos una función antes de finalizar." });

            await _declaraciones.CompletarAsync(id).ConfigureAwait(false);
            return Results.Ok(new { mensaje = "Declaración completada." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> CancelarAsync(int id, bool isDev)
    {
        try
        {
            var eliminado = await _declaraciones.CancelarAsync(id).ConfigureAwait(false);
            return eliminado
                ? Results.Ok(new { mensaje = "Declaración cancelada." })
                : Results.NotFound(new { mensaje = "No se encontró una declaración activa para cancelar." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> ObtenerActivaAsync(string correo, bool isDev)
    {
        try
        {
            var id = await _declaraciones.ObtenerIdActivaPorUsuarioAsync(correo).ConfigureAwait(false);
            if (id is null)
                return Results.NoContent();

            var detalle = await _declaraciones.ObtenerDetalleAsync(id.Value).ConfigureAwait(false);
            return Results.Ok(detalle);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> ObtenerDetalleAsync(int id, bool isDev)
    {
        try
        {
            var detalle = await _declaraciones.ObtenerDetalleAsync(id).ConfigureAwait(false);
            return detalle is null
                ? Results.NotFound(new { mensaje = "No se encontró la declaración." })
                : Results.Ok(detalle);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> ObtenerHistorialAsync(string correo, bool isDev)
    {
        try
        {
            var historial = await _declaraciones.ObtenerCompletasPorUsuarioAsync(correo).ConfigureAwait(false);
            return Results.Ok(historial);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> ObtenerAutocompletadoAsync(string correo, bool isDev)
    {
        try
        {
            var datos = await _declaraciones.ObtenerDatosAutocompletadoAsync(correo).ConfigureAwait(false);
            return Results.Ok(datos);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // Construye el agregado a persistir a partir del payload (ya validado por GuardarDeclaracionDto.Validar).
    private static DeclaracionDetalle MapearDetalle(GuardarDeclaracionDto dto)
    {
        var detalle = new DeclaracionDetalle();

        if (dto.Horario is { } h)
        {
            detalle.Horario = new HorarioLaboral
            {
                HoraEntrada = h.HoraEntrada!.Trim(),
                HoraSalida = h.HoraSalida!.Trim(),
                JornadaLaboral = h.JornadaLaboral!.Trim(),
            };
        }

        if (dto.TiempoDescanso is { } tiempo)
            detalle.Descanso = new Descanso { Tiempo = tiempo };

        if (dto.HoraExtra is { } he)
        {
            detalle.HoraExtra = new HoraExtra
            {
                TiempoAdicional = he.TiempoAdicional!.Value,
                Justificacion = he.Justificacion!.Trim(),
                ConocimientoJefatura = GuardarDeclaracionDto.ToFlag(he.ConocimientoJefatura),
            };
        }

        if (dto.PermisoAusencia is { } pa)
        {
            detalle.PermisoAusencia = new PermisoAusencia
            {
                Dias = pa.Dias!.Value,
                Justificacion = pa.Justificacion!.Trim(),
                ConocimientoJefatura = GuardarDeclaracionDto.ToFlag(pa.ConocimientoJefatura),
            };
        }

        if (dto.Actividades is { } actividades)
        {
            detalle.Actividades = actividades.Select(a => new Actividad
            {
                IdFuncion = a.IdFuncion,
                IdFuncionPropia = a.IdFuncionPropia,
                TipoFuncion = a.TipoFuncion!.Trim(),
                Periodicidad = a.Periodicidad!.Trim(),
                VecesRealizadas = a.VecesRealizadas,
                Duracion = a.Duracion,
            }).ToList();
        }

        return detalle;
    }
}
