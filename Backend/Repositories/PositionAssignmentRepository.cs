// PositionAssignmentRepository.cs
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class PositionAssignmentRepository : IPositionAssignmentRepository
{
    private const string ColumnNumeroPlaza = "NUMERO_PLAZA";
    private const string ColumnCorreo = "CORREO_INSTITUCIONAL";
    private const string ColumnIdPuesto = "ID_PUESTO";
    private const string ColumnPuestoNombre = "PUESTO_NOMBRE";
    private const string ColumnClaseOcupacional = "CLASE_OCUPACIONAL";
    private const string ColumnFechaInicio = "FECHA_INICIO";
    private const string ColumnFechaFinal = "FECHA_FINAL";

    // Columnas reutilizadas para el mapeo de plazas disponibles.
    private const string ColumnIdUnidad = "ID_UNIDAD";
    private const string ColumnIdDepartamento = "ID_DEPARTAMENTO";
    private const string ColumnIdSeccion = "ID_SECCION";
    private const string ColumnIdArea = "ID_AREA";

    private readonly IQueryExecutor _q;

    public PositionAssignmentRepository(IQueryExecutor q) => _q = q;

    private static PositionAssignment MapearAsignacion(System.Data.Common.DbDataReader r) => new()
    {
        NumeroPlaza = Convert.ToUInt64(r.GetValue(r.GetOrdinal(ColumnNumeroPlaza)), CultureInfo.InvariantCulture),
        CorreoInstitucional = r.GetString(r.GetOrdinal(ColumnCorreo)),
        IdPuesto = r.GetInt32(r.GetOrdinal(ColumnIdPuesto)),
        PuestoNombre = r.IsDBNull(r.GetOrdinal(ColumnPuestoNombre)) ? null : r.GetString(r.GetOrdinal(ColumnPuestoNombre)),
        ClaseOcupacional = r.GetString(r.GetOrdinal(ColumnClaseOcupacional)),
        FechaInicio = r.GetDateTime(r.GetOrdinal(ColumnFechaInicio)),
        FechaFinal = r.IsDBNull(r.GetOrdinal(ColumnFechaFinal)) ? null : r.GetDateTime(r.GetOrdinal(ColumnFechaFinal)),
    };

    private static Position MapearPlaza(System.Data.Common.DbDataReader r) => new()
    {
        NumeroPlaza = Convert.ToUInt64(r.GetValue(r.GetOrdinal(ColumnNumeroPlaza)), CultureInfo.InvariantCulture),
        IdUnidad = r.IsDBNull(r.GetOrdinal(ColumnIdUnidad)) ? null : r.GetInt32(r.GetOrdinal(ColumnIdUnidad)),
        IdDepartamento = r.IsDBNull(r.GetOrdinal(ColumnIdDepartamento)) ? null : r.GetInt32(r.GetOrdinal(ColumnIdDepartamento)),
        IdSeccion = r.IsDBNull(r.GetOrdinal(ColumnIdSeccion)) ? null : r.GetInt32(r.GetOrdinal(ColumnIdSeccion)),
        IdArea = r.IsDBNull(r.GetOrdinal(ColumnIdArea)) ? null : r.GetInt32(r.GetOrdinal(ColumnIdArea)),
    };

    public async Task<List<PositionAssignment>> ObtenerActivasPorUsuarioAsync(string correo)
    {
        const string sql = """
            SELECT pu.NUMERO_PLAZA, pu.CORREO_INSTITUCIONAL, pu.ID_PUESTO,
                   pt.NOMBRE AS PUESTO_NOMBRE, pu.CLASE_OCUPACIONAL,
                   pu.FECHA_INICIO, pu.FECHA_FINAL
            FROM   PLAZAS_USUARIOS pu
            JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
            WHERE  pu.CORREO_INSTITUCIONAL = :correo
            AND    pu.FECHA_FINAL IS NULL
            ORDER BY pu.NUMERO_PLAZA
            """;

        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection) { BindByName = true };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            return cmd;
        }, async reader =>
        {
            var lista = new List<PositionAssignment>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearAsignacion(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    public async Task<List<Position>> ObtenerPlazasDisponiblesAsync()
    {
        const string sql = """
            SELECT p.NUMERO_PLAZA, p.ID_UNIDAD, p.ID_DEPARTAMENTO, p.ID_SECCION, p.ID_AREA
            FROM   PLAZAS p
            WHERE  NOT EXISTS (
                       SELECT 1 FROM PLAZAS_USUARIOS pu
                       WHERE  pu.NUMERO_PLAZA = p.NUMERO_PLAZA
                       AND    pu.FECHA_FINAL IS NULL
                   )
            ORDER BY p.NUMERO_PLAZA
            """;

        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection) { BindByName = true };
            return cmd;
        }, async reader =>
        {
            var lista = new List<Position>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearPlaza(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    public async Task<bool> PlazaTieneAsignacionActivaAsync(ulong numeroPlaza)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM PLAZAS_USUARIOS WHERE NUMERO_PLAZA = :numeroPlaza AND FECHA_FINAL IS NULL",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddUInt64Param(cmd, ":numeroPlaza", numeroPlaza);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task AsignarAsync(PositionAssignment asignacion)
    {
        ArgumentNullException.ThrowIfNull(asignacion);

        const string sql = """
            INSERT INTO PLAZAS_USUARIOS
                (NUMERO_PLAZA, CORREO_INSTITUCIONAL, ID_PUESTO, CLASE_OCUPACIONAL, FECHA_INICIO, FECHA_FINAL)
            VALUES
                (:numeroPlaza, :correo, :idPuesto, :claseOcupacional, :fechaInicio, :fechaFinal)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection) { BindByName = true };
            OracleCommandHelpers.AddUInt64Param(cmd, ":numeroPlaza", asignacion.NumeroPlaza);
            OracleCommandHelpers.AddStringParam(cmd, ":correo", asignacion.CorreoInstitucional);
            OracleCommandHelpers.AddInt32Param(cmd, ":idPuesto", asignacion.IdPuesto);
            OracleCommandHelpers.AddStringParam(cmd, ":claseOcupacional", asignacion.ClaseOcupacional);
            OracleCommandHelpers.AddDateParam(cmd, ":fechaInicio", asignacion.FechaInicio);
            OracleCommandHelpers.AddNullableDateParam(cmd, ":fechaFinal", asignacion.FechaFinal);
            return cmd;
        }).ConfigureAwait(false);
    }

    public async Task<bool> DesasignarAsync(ulong numeroPlaza, string correo)
    {
        const string sql = """
            UPDATE PLAZAS_USUARIOS
            SET    FECHA_FINAL = SYSDATE
            WHERE  NUMERO_PLAZA = :numeroPlaza
            AND    CORREO_INSTITUCIONAL = :correo
            AND    FECHA_FINAL IS NULL
            """;

        var filas = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection) { BindByName = true };
            OracleCommandHelpers.AddUInt64Param(cmd, ":numeroPlaza", numeroPlaza);
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            return cmd;
        }).ConfigureAwait(false);

        return filas > 0;
    }
}
