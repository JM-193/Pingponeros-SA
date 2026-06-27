using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class WorkPositionFunctionRepository : IWorkPositionFunctionRepository
{
    private readonly IQueryExecutor _q;

    public WorkPositionFunctionRepository(IQueryExecutor q) => _q = q;

    private static Function MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("ID_FUNCION")),
        Nombre = reader.IsDBNull(reader.GetOrdinal("NOMBRE")) ? string.Empty : reader.GetString(reader.GetOrdinal("NOMBRE")),
        Descripcion = reader.IsDBNull(reader.GetOrdinal("DESCRIPCION")) ? string.Empty : reader.GetString(reader.GetOrdinal("DESCRIPCION")),
    };

    public async Task<List<Function>> ObtenerFuncionesDePuestoAsync(int idPuesto)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                """
                SELECT f.ID_FUNCION, f.NOMBRE, f.DESCRIPCION
                FROM FUNCIONES f
                INNER JOIN FUNCIONES_PUESTOS fp ON f.ID_FUNCION = fp.ID_FUNCION
                WHERE fp.ID_PUESTO = :idPuesto
                ORDER BY f.NOMBRE
                """,
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(new OracleParameter(":idPuesto", OracleDbType.Int32) { Value = idPuesto });
            return cmd;
        }, async reader =>
        {
            var lista = new List<Function>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearFila(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    public async Task<bool> EstaAsociadaAsync(int idPuesto, int idFuncion)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM FUNCIONES_PUESTOS WHERE ID_PUESTO = :idPuesto AND ID_FUNCION = :idFuncion",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(new OracleParameter(":idPuesto", OracleDbType.Int32) { Value = idPuesto });
            cmd.Parameters.Add(new OracleParameter(":idFuncion", OracleDbType.Int32) { Value = idFuncion });
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task AgregarAsync(int idPuesto, int idFuncion)
    {
        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(
                "INSERT INTO FUNCIONES_PUESTOS (ID_PUESTO, ID_FUNCION) VALUES (:idPuesto, :idFuncion)",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(new OracleParameter(":idPuesto", OracleDbType.Int32) { Value = idPuesto });
            cmd.Parameters.Add(new OracleParameter(":idFuncion", OracleDbType.Int32) { Value = idFuncion });
            return cmd;
        }).ConfigureAwait(false);
    }

    public async Task<bool> QuitarAsync(int idPuesto, int idFuncion)
    {
        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(
                "DELETE FROM FUNCIONES_PUESTOS WHERE ID_PUESTO = :idPuesto AND ID_FUNCION = :idFuncion",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(new OracleParameter(":idPuesto", OracleDbType.Int32) { Value = idPuesto });
            cmd.Parameters.Add(new OracleParameter(":idFuncion", OracleDbType.Int32) { Value = idFuncion });
            return cmd;
        }).ConfigureAwait(false);
        return rows > 0;
    }
}