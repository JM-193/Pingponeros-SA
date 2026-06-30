using System.Globalization;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Services;

/// <summary>
/// Orquesta la construcción del panel administrativo: consulta los conteos y las series, deriva
/// los valores calculados (plazas disponibles, plazas sin asignar) y normaliza la serie de
/// asignaciones a 12 meses continuos para que el gráfico tenga un eje temporal sin huecos.
/// </summary>
internal sealed class DashboardService : IDashboardService
{
    private const int FilasRecientes = 5;
    private const int MesesPeriodo = 12;

    private readonly IDashboardRepository _dashboard;

    public DashboardService(IDashboardRepository dashboard) => _dashboard = dashboard;

    public async Task<IResult> ObtenerResumenAsync(bool isDev)
    {
        try
        {
            // Las consultas comparten la misma conexión con ámbito (scoped), por lo que se ejecutan
            // de forma secuencial (cada repositorio abre y cierra la conexión por llamada).
            var conteos = await _dashboard.ObtenerConteosAsync().ConfigureAwait(false);
            var plazasPorArea = await _dashboard.ObtenerPlazasPorAreaAsync().ConfigureAwait(false);
            var asignaciones = await _dashboard.ObtenerAsignacionesPorPeriodoAsync().ConfigureAwait(false);
            var ultimasPlazas = await _dashboard.ObtenerUltimasPlazasAsignadasAsync(FilasRecientes).ConfigureAwait(false);
            var declaraciones = await _dashboard.ObtenerDeclaracionesRecientesAsync(FilasRecientes).ConfigureAwait(false);

            var plazasDisponibles = Math.Max(0, conteos.TotalPlazas - conteos.PlazasAsignadas);

            var resumen = new DashboardResumen
            {
                Indicadores = new DashboardIndicadores
                {
                    TotalUsuarios = conteos.TotalUsuarios,
                    UsuariosActivos = conteos.UsuariosActivos,
                    TotalPlazas = conteos.TotalPlazas,
                    PlazasAsignadas = conteos.PlazasAsignadas,
                    PlazasDisponibles = plazasDisponibles,
                    DeclaracionesCompletadas = conteos.DeclaracionesCompletadas,
                    DeclaracionesPendientes = conteos.DeclaracionesPendientes,
                },
                Alertas = new DashboardAlertas
                {
                    DeclaracionesPendientes = conteos.DeclaracionesPendientes,
                    ContrasenasPorExpirar = conteos.ContrasenasPorExpirar,
                    UsuariosInactivos = conteos.UsuariosInactivos,
                    PlazasSinAsignar = plazasDisponibles,
                },
                UsuariosPorRol = new DashboardUsuariosPorRol
                {
                    Administradores = conteos.Administradores,
                    Usuarios = conteos.UsuariosRol,
                },
                EstadoDeclaraciones = new DashboardEstadoDeclaraciones
                {
                    Completadas = conteos.DeclaracionesCompletadas,
                    Pendientes = conteos.DeclaracionesPendientes,
                },
                PlazasPorArea = plazasPorArea,
                AsignacionesPorPeriodo = RellenarUltimosMeses(asignaciones),
                UltimasPlazasAsignadas = ultimasPlazas,
                DeclaracionesRecientes = declaraciones,
            };

            return Results.Ok(resumen);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // Convierte la serie dispersa devuelta por la base de datos en 12 meses continuos terminando
    // en el mes actual, rellenando con 0 los meses sin asignaciones.
    private static List<ConteoEtiqueta> RellenarUltimosMeses(List<ConteoEtiqueta> datos)
    {
        var porMes = datos.ToDictionary(d => d.Etiqueta, d => d.Cantidad, StringComparer.Ordinal);
        var inicio = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1)
            .AddMonths(-(MesesPeriodo - 1));

        var serie = new List<ConteoEtiqueta>(MesesPeriodo);
        for (var i = 0; i < MesesPeriodo; i++)
        {
            var etiqueta = inicio.AddMonths(i).ToString("yyyy-MM", CultureInfo.InvariantCulture);
            serie.Add(new ConteoEtiqueta
            {
                Etiqueta = etiqueta,
                Cantidad = porMes.GetValueOrDefault(etiqueta, 0),
            });
        }
        return serie;
    }
}
