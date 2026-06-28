using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class FunctionRepository : IFunctionRepository
{
    private const string ColumnIdFuncion = "ID_FUNCION";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";

    private readonly IQueryExecutor _q;

    public FunctionRepository(IQueryExecutor q) => _q = q;

    private static Function MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal(ColumnIdFuncion)),
        Nombre = reader.IsDBNull(reader.GetOrdinal(ColumnNombre)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnNombre)),
        Descripcion = reader.IsDBNull(reader.GetOrdinal(ColumnDescripcion)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnDescripcion)),
    };

    private static void AgregarParamNombre(OracleCommand cmd, string nombre)
    {
        OracleCommandHelpers.AddStringParam(cmd, ":nombre", nombre);
    }

    public async Task<List<Function>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_FUNCION, NOMBRE, DESCRIPCION FROM FUNCIONES ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var funciones = new List<Function>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                funciones.Add(MapearFila(reader));
            }
            return funciones;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM FUNCIONES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            AgregarParamNombre(cmd, nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<int> InsertarAsync(Function funcion)
    {
        ArgumentNullException.ThrowIfNull(funcion);

        const string query = """
            INSERT INTO FUNCIONES (NOMBRE, DESCRIPCION)
            VALUES (:nombre, :descripcion)
            RETURNING ID_FUNCION INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            AgregarParamNombre(cmd, funcion.Nombre);
            OracleCommandHelpers.AddStringParam(cmd, ":descripcion", funcion.Descripcion);
            var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Function?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_FUNCION, NOMBRE, DESCRIPCION FROM FUNCIONES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
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

    public async Task<bool> EstaEnActividadesAsync(int id)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection, "SELECT COUNT(*) FROM ACTIVIDADES WHERE ID_FUNCION = :id", id)
        ).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        // Eliminar asociaciones con puestos de trabajo antes de borrar la función
        await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection, "DELETE FROM FUNCIONES_PUESTOS WHERE ID_FUNCION = :id", id)
        ).ConfigureAwait(false);

        var rows = await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection, "DELETE FROM FUNCIONES WHERE ID_FUNCION = :id", id)
        ).ConfigureAwait(false);

        return rows > 0;
    }
}
