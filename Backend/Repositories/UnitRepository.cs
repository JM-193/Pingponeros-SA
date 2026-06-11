using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class UnitRepository : IUnitRepository
{
    private const string ParamNombre = ":nombre";
    private readonly IQueryExecutor _q;

    public UnitRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Unidad>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_UNIDAD, ID_AREA, ID_DEPARTAMENTO, ID_SECCION, NOMBRE, DESCRIPCION, ESTADO FROM UNIDADES ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var unidades = new List<Unidad>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                unidades.Add(new Unidad
                {
                    Id = Convert.ToInt32(reader["ID_UNIDAD"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    IdDepartamento = reader["ID_DEPARTAMENTO"] is DBNull ? null : Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdSeccion = reader["ID_SECCION"] is DBNull ? null : Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                });
            }
            return unidades;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM UNIDADES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<int> InsertarAsync(Unidad unidad)
    {
        ArgumentNullException.ThrowIfNull(unidad);

        const string query = """
            INSERT INTO UNIDADES (ID_AREA, ID_DEPARTAMENTO, ID_SECCION, NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:idArea, :idDepartamento, :idSeccion, :nombre, :descripcion, :estado)
            RETURNING ID_UNIDAD INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", unidad.IdArea);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", unidad.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", unidad.IdSeccion);
            cmd.Parameters.Add(ParamNombre, unidad.Nombre);
            cmd.Parameters.Add(":descripcion", unidad.Descripcion);
            cmd.Parameters.Add(":estado", unidad.Estado);
            cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output));
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Unidad?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_UNIDAD, ID_AREA, ID_DEPARTAMENTO, ID_SECCION, NOMBRE, DESCRIPCION, ESTADO FROM UNIDADES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
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
                return new Unidad
                {
                    Id = Convert.ToInt32(reader["ID_UNIDAD"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    IdDepartamento = reader["ID_DEPARTAMENTO"] is DBNull ? null : Convert.ToInt32(reader["ID_DEPARTAMENTO"], CultureInfo.InvariantCulture),
                    IdSeccion = reader["ID_SECCION"] is DBNull ? null : Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Unidad unidad)
    {
        ArgumentNullException.ThrowIfNull(unidad);

        const string query = """
            UPDATE UNIDADES
            SET ID_AREA = :idArea, ID_DEPARTAMENTO = :idDepartamento, ID_SECCION = :idSeccion,
                NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal)
            """;

        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", unidad.IdArea);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idDepartamento", unidad.IdDepartamento);
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idSeccion", unidad.IdSeccion);
            cmd.Parameters.Add(ParamNombre, unidad.Nombre);
            cmd.Parameters.Add(":descripcion", unidad.Descripcion);
            cmd.Parameters.Add(":estado", unidad.Estado);
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
                "UPDATE UNIDADES SET ESTADO = 0 WHERE ID_UNIDAD = :id AND ESTADO = 1",
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
