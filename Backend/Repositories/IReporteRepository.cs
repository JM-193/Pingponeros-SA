using Backend.Models;

namespace Backend.Repositories;

/// <summary>
/// Lecturas (solo SELECT) que alimentan los reportes administrativos. Reutiliza las tablas
/// existentes; no crea objetos de base de datos nuevos.
/// </summary>
internal interface IReporteRepository
{
    /// <summary>Funcionarios con su plaza/puesto vigente (si la tienen), ordenados por apellido.</summary>
    Task<List<ReporteFuncionarioFila>> ObtenerFuncionariosAsync();

    /// <summary>Todas las declaraciones juradas con titular, plaza, cargo, fecha y estado.</summary>
    Task<List<ReporteDeclaracionFila>> ObtenerDeclaracionesAsync();

    /// <summary>
    /// Horas semanales registradas por declaración completa (agregadas en C# con
    /// <see cref="Backend.Helpers.WorkloadCalculator"/>).
    /// </summary>
    Task<List<ReporteHorasFila>> ObtenerHorasAsync();
}
