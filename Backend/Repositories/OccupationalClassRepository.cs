using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class OccupationalClassRepository : IOccupationalClassRepository
{
    private const string ColumnId = "ID_CLASE_OCUPACIONAL";
    private const string ColumnCodigo = "CODIGO";
    private const string ColumnNombre = "NOMBRE";

    private readonly IQueryExecutor _q;

    public OccupationalClassRepository(IQueryExecutor q) => _q = q;

    private static OccupationalClass MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        IdClaseOcupacional = reader.GetInt64(reader.GetOrdinal(ColumnId)),
        Codigo = reader.GetInt32(reader.GetOrdinal(ColumnCodigo)),
        Nombre = reader.IsDBNull(reader.GetOrdinal(ColumnNombre)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnNombre)),
    };

    public async Task<List<OccupationalClass>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_CLASE_OCUPACIONAL, CODIGO, NOMBRE FROM CLASES_OCUPACIONALES ORDER BY CODIGO",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var lista = new List<OccupationalClass>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                lista.Add(MapearFila(reader));
            }
            return lista;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM CLASES_OCUPACIONALES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, ":nombre", nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<bool> ExisteCodigoAsync(int codigo)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM CLASES_OCUPACIONALES WHERE CODIGO = :codigo",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt32Param(cmd, ":codigo", codigo);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<long> InsertarAsync(OccupationalClass clase)
    {
        ArgumentNullException.ThrowIfNull(clase);

        const string query = """
            INSERT INTO CLASES_OCUPACIONALES (CODIGO, NOMBRE)
            VALUES (:codigo, :nombre)
            RETURNING ID_CLASE_OCUPACIONAL INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddInt32Param(cmd, ":codigo", clase.Codigo);
            OracleCommandHelpers.AddStringParam(cmd, ":nombre", clase.Nombre);
            var idParam = new OracleParameter(":id", OracleDbType.Decimal, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
            return cmd;
        }).ConfigureAwait(false);

        return (long)(OracleDecimal)result!;
    }

    public async Task<OccupationalClass?> ObtenerPorIdAsync(long id)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_CLASE_OCUPACIONAL, CODIGO, NOMBRE FROM CLASES_OCUPACIONALES WHERE ID_CLASE_OCUPACIONAL = :id",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt64Param(cmd, ":id", id);
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

    public async Task<bool> EliminarAsync(long id)
    {
        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(
                "DELETE FROM CLASES_OCUPACIONALES WHERE ID_CLASE_OCUPACIONAL = :id",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt64Param(cmd, ":id", id);
            return cmd;
        }).ConfigureAwait(false);
        return rows > 0;
    }

    public async Task<bool> EstaAsociadoAsync(long id)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM PLAZAS_USUARIOS WHERE ID_CLASE_OCUPACIONAL = :id",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddInt64Param(cmd, ":id", id);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, System.Globalization.CultureInfo.InvariantCulture) > 0;
    }
}
