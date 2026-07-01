using System.Data.Common;
using System.Globalization;
using Backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

/// <summary>
/// Consultas de lectura para el panel administrativo. Sigue el mismo estilo que
/// <see cref="ReporteRepository"/>: SELECT con literales en tiempo de compilación ejecutados
/// a través de <see cref="IQueryExecutor"/>. Todos los conteos escalares se resuelven en una
/// única consulta contra DUAL para reducir el número de viajes a la base de datos.
/// </summary>
internal sealed class DashboardRepository : IDashboardRepository
{
    private const string ColumnEtiqueta = "ETIQUETA";
    private const string ColumnCantidad = "CANTIDAD";
    private const string ColumnNumeroPlaza = "NUMERO_PLAZA";
    private const string ColumnUsuario = "USUARIO";
    private const string ColumnPuesto = "PUESTO";
    private const string ColumnFechaInicio = "FECHA_INICIO";
    private const string ColumnIdDeclaracion = "ID_DECLARACION";
    private const string ColumnFechaDeclaracion = "FECHA_DECLARACION";
    private const string ColumnCompleta = "COMPLETA";

    private const string ColumnTotalUsuarios = "TOTAL_USUARIOS";
    private const string ColumnUsuariosActivos = "USUARIOS_ACTIVOS";
    private const string ColumnUsuariosInactivos = "USUARIOS_INACTIVOS";
    private const string ColumnAdministradores = "ADMINISTRADORES";
    private const string ColumnUsuariosRol = "USUARIOS_ROL";
    private const string ColumnTotalPlazas = "TOTAL_PLAZAS";
    private const string ColumnPlazasAsignadas = "PLAZAS_ASIGNADAS";
    private const string ColumnDeclCompletadas = "DECL_COMPLETADAS";
    private const string ColumnDeclPendientes = "DECL_PENDIENTES";
    private const string ColumnContrasenasPorExpirar = "CONTRASENAS_POR_EXPIRAR";

    private readonly IQueryExecutor _q;

    public DashboardRepository(IQueryExecutor q) => _q = q;

    // ---------------------------------------------------------------- //
    // Conteos escalares (indicadores + alertas) en una sola consulta    //
    // ---------------------------------------------------------------- //
    // Nota: el umbral "próxima a expirar" es de 7 días (SYSDATE + 7); se considera la
    // contraseña vigente (la más reciente por usuario) mediante ROW_NUMBER.
    public async Task<DashboardConteos> ObtenerConteosAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT
                  (SELECT COUNT(*) FROM USUARIOS) AS TOTAL_USUARIOS,
                  (SELECT COUNT(*) FROM USUARIOS WHERE ESTADO = 1) AS USUARIOS_ACTIVOS,
                  (SELECT COUNT(*) FROM USUARIOS WHERE ESTADO = 0) AS USUARIOS_INACTIVOS,
                  (SELECT COUNT(*) FROM USUARIOS WHERE ROL = 1) AS ADMINISTRADORES,
                  (SELECT COUNT(*) FROM USUARIOS WHERE ROL = 0) AS USUARIOS_ROL,
                  (SELECT COUNT(*) FROM PLAZAS) AS TOTAL_PLAZAS,
                  (SELECT COUNT(DISTINCT pu.NUMERO_PLAZA)
                   FROM   PLAZAS_USUARIOS pu
                   WHERE  pu.FECHA_FINAL IS NULL OR pu.FECHA_FINAL > SYSDATE) AS PLAZAS_ASIGNADAS,
                  (SELECT COUNT(*) FROM DECLARACIONES_JURADAS WHERE COMPLETA = 1) AS DECL_COMPLETADAS,
                  (SELECT COUNT(*) FROM DECLARACIONES_JURADAS WHERE COMPLETA = 0) AS DECL_PENDIENTES,
                  (SELECT COUNT(*)
                   FROM (
                       SELECT ROW_NUMBER() OVER (PARTITION BY c.CORREO_INSTITUCIONAL
                                                 ORDER BY c.FECHA_CREACION DESC, c.ID_CONTRASENA DESC) AS RN,
                              c.FECHA_EXPIRACION
                       FROM   CONTRASENAS c
                   ) sub
                   WHERE  sub.RN = 1
                   AND    sub.FECHA_EXPIRACION >= SYSDATE
                   AND    sub.FECHA_EXPIRACION <= SYSDATE + 7) AS CONTRASENAS_POR_EXPIRAR
                FROM DUAL
                """,
                connection)
            { BindByName = true },
            async reader =>
            {
                await reader.ReadAsync().ConfigureAwait(false);
                return new DashboardConteos
                {
                    TotalUsuarios = Entero(reader, ColumnTotalUsuarios),
                    UsuariosActivos = Entero(reader, ColumnUsuariosActivos),
                    UsuariosInactivos = Entero(reader, ColumnUsuariosInactivos),
                    Administradores = Entero(reader, ColumnAdministradores),
                    UsuariosRol = Entero(reader, ColumnUsuariosRol),
                    TotalPlazas = Entero(reader, ColumnTotalPlazas),
                    PlazasAsignadas = Entero(reader, ColumnPlazasAsignadas),
                    DeclaracionesCompletadas = Entero(reader, ColumnDeclCompletadas),
                    DeclaracionesPendientes = Entero(reader, ColumnDeclPendientes),
                    ContrasenasPorExpirar = Entero(reader, ColumnContrasenasPorExpirar),
                };
            }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Distribución de plazas por área                                  //
    // ---------------------------------------------------------------- //
    public async Task<List<ConteoEtiqueta>> ObtenerPlazasPorAreaAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT NVL(a.NOMBRE, 'Sin área') AS ETIQUETA, COUNT(*) AS CANTIDAD
                FROM   PLAZAS p
                LEFT JOIN AREAS a ON a.ID_AREA = p.ID_AREA
                GROUP BY NVL(a.NOMBRE, 'Sin área')
                ORDER BY COUNT(*) DESC, ETIQUETA
                """,
                connection)
            { BindByName = true },
            LeerConteosAsync).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Asignaciones por período (mes de la fecha de inicio)             //
    // ---------------------------------------------------------------- //
    public async Task<List<ConteoEtiqueta>> ObtenerAsignacionesPorPeriodoAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT TO_CHAR(FECHA_INICIO, 'YYYY-MM') AS ETIQUETA, COUNT(*) AS CANTIDAD
                FROM   PLAZAS_USUARIOS
                WHERE  FECHA_INICIO >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -11)
                GROUP BY TO_CHAR(FECHA_INICIO, 'YYYY-MM')
                ORDER BY ETIQUETA
                """,
                connection)
            { BindByName = true },
            LeerConteosAsync).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Últimas plazas asignadas                                         //
    // ---------------------------------------------------------------- //
    public async Task<List<DashboardPlazaAsignada>> ObtenerUltimasPlazasAsignadasAsync(int limite)
    {
        return await _q.QueryAsync(connection =>
            {
                var cmd = new OracleCommand(
                    """
                    SELECT pu.NUMERO_PLAZA,
                           TRIM(REGEXP_REPLACE(u.PRIMER_NOMBRE || ' ' || NVL(u.SEGUNDO_NOMBRE, '') || ' ' ||
                                u.PRIMER_APELLIDO || ' ' || u.SEGUNDO_APELLIDO, ' +', ' ')) AS USUARIO,
                           pt.NOMBRE AS PUESTO,
                           pu.FECHA_INICIO
                    FROM   PLAZAS_USUARIOS pu
                    JOIN   USUARIOS u         ON u.CORREO_INSTITUCIONAL = pu.CORREO_INSTITUCIONAL
                    JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                    ORDER BY pu.FECHA_INICIO DESC, pu.NUMERO_PLAZA DESC
                    FETCH FIRST :limite ROWS ONLY
                    """,
                    connection)
                { BindByName = true };
                OracleCommandHelpers.AddInt32Param(cmd, ":limite", limite);
                return cmd;
            },
            async reader =>
            {
                var lista = new List<DashboardPlazaAsignada>();
                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    lista.Add(new DashboardPlazaAsignada
                    {
                        NumeroPlaza = LeerNumeroPlaza(reader, ColumnNumeroPlaza),
                        Usuario = reader.GetString(reader.GetOrdinal(ColumnUsuario)),
                        Puesto = reader.GetString(reader.GetOrdinal(ColumnPuesto)),
                        FechaInicio = reader.GetDateTime(reader.GetOrdinal(ColumnFechaInicio)),
                    });
                }
                return lista;
            }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Declaraciones recientes                                          //
    // ---------------------------------------------------------------- //
    public async Task<List<DashboardDeclaracionReciente>> ObtenerDeclaracionesRecientesAsync(int limite)
    {
        return await _q.QueryAsync(connection =>
            {
                var cmd = new OracleCommand(
                    """
                    SELECT d.ID_DECLARACION,
                           TRIM(REGEXP_REPLACE(u.PRIMER_NOMBRE || ' ' || NVL(u.SEGUNDO_NOMBRE, '') || ' ' ||
                                u.PRIMER_APELLIDO || ' ' || u.SEGUNDO_APELLIDO, ' +', ' ')) AS USUARIO,
                           d.NUMERO_PLAZA,
                           d.FECHA_DECLARACION,
                           d.COMPLETA
                    FROM   DECLARACIONES_JURADAS d
                    JOIN   USUARIOS u ON u.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                    ORDER BY d.FECHA_DECLARACION DESC, d.ID_DECLARACION DESC
                    FETCH FIRST :limite ROWS ONLY
                    """,
                    connection)
                { BindByName = true };
                OracleCommandHelpers.AddInt32Param(cmd, ":limite", limite);
                return cmd;
            },
            async reader =>
            {
                var lista = new List<DashboardDeclaracionReciente>();
                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    lista.Add(new DashboardDeclaracionReciente
                    {
                        Id = Entero(reader, ColumnIdDeclaracion),
                        Usuario = reader.GetString(reader.GetOrdinal(ColumnUsuario)),
                        NumeroPlaza = LeerNumeroPlaza(reader, ColumnNumeroPlaza),
                        FechaDeclaracion = reader.GetDateTime(reader.GetOrdinal(ColumnFechaDeclaracion)),
                        Completa = Entero(reader, ColumnCompleta),
                    });
                }
                return lista;
            }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Helpers                                                          //
    // ---------------------------------------------------------------- //
    private static async Task<List<ConteoEtiqueta>> LeerConteosAsync(DbDataReader reader)
    {
        var lista = new List<ConteoEtiqueta>();
        while (await reader.ReadAsync().ConfigureAwait(false))
        {
            lista.Add(new ConteoEtiqueta
            {
                Etiqueta = reader.GetString(reader.GetOrdinal(ColumnEtiqueta)),
                Cantidad = Entero(reader, ColumnCantidad),
            });
        }
        return lista;
    }

    // COUNT(*) y otras agregaciones llegan como NUMBER; se normalizan a int de forma robusta.
    private static int Entero(DbDataReader r, string columna) =>
        Convert.ToInt32(r.GetValue(r.GetOrdinal(columna)), CultureInfo.InvariantCulture);

    private static ulong LeerNumeroPlaza(DbDataReader r, string columna) =>
        Convert.ToUInt64(r.GetValue(r.GetOrdinal(columna)), CultureInfo.InvariantCulture);
}
