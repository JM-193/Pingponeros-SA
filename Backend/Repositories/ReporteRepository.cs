using System.Data.Common;
using System.Globalization;
using Backend.Helpers;
using Backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

/// <summary>
/// Consultas de lectura para los reportes administrativos. Sigue el mismo estilo que
/// <see cref="DeclaracionRepository"/>: SELECT con literales en tiempo de compilación ejecutados
/// a través de <see cref="IQueryExecutor"/>.
/// </summary>
internal sealed class ReporteRepository : IReporteRepository
{
    private const string ColumnCorreo = "CORREO_INSTITUCIONAL";
    private const string ColumnPrimerNombre = "PRIMER_NOMBRE";
    private const string ColumnSegundoNombre = "SEGUNDO_NOMBRE";
    private const string ColumnPrimerApellido = "PRIMER_APELLIDO";
    private const string ColumnSegundoApellido = "SEGUNDO_APELLIDO";
    private const string ColumnRol = "ROL";
    private const string ColumnEstado = "ESTADO";
    private const string ColumnNumeroPlaza = "NUMERO_PLAZA";
    private const string ColumnCargo = "CARGO";
    private const string ColumnClaseOcupacional = "CLASE_OCUPACIONAL";
    private const string ColumnLugarTrabajo = "LUGAR_TRABAJO";
    private const string ColumnIdDeclaracion = "ID_DECLARACION";
    private const string ColumnFechaDeclaracion = "FECHA_DECLARACION";
    private const string ColumnCompleta = "COMPLETA";
    private const string ColumnJornadaLaboral = "JORNADA_LABORAL";
    private const string ColumnPeriodicidad = "PERIODICIDAD";
    private const string ColumnVecesRealizadas = "VECES_REALIZADAS";
    private const string ColumnDuracion = "DURACION";

    private readonly IQueryExecutor _q;

    public ReporteRepository(IQueryExecutor q) => _q = q;

    // ---------------------------------------------------------------- //
    // Funcionarios                                                      //
    // ---------------------------------------------------------------- //
    public async Task<List<ReporteFuncionarioFila>> ObtenerFuncionariosAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT u.CORREO_INSTITUCIONAL, u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE,
                       u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.ROL, u.ESTADO,
                       pu.NUMERO_PLAZA, pt.NOMBRE AS CARGO, pu.CLASE_OCUPACIONAL, pu.LUGAR_TRABAJO
                FROM   USUARIOS u
                LEFT JOIN PLAZAS_USUARIOS pu
                       ON pu.CORREO_INSTITUCIONAL = u.CORREO_INSTITUCIONAL
                      AND (pu.FECHA_FINAL IS NULL OR pu.FECHA_FINAL > SYSDATE)
                LEFT JOIN PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                ORDER BY u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.PRIMER_NOMBRE, pu.NUMERO_PLAZA
                """,
                connection)
            { BindByName = true },
            async reader =>
            {
                var lista = new List<ReporteFuncionarioFila>();
                while (await reader.ReadAsync().ConfigureAwait(false))
                    lista.Add(MapearFuncionario(reader));
                return lista;
            }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Declaraciones                                                     //
    // ---------------------------------------------------------------- //
    public async Task<List<ReporteDeclaracionFila>> ObtenerDeclaracionesAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT d.ID_DECLARACION, d.CORREO_INSTITUCIONAL,
                       u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE, u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO,
                       d.NUMERO_PLAZA, d.FECHA_DECLARACION, d.COMPLETA,
                       (SELECT pt.NOMBRE
                        FROM   PLAZAS_USUARIOS pu
                        JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                        WHERE  pu.NUMERO_PLAZA = d.NUMERO_PLAZA
                        AND    pu.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                        ORDER BY pu.FECHA_INICIO DESC
                        FETCH FIRST 1 ROWS ONLY) AS CARGO
                FROM   DECLARACIONES_JURADAS d
                JOIN   USUARIOS u ON u.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                ORDER BY d.FECHA_DECLARACION DESC, d.ID_DECLARACION DESC
                """,
                connection)
            { BindByName = true },
            async reader =>
            {
                var lista = new List<ReporteDeclaracionFila>();
                while (await reader.ReadAsync().ConfigureAwait(false))
                    lista.Add(MapearDeclaracion(reader));
                return lista;
            }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Horas / carga laboral (agregado por declaración completa)         //
    // ---------------------------------------------------------------- //
    public async Task<List<ReporteHorasFila>> ObtenerHorasAsync()
    {
        return await _q.QueryAsync(connection =>
            new OracleCommand(
                """
                SELECT d.ID_DECLARACION, d.CORREO_INSTITUCIONAL,
                       u.PRIMER_NOMBRE, u.SEGUNDO_NOMBRE, u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO,
                       d.NUMERO_PLAZA, d.FECHA_DECLARACION, hl.JORNADA_LABORAL,
                       a.PERIODICIDAD, a.VECES_REALIZADAS, a.DURACION,
                       (SELECT pt.NOMBRE
                        FROM   PLAZAS_USUARIOS pu
                        JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                        WHERE  pu.NUMERO_PLAZA = d.NUMERO_PLAZA
                        AND    pu.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                        ORDER BY pu.FECHA_INICIO DESC
                        FETCH FIRST 1 ROWS ONLY) AS CARGO
                FROM   DECLARACIONES_JURADAS d
                JOIN   USUARIOS u           ON u.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                JOIN   ACTIVIDADES a        ON a.ID_DECLARACION = d.ID_DECLARACION
                LEFT JOIN HORARIOS_LABORALES hl ON hl.ID_DECLARACION = d.ID_DECLARACION
                WHERE  d.COMPLETA = 1
                ORDER BY u.PRIMER_APELLIDO, u.SEGUNDO_APELLIDO, u.PRIMER_NOMBRE, d.ID_DECLARACION
                """,
                connection)
            { BindByName = true },
            async reader => await AgregarHorasAsync(reader).ConfigureAwait(false)).ConfigureAwait(false);
    }

    // Agrupa por declaración: suma minutos semanales (WorkloadCalculator) y cuenta funciones,
    // preservando el orden de llegada (por apellido).
    private static async Task<List<ReporteHorasFila>> AgregarHorasAsync(DbDataReader reader)
    {
        var porDeclaracion = new Dictionary<int, ReporteHorasFila>();
        var orden = new List<int>();

        while (await reader.ReadAsync().ConfigureAwait(false))
        {
            var id = reader.GetInt32(reader.GetOrdinal(ColumnIdDeclaracion));
            if (!porDeclaracion.TryGetValue(id, out var fila))
            {
                fila = new ReporteHorasFila
                {
                    CorreoInstitucional = reader.GetString(reader.GetOrdinal(ColumnCorreo)),
                    NombreCompleto = LeerNombreCompleto(reader),
                    NumeroPlaza = LeerNumeroPlaza(reader) ?? 0,
                    Cargo = LeerStringOpcional(reader, ColumnCargo),
                    FechaDeclaracion = reader.GetDateTime(reader.GetOrdinal(ColumnFechaDeclaracion)),
                    JornadaLaboral = LeerStringOpcional(reader, ColumnJornadaLaboral),
                };
                porDeclaracion[id] = fila;
                orden.Add(id);
            }

            var periodicidad = LeerStringOpcional(reader, ColumnPeriodicidad);
            var veces = reader.GetInt32(reader.GetOrdinal(ColumnVecesRealizadas));
            var duracion = reader.GetInt32(reader.GetOrdinal(ColumnDuracion));
            fila.TotalMinutosSemanales += WorkloadCalculator.MinutosSemanales(periodicidad, veces, duracion);
            fila.CantidadFunciones += 1;
        }

        return orden.Select(id => porDeclaracion[id]).ToList();
    }

    // ---------------------------------------------------------------- //
    // Mapeos / lectores                                                 //
    // ---------------------------------------------------------------- //
    private static ReporteFuncionarioFila MapearFuncionario(DbDataReader r) => new()
    {
        CorreoInstitucional = r.GetString(r.GetOrdinal(ColumnCorreo)),
        NombreCompleto = LeerNombreCompleto(r),
        Rol = r.GetInt32(r.GetOrdinal(ColumnRol)),
        Estado = r.GetInt32(r.GetOrdinal(ColumnEstado)),
        NumeroPlaza = LeerNumeroPlaza(r),
        Cargo = LeerStringOpcional(r, ColumnCargo),
        ClaseOcupacional = LeerStringOpcional(r, ColumnClaseOcupacional),
        LugarTrabajo = LeerStringOpcional(r, ColumnLugarTrabajo),
    };

    private static ReporteDeclaracionFila MapearDeclaracion(DbDataReader r) => new()
    {
        Id = r.GetInt32(r.GetOrdinal(ColumnIdDeclaracion)),
        CorreoInstitucional = r.GetString(r.GetOrdinal(ColumnCorreo)),
        NombreCompleto = LeerNombreCompleto(r),
        NumeroPlaza = LeerNumeroPlaza(r) ?? 0,
        Cargo = LeerStringOpcional(r, ColumnCargo),
        FechaDeclaracion = r.GetDateTime(r.GetOrdinal(ColumnFechaDeclaracion)),
        Completa = r.GetInt32(r.GetOrdinal(ColumnCompleta)),
    };

    private static string LeerNombreCompleto(DbDataReader r)
    {
        var partes = new[]
        {
            LeerStringOpcional(r, ColumnPrimerNombre),
            LeerStringOpcional(r, ColumnSegundoNombre),
            LeerStringOpcional(r, ColumnPrimerApellido),
            LeerStringOpcional(r, ColumnSegundoApellido),
        };
        return string.Join(' ', partes.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    private static ulong? LeerNumeroPlaza(DbDataReader r)
    {
        var ordinal = r.GetOrdinal(ColumnNumeroPlaza);
        return r.IsDBNull(ordinal)
            ? null
            : Convert.ToUInt64(r.GetValue(ordinal), CultureInfo.InvariantCulture);
    }

    private static string? LeerStringOpcional(DbDataReader r, string columna)
    {
        var ordinal = r.GetOrdinal(columna);
        return r.IsDBNull(ordinal) ? null : r.GetString(ordinal);
    }
}
