namespace Backend.Services;

internal interface IDashboardService
{
    /// <summary>
    /// Construye el resumen completo del panel administrativo (indicadores, distribuciones,
    /// tablas de actividad reciente y alertas). Devuelve 200 con el objeto o un error mapeado.
    /// </summary>
    Task<IResult> ObtenerResumenAsync(bool isDev);
}
