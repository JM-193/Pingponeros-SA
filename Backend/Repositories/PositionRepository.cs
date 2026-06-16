// PositionRepository.cs
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class PositionRepository : IPositionRepository
{
    private const string ParamNumeroPlaza = ":numeroPlaza";
    private const string ColumnNumeroPlaza = "NUMERO_PLAZA";
    private const string ColumnIdUnidad = "ID_UNIDAD";
    private const string ColumnIdDepartamento = "ID_DEPARTAMENTO";
    private const string ColumnIdSeccion = "ID_SECCION";
    private const string ColumnIdArea = "ID_AREA";

    private readonly IQueryExecutor _q;

    public PositionRepository(IQueryExecutor q) => _q = q;

    private static Position MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        NumeroPlaza = reader.GetInt64(reader.GetOrdinal(ColumnNumeroPlaza)),
        IdUnidad = reader.IsDBNull(reader.GetOrdinal(ColumnIdUnidad)) ? null : reader.GetInt32(reader.GetOrdinal(ColumnIdUnidad)),
        IdDepartamento = reader.IsDBNull(reader.GetOrdinal(ColumnIdDepartamento)) ? null : reader.GetInt32(reader.GetOrdinal(ColumnIdDepartamento)),
        IdSeccion = reader.IsDBNull(reader.GetOrdinal(ColumnIdSeccion)) ? null : reader.GetInt32(reader.GetOrdinal(ColumnIdSeccion)),
        IdArea = reader.IsDBNull(reader.GetOrdinal(ColumnIdArea)) ? null : reader.GetInt32(reader.GetOrdinal(ColumnIdArea)),
    };

    public async Task<List<Position>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT NUMERO_PLAZA, ID_UNIDAD, ID_DEPARTAMENTO, ID_SECCION, ID_AREA FROM PLAZAS ORDER BY NUMERO_PLAZA",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var plazas = new List<Position>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                plazas.Add(MapearFila(reader));
            }
            return plazas;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNumeroPlazaAsync(long numeroPlaza)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM PLAZAS WHERE NUMERO_PLAZA = :numeroPlaza",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt64Param(cmd, ParamNumeroPlaza, numeroPlaza);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task InsertarAsync(Position plaza)
    {
        ArgumentNullException.ThrowIfNull(plaza);

        const string query = """
            INSERT INTO PLAZAS (NUMERO_PLAZA, ID_UNIDAD, ID_DEPARTAMENTO, ID_SECCION, ID_AREA)
            VALUES (:numeroPlaza, :idUnidad, :idDepartamento, :idSeccion, :idArea)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddInt64Param(cmd, ParamNumeroPlaza, plaza.NumeroPlaza);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idUnidad", plaza.IdUnidad);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", plaza.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", plaza.IdSeccion);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", plaza.IdArea);
            return cmd;
        }).ConfigureAwait(false);
    }

    public async Task<Position?> ObtenerPorNumeroAsync(long numeroPlaza)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT NUMERO_PLAZA, ID_UNIDAD, ID_DEPARTAMENTO, ID_SECCION, ID_AREA FROM PLAZAS WHERE NUMERO_PLAZA = :numeroPlaza",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt64Param(cmd, ParamNumeroPlaza, numeroPlaza);
            return cmd;
        }, async reader =>
        {
            if (await reader.ReadAsync().ConfigureAwait(false))
            {
                return MapearFila(reader);
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(long numeroPlaza, Position plaza)
    {
        ArgumentNullException.ThrowIfNull(plaza);

        const string query = """
            UPDATE PLAZAS
            SET ID_UNIDAD = :idUnidad, ID_DEPARTAMENTO = :idDepartamento, ID_SECCION = :idSeccion, ID_AREA = :idArea
            WHERE NUMERO_PLAZA = :numeroPlaza
            """;

        var filas = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddInt64Param(cmd, ParamNumeroPlaza, numeroPlaza);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idUnidad", plaza.IdUnidad);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", plaza.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", plaza.IdSeccion);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", plaza.IdArea);
            return cmd;
        }).ConfigureAwait(false);

        return filas > 0;
    }
}
