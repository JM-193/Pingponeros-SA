using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class AreaRepository : IAreaRepository
{
    private const string ParamNombre = ":nombre";
    private readonly IQueryExecutor _q;

    public AreaRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Area>> ObtenerTodasAsync()
    {
        const string query = "SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS WHERE ESTADO = 1 ORDER BY NOMBRE";
        return await _q.QueryAsync(query, async reader =>
        {
            var areas = new List<Area>();
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
            return areas;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        const string query = "SELECT COUNT(*) FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre) AND ESTADO = 1";
        var result = await _q.ExecuteScalarAsync(query, cmd => cmd.Parameters.Add(ParamNombre, nombre)).ConfigureAwait(false);
        var count = Convert.ToInt32(result, CultureInfo.InvariantCulture);
        return count > 0;
    }

    public async Task<int> InsertarAsync(Area area)
    {
        ArgumentNullException.ThrowIfNull(area);

        const string query = """
            INSERT INTO AREAS (NOMBRE, DESCRIPCION, ESTADO)
            VALUES (:nombre, :descripcion, :estado)
            RETURNING ID_AREA INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(query, cmd =>
        {
            cmd.Parameters.Add(ParamNombre, area.Nombre);
            cmd.Parameters.Add(":descripcion", area.Descripcion);
            cmd.Parameters.Add(":estado", area.Estado);
            var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Area?> ObtenerPorNombreAsync(string nombre)
    {
        const string query = "SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre) AND ESTADO = 1";
        return await _q.QueryAsync(query, async reader =>
        {
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
        }, cmd => cmd.Parameters.Add(ParamNombre, nombre)).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Area area)
    {
        ArgumentNullException.ThrowIfNull(area);

        const string query = """
            UPDATE AREAS
            SET NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal) AND ESTADO = 1
            """;

        var rows = await _q.ExecuteAsync(query, cmd =>
        {
            cmd.BindByName = true;
            cmd.Parameters.Add(ParamNombre, area.Nombre);
            cmd.Parameters.Add(":descripcion", area.Descripcion);
            cmd.Parameters.Add(":estado", area.Estado);
            cmd.Parameters.Add(":nombreOriginal", nombreOriginal);
        }).ConfigureAwait(false);

        return rows > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        const string query = "UPDATE AREAS SET ESTADO = 0 WHERE ID_AREA = :id AND ESTADO = 1";
        var rows = await _q.ExecuteAsync(query, cmd => cmd.Parameters.Add(":id", id)).ConfigureAwait(false);
        return rows > 0;
    }
}
