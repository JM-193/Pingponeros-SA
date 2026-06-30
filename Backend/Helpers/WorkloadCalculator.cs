using System.Globalization;
using Backend.Models;

namespace Backend.Helpers;

/// <summary>
/// Cálculo de carga de trabajo, equivalente en el backend a <c>utils/workloadCalc.js</c> y
/// <c>constants/declaracion.js</c> del frontend. Es la fuente única para los reportes (PDF/Excel):
/// minutos semanales por actividad, total y formateo "Xh Ymin", de modo que los documentos
/// generados coincidan con lo que el usuario ve en pantalla.
/// </summary>
internal static class WorkloadCalculator
{
    // Factor de conversión a "veces por semana" (6 días laborales/semana, 4.33 semanas/mes).
    private static readonly Dictionary<string, double> FactorSemanal = new(StringComparer.Ordinal)
    {
        ["Diario"] = 6,
        ["Semanal"] = 1,
        ["Mensual"] = 1 / 4.33,
        ["Trimestral"] = 1.0 / 13,
        ["Semestral"] = 1.0 / 26,
        ["Anual"] = 1.0 / 52,
    };

    // Horas semanales de cada jornada (base para el chequeo de carga 1x / 1.5x).
    private static readonly Dictionary<string, int> JornadaHoras = new(StringComparer.Ordinal)
    {
        ["Tiempo Completo"] = 48,
        ["Tres Cuartos de Tiempo"] = 36,
        ["Medio Tiempo"] = 24,
        ["Cuarto de Tiempo"] = 12,
    };

    /// <summary>Minutos semanales que consume una actividad: duración (min) × veces × factor de periodicidad.</summary>
    public static double MinutosSemanales(string? periodicidad, int vecesRealizadas, int duracion)
    {
        var factor = periodicidad is not null && FactorSemanal.TryGetValue(periodicidad, out var f) ? f : 0;
        return (double)duracion * vecesRealizadas * factor;
    }

    /// <summary>Suma de los minutos semanales de un conjunto de actividades.</summary>
    public static double TotalMinutosSemanales(IEnumerable<Actividad> actividades)
    {
        ArgumentNullException.ThrowIfNull(actividades);
        return actividades.Sum(a => MinutosSemanales(a.Periodicidad, a.VecesRealizadas, a.Duracion));
    }

    /// <summary>Horas semanales de la jornada indicada, o <c>null</c> si no se reconoce.</summary>
    public static int? HorasJornada(string? jornada)
        => jornada is not null && JornadaHoras.TryGetValue(jornada, out var h) ? h : null;

    /// <summary>Muestra una cantidad de minutos como "X h Y min" (igual que <c>formatearMinutos</c> del frontend).</summary>
    public static string FormatearMinutos(double minutos)
    {
        var total = (int)Math.Round(Math.Max(0, minutos), MidpointRounding.AwayFromZero);
        var h = total / 60;
        var m = total % 60;
        if (h == 0) return $"{m} min";
        if (m == 0) return $"{h} h";
        return $"{h} h {m} min";
    }

    /// <summary>Formatea un entero con cultura invariante (para celdas numéricas de los reportes).</summary>
    public static string Numero(int valor) => valor.ToString(CultureInfo.InvariantCulture);
}
