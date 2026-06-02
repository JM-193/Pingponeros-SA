using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class SeccionRepository : ISeccionRepository
{
    private const string ParamNombre = ":nombre";
    private readonly IQueryExecutor _q;

    public SeccionRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Seccion>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_SECCION, ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM SECCIONES ORDER BY NOMBRE",
                connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var secciones = new List<Seccion>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                secciones.Add(new Seccion
                {
                    Id = Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                });
            }
            return secciones;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM SECCIONES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
                connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }).ConfigureAwait(false);
        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<int> InsertarAsync(Seccion seccion)
    {
        ArgumentNullException.ThrowIfNull(seccion);

        const string query = """
            INSERT INTO SECCIONES (ID_AREA, NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:idArea, :nombre, :descripcion, :estado)
            RETURNING ID_SECCION INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", seccion.IdArea);
            cmd.Parameters.Add(ParamNombre, seccion.Nombre);
            cmd.Parameters.Add(":descripcion", seccion.Descripcion);
            cmd.Parameters.Add(":estado", seccion.Estado);
            cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output));
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Seccion?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_SECCION, ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM SECCIONES WHERE LOWER(NOMBRE) = LOWER(:nombre)",
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
                return new Seccion
                {
                    Id = Convert.ToInt32(reader["ID_SECCION"], CultureInfo.InvariantCulture),
                    IdArea = reader["ID_AREA"] is DBNull ? null : Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Seccion seccion)
    {
        ArgumentNullException.ThrowIfNull(seccion);

        const string query = """
            UPDATE SECCIONES
            SET ID_AREA = :idArea, NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal)
            """;

        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection) { BindByName = true };
            OracleCommandHelpers.AddNullableIntParam(cmd, ":idArea", seccion.IdArea);
            cmd.Parameters.Add(ParamNombre, seccion.Nombre);
            cmd.Parameters.Add(":descripcion", seccion.Descripcion);
            cmd.Parameters.Add(":estado", seccion.Estado);
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
                "UPDATE SECCIONES SET ESTADO = 0 WHERE ID_SECCION = :id AND ESTADO = 1",
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
