// PositionRepository.cs
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class PositionRepository : IPositionRepository
{
    private readonly IQueryExecutor _q;

    public PositionRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Plaza>> ObtenerTodasAsync()
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
            var plazas = new List<Plaza>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                plazas.Add(new Plaza
                {
                    NumeroPlaza = Convert.ToInt64(reader["NUMERO_PLAZA"], CultureInfo.InvariantCulture),
                    IdUnidad = reader["ID_UNIDAD"] is DBNull ? null : Convert.ToInt32(reader["ID_UNIDAD"], CultureInfo.InvariantCulture),
                    IdDepartamento = reader["ID_DEPARTAMENTO"] is DBNull ? null : Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdSeccion = reader["ID_SECCION"] is DBNull ? null : Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                });
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
            cmd.Parameters.Add(":numeroPlaza", OracleDbType.Int64).Value = numeroPlaza;
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task InsertarAsync(Plaza plaza)
    {
        ArgumentNullException.ThrowIfNull(plaza);

        const string query = """
            INSERT INTO PLAZAS (NUMERO_PLAZA, ID_UNIDAD, ID_DEPARTAMENTO, ID_SECCION, ID_AREA)
            VALUES (:numeroPlaza, :idUnidad, :idDepartamento, :idSeccion, :idArea)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            cmd.Parameters.Add(":numeroPlaza", OracleDbType.Int64).Value = plaza.NumeroPlaza;
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idUnidad", plaza.IdUnidad);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", plaza.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", plaza.IdSeccion);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", plaza.IdArea);
            return cmd;
        }).ConfigureAwait(false);
    }

    public async Task<Plaza?> ObtenerPorNumeroAsync(long numeroPlaza)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT NUMERO_PLAZA, ID_UNIDAD, ID_DEPARTAMENTO, ID_SECCION, ID_AREA FROM PLAZAS WHERE NUMERO_PLAZA = :numeroPlaza",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(":numeroPlaza", OracleDbType.Int64).Value = numeroPlaza;
            return cmd;
        }, async reader =>
        {
            if (await reader.ReadAsync().ConfigureAwait(false))
            {
                return new Plaza
                {
                    NumeroPlaza = Convert.ToInt64(reader["NUMERO_PLAZA"], CultureInfo.InvariantCulture),
                    IdUnidad = reader["ID_UNIDAD"] is DBNull ? null : Convert.ToInt32(reader["ID_UNIDAD"], CultureInfo.InvariantCulture),
                    IdDepartamento = reader["ID_DEPARTAMENTO"] is DBNull ? null : Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdSeccion = reader["ID_SECCION"] is DBNull ? null : Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(long numeroPlaza, Plaza plaza)
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
            cmd.Parameters.Add(":numeroPlaza", OracleDbType.Int64).Value = numeroPlaza;
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idUnidad", plaza.IdUnidad);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", plaza.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", plaza.IdSeccion);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", plaza.IdArea);
            return cmd;
        }).ConfigureAwait(false);

        return filas > 0;
    }
}
