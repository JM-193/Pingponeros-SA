using Backend.Models;

namespace Backend.Repositories;

/// <summary>
/// Lecturas (solo SELECT) que alimentan el panel administrativo. Reutiliza las tablas existentes
/// y no crea objetos de base de datos nuevos. Cada método ejecuta una consulta independiente a
/// través de <see cref="IQueryExecutor"/>.
/// </summary>
internal interface IDashboardRepository
{
    /// <summary>Conteos escalares (usuarios, plazas, declaraciones, alertas) en una sola consulta.</summary>
    Task<DashboardConteos> ObtenerConteosAsync();

    /// <summary>Cantidad de plazas por área, de mayor a menor.</summary>
    Task<List<ConteoEtiqueta>> ObtenerPlazasPorAreaAsync();

    /// <summary>Plazas asignadas por mes (YYYY-MM) según la fecha de inicio, solo los meses con datos.</summary>
    Task<List<ConteoEtiqueta>> ObtenerAsignacionesPorPeriodoAsync();

    /// <summary>Las plazas asignadas más recientes (por fecha de inicio).</summary>
    Task<List<DashboardPlazaAsignada>> ObtenerUltimasPlazasAsignadasAsync(int limite);

    /// <summary>Las declaraciones juradas más recientes (por fecha de declaración).</summary>
    Task<List<DashboardDeclaracionReciente>> ObtenerDeclaracionesRecientesAsync(int limite);
}
