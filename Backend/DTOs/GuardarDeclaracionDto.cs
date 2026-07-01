using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using Backend.Validators;

namespace Backend.DTOs;

/// <summary>
/// Payload completo para guardar el borrador de una declaración (sustituye sus hijos). Todos los
/// bloques son opcionales porque un borrador puede guardarse parcialmente; cuando un bloque viene
/// presente se validan sus reglas para evitar violar las restricciones de la base de datos.
/// </summary>
[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record GuardarDeclaracionDto(
    HorarioInputDto? Horario,
    decimal? TiempoDescanso,
    HoraExtraInputDto? HoraExtra,
    PermisoAusenciaInputDto? PermisoAusencia,
    IReadOnlyList<ActividadInputDto>? Actividades)
{
    internal static readonly string[] TiposFuncionOficial =
        ["Propia de mi puesto", "De otro puesto", "De apoyo ocasional"];
    internal const string TipoFuncionPropia = "Definida por mí";

    private static readonly Regex HoraRegex =
            new(
                "^[0-2][0-9]:[0-5][0-9]$",
                RegexOptions.CultureInvariant,
                TimeSpan.FromMilliseconds(100));

    // Lista blanca de texto libre para las justificaciones: bloquea los caracteres usados en
    // inyecciones SQL (defensa en profundidad; los repositorios ya usan consultas parametrizadas).
    private static readonly Regex TextoSeguroRegex =
            new(
                ValidationPatterns.TextoSeguro,
                RegexOptions.CultureInvariant,
                TimeSpan.FromMilliseconds(100));

    public string? Validar()
    {
        if (ValidarHorario() is { } error)
            return error;

        if (TiempoDescanso is < 0)
            return "El tiempo de descanso no puede ser negativo.";

        if (ValidarHoraExtra() is { } horaExtraError)
            return horaExtraError;

        if (ValidarPermisoAusencia() is { } permisoError)
            return permisoError;

        if (ValidarActividades() is { } actividadError)
            return actividadError;

        return null;
    }

    private string? ValidarHorario()
    {
        if (Horario is not { } h)
            return null;

        if (string.IsNullOrWhiteSpace(h.HoraEntrada) || !HoraRegex.IsMatch(h.HoraEntrada))
            return "La hora de entrada debe tener el formato HH:MM.";

        if (string.IsNullOrWhiteSpace(h.HoraSalida) || !HoraRegex.IsMatch(h.HoraSalida))
            return "La hora de salida debe tener el formato HH:MM.";

        if (string.IsNullOrWhiteSpace(h.JornadaLaboral) || h.JornadaLaboral.Length > 25)
            return "La jornada laboral es obligatoria.";

        return null;
    }

    private string? ValidarHoraExtra()
    {
        if (HoraExtra is not { } he)
            return null;

        if (he.TiempoAdicional is null or < 0)
            return "El tiempo adicional debe ser un valor positivo.";

        if (string.IsNullOrWhiteSpace(he.Justificacion))
            return "Debe justificar el tiempo adicional fuera de su jornada.";

        if (!TextoSeguroRegex.IsMatch(he.Justificacion))
            return "La justificación del tiempo adicional contiene caracteres no permitidos.";

        return null;
    }

    private string? ValidarPermisoAusencia()
    {
        if (PermisoAusencia is not { } pa)
            return null;

        if (pa.Dias is null or < 0)
            return "Los días de permiso o licencia deben ser un valor positivo.";

        if (string.IsNullOrWhiteSpace(pa.Justificacion))
            return "Debe indicar cuál es el permiso o licencia.";

        if (!TextoSeguroRegex.IsMatch(pa.Justificacion))
            return "La justificación del permiso o licencia contiene caracteres no permitidos.";

        return null;
    }

    private string? ValidarActividades()
    {
        if (Actividades is not { } actividades)
            return null;

        foreach (var actividad in actividades)
        {
            if (ValidarActividad(actividad) is { } error)
                return error;
        }

        return null;
    }

    private static string? ValidarActividad(ActividadInputDto a)
    {
        if (string.IsNullOrWhiteSpace(a.TipoFuncion))
            return "Cada actividad debe indicar su tipo de función.";

        var esPropia = a.TipoFuncion == TipoFuncionPropia;
        var esOficial = Array.Exists(TiposFuncionOficial, t => t == a.TipoFuncion);
        if (!esPropia && !esOficial)
            return $"Tipo de función no válido: «{a.TipoFuncion}».";

        if (esOficial && (a.IdFuncion is null or <= 0 || a.IdFuncionPropia is not null))
            return "La actividad oficial debe referenciar una función válida del catálogo.";
        if (esPropia && (a.IdFuncionPropia is null or <= 0 || a.IdFuncion is not null))
            return "La actividad «Definida por mí» debe referenciar una función propia válida.";

        if (string.IsNullOrWhiteSpace(a.Periodicidad) || a.Periodicidad.Length > 15)
            return "Cada actividad debe indicar su periodicidad.";
        if (a.VecesRealizadas < 1)
            return "La cantidad de veces realizada debe ser al menos 1.";
        if (a.Duracion < 1)
            return "La duración de la actividad debe ser al menos 1 minuto.";

        return null;
    }

    /// <summary>Convierte un booleano opcional del frontend a la representación 0/1 de la base de datos.</summary>
    public static int ToFlag(bool? valor) => valor == true ? 1 : 0;
}

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record HorarioInputDto(string? HoraEntrada, string? HoraSalida, string? JornadaLaboral);

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record HoraExtraInputDto(decimal? TiempoAdicional, string? Justificacion, bool? ConocimientoJefatura);

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record PermisoAusenciaInputDto(decimal? Dias, string? Justificacion, bool? ConocimientoJefatura);

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record ActividadInputDto(
    int? IdFuncion,
    int? IdFuncionPropia,
    string? TipoFuncion,
    string? Periodicidad,
    int VecesRealizadas,
    int Duracion);
