using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

#pragma warning disable CA1812 // Instanciado por el contenedor de DI
internal sealed class AreaRepository(OracleConnection connection) : IAreaRepository
{
    private const string NombreParam = ":nombre";

    public async Task<List<Area>> ObtenerTodasAsync()
    {
        var areas = new List<Area>();
        const string query = "SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS WHERE ESTADO = 1 ORDER BY NOMBRE";

        using var cmd = new OracleCommand(query, connection);
        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                areas.Add(new Area
                {
                    Id = Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                });
            }
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }

        return areas;
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        const string query = "SELECT COUNT(*) FROM AREAS WHERE LOWER(NOMBRE) = LOWER(" + NombreParam + ") AND ESTADO = 1";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(NombreParam, nombre);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            var count = Convert.ToInt32(await cmd.ExecuteScalarAsync().ConfigureAwait(false), CultureInfo.InvariantCulture);
            return count > 0;
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }
    }

    public async Task<int> InsertarAsync(Area area)
    {
        ArgumentNullException.ThrowIfNull(area);

        const string query = """
            INSERT INTO AREAS (NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:nombre, :descripcion, :estado)
            RETURNING ID_AREA INTO :id
            """;

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(":nombre", area.Nombre);
        cmd.Parameters.Add(":descripcion", area.Descripcion);
        cmd.Parameters.Add(":estado", area.Estado);

        var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
        cmd.Parameters.Add(idParam);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return (int)(OracleDecimal)idParam.Value;
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }
    }

    public async Task<Area?> ObtenerPorNombreAsync(string nombre)
    {
        const string query = "SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS WHERE LOWER(NOMBRE) = LOWER(" + NombreParam + ") AND ESTADO = 1";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(NombreParam, nombre);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            if (await reader.ReadAsync().ConfigureAwait(false))
            {
                return new Area
                {
                    Id = Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Area area)
    {
        ArgumentNullException.ThrowIfNull(area);

        const string query = """
            UPDATE AREAS
            SET NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal) AND ESTADO = 1
            """;

        using var cmd = new OracleCommand(query, connection) { BindByName = true };
        cmd.Parameters.Add(":nombre", area.Nombre);
        cmd.Parameters.Add(":descripcion", area.Descripcion);
        cmd.Parameters.Add(":estado", area.Estado);
        cmd.Parameters.Add(":nombreOriginal", nombreOriginal);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            var rowsAffected = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return rowsAffected > 0;
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        const string query = "UPDATE AREAS SET ESTADO = 0 WHERE ID_AREA = :id AND ESTADO = 1";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(":id", id);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            var rowsAffected = await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return rowsAffected > 0;
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync().ConfigureAwait(false);
        }
    }
}
