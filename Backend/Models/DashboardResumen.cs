namespace Backend.Models;

/// <summary>
/// Carga única que alimenta el panel administrativo: indicadores, distribuciones para gráficos,
/// tablas de actividad reciente y conteos de alertas. Se entrega en una sola respuesta para
/// minimizar las llamadas al backend desde el frontend.
/// </summary>
internal sealed class DashboardResumen
{
    public DashboardIndicadores Indicadores { get; set; } = new();
    public DashboardAlertas Alertas { get; set; } = new();
    public DashboardUsuariosPorRol UsuariosPorRol { get; set; } = new();
    public DashboardEstadoDeclaraciones EstadoDeclaraciones { get; set; } = new();

    /// <summary>Cantidad de plazas agrupadas por área (una entrada por área).</summary>
    public List<ConteoEtiqueta> PlazasPorArea { get; set; } = [];

    /// <summary>Plazas asignadas por mes (YYYY-MM) según la fecha de inicio, últimos 12 meses.</summary>
    public List<ConteoEtiqueta> AsignacionesPorPeriodo { get; set; } = [];

    public List<DashboardPlazaAsignada> UltimasPlazasAsignadas { get; set; } = [];
    public List<DashboardDeclaracionReciente> DeclaracionesRecientes { get; set; } = [];
}

/// <summary>Tarjetas numéricas principales del panel.</summary>
internal sealed class DashboardIndicadores
{
    public int TotalUsuarios { get; set; }
    public int UsuariosActivos { get; set; }
    public int TotalPlazas { get; set; }
    public int PlazasAsignadas { get; set; }
    public int PlazasDisponibles { get; set; }
    public int DeclaracionesCompletadas { get; set; }
    public int DeclaracionesPendientes { get; set; }
}

/// <summary>Conteos que disparan las notificaciones visuales del panel.</summary>
internal sealed class DashboardAlertas
{
    public int DeclaracionesPendientes { get; set; }
    public int ContrasenasPorExpirar { get; set; }
    public int UsuariosInactivos { get; set; }
    public int PlazasSinAsignar { get; set; }
}

/// <summary>Distribución de usuarios por rol (administradores vs. funcionarios).</summary>
internal sealed class DashboardUsuariosPorRol
{
    public int Administradores { get; set; }
    public int Usuarios { get; set; }
}

/// <summary>Estado de las declaraciones juradas (completas vs. pendientes/borrador).</summary>
internal sealed class DashboardEstadoDeclaraciones
{
    public int Completadas { get; set; }
    public int Pendientes { get; set; }
}

/// <summary>Par etiqueta/valor genérico para las series de los gráficos.</summary>
internal sealed class ConteoEtiqueta
{
    public string Etiqueta { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

/// <summary>Fila de la tabla "Últimas plazas asignadas".</summary>
internal sealed class DashboardPlazaAsignada
{
    public ulong NumeroPlaza { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string Puesto { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
}

/// <summary>Fila de la tabla "Declaraciones recientes".</summary>
internal sealed class DashboardDeclaracionReciente
{
    public int Id { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public ulong NumeroPlaza { get; set; }
    public DateTime FechaDeclaracion { get; set; }
    /// <summary>0 = Pendiente/Borrador, 1 = Completa.</summary>
    public int Completa { get; set; }
}

/// <summary>
/// Conteos escalares leídos en una sola consulta (proyección interna del repositorio).
/// El servicio los reparte entre <see cref="DashboardIndicadores"/>, <see cref="DashboardAlertas"/>,
/// <see cref="DashboardUsuariosPorRol"/> y <see cref="DashboardEstadoDeclaraciones"/>.
/// </summary>
internal sealed class DashboardConteos
{
    public int TotalUsuarios { get; set; }
    public int UsuariosActivos { get; set; }
    public int UsuariosInactivos { get; set; }
    public int Administradores { get; set; }
    public int UsuariosRol { get; set; }
    public int TotalPlazas { get; set; }
    public int PlazasAsignadas { get; set; }
    public int DeclaracionesCompletadas { get; set; }
    public int DeclaracionesPendientes { get; set; }
    public int ContrasenasPorExpirar { get; set; }
}
