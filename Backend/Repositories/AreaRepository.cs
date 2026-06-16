using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class AreaRepository : IAreaRepository
{
    private const string ParamNombre = ":nombre";
    private const string ColumnIdArea = "ID_AREA";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";
    private const string ColumnEstado = "ESTADO";
    
    private readonly IQueryExecutor _q;

    public AreaRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Area>> ObtenerTodasAsync()
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand("SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS ORDER BY NOMBRE", connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var areas = new List<Area>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                areas.Add(new Area
                {
                    Id = Convert.ToInt32(reader[ColumnIdArea], CultureInfo.InvariantCulture),
                    Nombre = reader[ColumnNombre].ToString() ?? "",
                    Descripcion = reader[ColumnDescripcion].ToString() ?? "",
                    Estado = Convert.ToInt32(reader[ColumnEstado], CultureInfo.InvariantCulture),
                });
            }
            return areas;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ExisteNombreAsync(string nombre)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand("SELECT COUNT(*) FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre)", connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }).ConfigureAwait(false);
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

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, area.Nombre);
            cmd.Parameters.Add(":descripcion", area.Descripcion);
            cmd.Parameters.Add(":estado", area.Estado);
            var idParam = new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output);
            cmd.Parameters.Add(idParam);
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Area?> ObtenerPorNombreAsync(string nombre)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand("SELECT ID_AREA, NOMBRE, DESCRIPCION, ESTADO FROM AREAS WHERE LOWER(NOMBRE) = LOWER(:nombre)", connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, nombre);
            return cmd;
        }, async reader =>
        {
            if (await reader.ReadAsync().ConfigureAwait(false))
            {
                return new Area
                {
                    Id = Convert.ToInt32(reader[ColumnIdArea], CultureInfo.InvariantCulture),
                    Nombre = reader[ColumnNombre].ToString() ?? "",
                    Descripcion = reader[ColumnDescripcion].ToString() ?? "",
                    Estado = Convert.ToInt32(reader[ColumnEstado], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Area area)
    {
        ArgumentNullException.ThrowIfNull(area);

        const string query = """
            UPDATE AREAS
            SET NOMBRE = :nombre, DESCRIPCION = :descripcion, ESTADO = :estado
            WHERE LOWER(NOMBRE) = LOWER(:nombreOriginal)
            """;

        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(query, connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(ParamNombre, area.Nombre);
            cmd.Parameters.Add(":descripcion", area.Descripcion);
            cmd.Parameters.Add(":estado", area.Estado);
            cmd.Parameters.Add(":nombreOriginal", nombreOriginal);
            return cmd;
        }).ConfigureAwait(false);

        return rows > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        var rows = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand("UPDATE AREAS SET ESTADO = 0 WHERE ID_AREA = :id AND ESTADO = 1", connection)
            {
                BindByName = true,
            };
            cmd.Parameters.Add(":id", id);
            return cmd;
        }).ConfigureAwait(false);
        return rows > 0;
    }
}
