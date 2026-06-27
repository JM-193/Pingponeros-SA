using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class WorkPositionRepository : IWorkPositionRepository
{
    private const string ColumnIdPuesto = "ID_PUESTO";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";

    private readonly IQueryExecutor _q;

    public WorkPositionRepository(IQueryExecutor q) => _q = q;

    private static WorkPosition MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal(ColumnIdPuesto)),
        Nombre = reader.IsDBNull(reader.GetOrdinal(ColumnNombre)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnNombre)),
        Descripcion = reader.IsDBNull(reader.GetOrdinal(ColumnDescripcion)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnDescripcion)),
    };

    private static void AgregarParamNombre(OracleCommand cmd, string nombre)
    {
        OracleCommandHelpers.AddStringParam(cmd, ":nombre", nombre);
    }

    private static void AgregarParametrosInsertar(OracleCommand cmd, WorkPosition puesto)
    {
        AgregarParamNombre(cmd, puesto.Nombre);
        OracleCommandHelpers.AddStringParam(cmd, ":descripcion", puesto.Descripcion);
    }

    public async Task<List<WorkPosition>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_PUESTO, NOMBRE, DESCRIPCION FROM PUESTOS_TRABAJO ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var puestos = new List<WorkPosition>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                puestos.Add(MapearFila(reader));
            }
            return puestos;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM PUESTOS_TRABAJO WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            AgregarParamNombre(cmd, nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<int> InsertarAsync(WorkPosition puesto)
    {
        ArgumentNullException.ThrowIfNull(puesto);

        const string query = """
            INSERT INTO PUESTOS_TRABAJO (NOMBRE, DESCRIPCION)
            VALUES (:nombre, :descripcion)
            RETURNING ID_PUESTO INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            AgregarParametrosInsertar(cmd, puesto);
            var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<WorkPosition?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_PUESTO, NOMBRE, DESCRIPCION FROM PUESTOS_TRABAJO WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            AgregarParamNombre(cmd, nombre);
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

    public async Task<bool> EstaAsociadoAsync(int id)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
            OracleCommandHelpers.CreateCountByIdCommand(connection, "PLAZAS_USUARIOS", "ID_PUESTO", id)
        ).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var rows = await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateDeleteByIdCommand(connection, "PUESTOS_TRABAJO", "ID_PUESTO", id)
        ).ConfigureAwait(false);
        return rows > 0;
    }
}
