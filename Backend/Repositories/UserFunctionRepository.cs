using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class UserFunctionRepository : IUserFunctionRepository
{
    private const string ColumnIdFuncionPropia = "ID_FUNCION_PROPIA";
    private const string ColumnCorreo = "CORREO_INSTITUCIONAL";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";

    private readonly IQueryExecutor _q;

    public UserFunctionRepository(IQueryExecutor q) => _q = q;

    private static UserFunction MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal(ColumnIdFuncionPropia)),
        CorreoInstitucional = reader.IsDBNull(reader.GetOrdinal(ColumnCorreo)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnCorreo)),
        Nombre = reader.IsDBNull(reader.GetOrdinal(ColumnNombre)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnNombre)),
        Descripcion = reader.IsDBNull(reader.GetOrdinal(ColumnDescripcion)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnDescripcion)),
    };

    public async Task<List<UserFunction>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_FUNCION_PROPIA, CORREO_INSTITUCIONAL, NOMBRE, DESCRIPCION FROM FUNCIONES_USUARIOS ORDER BY CORREO_INSTITUCIONAL, NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var funciones = new List<UserFunction>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                funciones.Add(MapearFila(reader));
            }
            return funciones;
        }).ConfigureAwait(false);
    }

    public async Task<List<UserFunction>> ObtenerPorCorreoAsync(string correo)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_FUNCION_PROPIA, CORREO_INSTITUCIONAL, NOMBRE, DESCRIPCION FROM FUNCIONES_USUARIOS WHERE LOWER(CORREO_INSTITUCIONAL) = LOWER(:correo) ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            return cmd;
        }, async reader =>
        {
            var funciones = new List<UserFunction>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                funciones.Add(MapearFila(reader));
            }
            return funciones;
        }).ConfigureAwait(false);
    }

    public async Task<int> InsertarAsync(UserFunction funcion)
    {
        ArgumentNullException.ThrowIfNull(funcion);

        const string query = """
            INSERT INTO FUNCIONES_USUARIOS (CORREO_INSTITUCIONAL, NOMBRE, DESCRIPCION)
            VALUES (:correo, :nombre, :descripcion)
            RETURNING ID_FUNCION_PROPIA INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddStringParam(cmd, ":correo", funcion.CorreoInstitucional);
            OracleCommandHelpers.AddStringParam(cmd, ":nombre", funcion.Nombre);
            OracleCommandHelpers.AddStringParam(cmd, ":descripcion", funcion.Descripcion);
            var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<bool> EstaEnActividadesAsync(int id)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
            OracleCommandHelpers.CreateCountByIdCommand(connection, "ACTIVIDADES", "ID_FUNCION_PROPIA", id)
        ).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var rows = await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateDeleteByIdCommand(connection, "FUNCIONES_USUARIOS", "ID_FUNCION_PROPIA", id)
        ).ConfigureAwait(false);
        return rows > 0;
    }
}
