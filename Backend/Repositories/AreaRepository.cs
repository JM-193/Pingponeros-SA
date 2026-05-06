using Oracle.ManagedDataAccess.Client;
using Backend.Models;

namespace Backend.Repositories;

public class AreaRepository(OracleConnection connection) : IAreaRepository
{
    public async Task<List<Area>> ObtenerTodasAsync()
    {
        var areas = new List<Area>();
        const string query = "SELECT NOMBRE, DESCRIPCION, ESTADO FROM AREAS ORDER BY NOMBRE";

        using var cmd = new OracleCommand(query, connection);
        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                areas.Add(new Area
                {
                    Nombre = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado = Convert.ToInt32(reader["ESTADO"]),
                });
            }
        }
        finally
        {
            if (connection.State == System.Data.ConnectionState.Open)
                connection.Close();
        }

        return areas;
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        const string query = "SELECT COUNT(*) FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre)";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(":nombre", nombre);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            var count = Convert.ToInt32(await cmd.ExecuteScalarAsync().ConfigureAwait(false));
            return count > 0;
        }
        finally
        {
            if (connection.State == System.Data.ConnectionState.Open)
                connection.Close();
        }
    }

    public async Task InsertarAsync(Area area)
    {
        const string query = @"
            INSERT INTO AREAS (NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:nombre, :descripcion, :estado)";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(":nombre", area.Nombre);
        cmd.Parameters.Add(":descripcion", area.Descripcion);
        cmd.Parameters.Add(":estado", area.Estado);

        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }
        finally
        {
            if (connection.State == System.Data.ConnectionState.Open)
                connection.Close();
        }
    }
}
