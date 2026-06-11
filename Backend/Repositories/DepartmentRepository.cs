using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class DepartmentRepository : IDepartmentRepository
{
    private const string ParamNombre = ":nombre";
    private readonly IQueryExecutor _q;

    public DepartmentRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Department>> ObtenerTodosAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_DEPARTAMENTO, ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM DEPARTAMENTOS ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var departamentos = new List<Department>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                departamentos.Add(new Department
                {
                    Id = Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                });
            }
            return departamentos;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM DEPARTAMENTOS WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<int> InsertarAsync(Department departamento)
    {
        ArgumentNullException.ThrowIfNull(departamento);

        const string query = """
            INSERT INTO DEPARTAMENTOS (ID_AREA, NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:idArea, :nombre, :descripcion, :estado)
            RETURNING ID_DEPARTAMENTO INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", departamento.IdArea);
            cmd.Parameters.Add(ParamNombre, departamento.Nombre);
            cmd.Parameters.Add(":descripcion", departamento.Descripcion);
            cmd.Parameters.Add(":estado", departamento.Estado);
            cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output));
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Department?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_DEPARTAMENTO, ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM DEPARTAMENTOS WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }, async reader =>
        {
            if (await reader.ReadAsync().ConfigureAwait(false))
            {
                return new Department
                {
                    Id = Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Department departamento)
    {
        ArgumentNullException.ThrowIfNull(departamento);

        const string query = """
            UPDATE DEPARTAMENTOS
            SET ID_AREA = :idArea, NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal)
            """;

        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", departamento.IdArea);
            cmd.Parameters.Add(ParamNombre, departamento.Nombre);
            cmd.Parameters.Add(":descripcion", departamento.Descripcion);
            cmd.Parameters.Add(":estado", departamento.Estado);
            cmd.Parameters.Add(":nombreOriginal", nombreOriginal);
            return cmd;
        }).ConfigureAwait(false);

        return rows > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(
                "UPDATE DEPARTAMENTOS SET ESTADO = 0 WHERE ID_DEPARTAMENTO = :id AND ESTADO = 1",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(":id", id);
            return cmd;
        }).ConfigureAwait(false);
        return rows > 0;
    }
}
