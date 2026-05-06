using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

#pragma warning disable CA1812 // Instanciado por el contenedor de DI
internal sealed class AreaRepository(OracleConnection connection) : IAreaRepository
{
    public async Task<List<Area>> ObtenerTodasAsync()
    {
        var areas = new List<Area>();
        const string query = "SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS ORDER BY NOMBRE";

        using var cmd = new OracleCommand(query, connection);
        try
        {
            await connection.OpenAsync().ConfigureAwait(false);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                areas.Add(new Area
                {
                    Id          = Convert.ToInt32(reader["ID_AREA"], CultureInfo.InvariantCulture),
                    Nombre      = reader["NOMBRE"].ToString() ?? "",
                    Descripcion = reader["DESCRIPCION"].ToString() ?? "",
                    Estado      = Convert.ToInt32(reader["ESTADO"], CultureInfo.InvariantCulture),
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
        const string query = "SELECT COUNT(*) FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre)";

        using var cmd = new OracleCommand(query, connection);
        cmd.Parameters.Add(":nombre", nombre);

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
        cmd.Parameters.Add(":nombre",      area.Nombre);
        cmd.Parameters.Add(":descripcion", area.Descripcion);
        cmd.Parameters.Add(":estado",      area.Estado);

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
}
