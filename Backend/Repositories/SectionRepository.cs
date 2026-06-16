using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class SectionRepository : ISectionRepository
{
    private const string ParamNombre = ":nombre";
    private const string ColumnIdSeccion = "ID_SECCION";
    private const string ColumnIdArea = "ID_AREA";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";
    private const string ColumnEstado = "ESTADO";

    private readonly IQueryExecutor _q;

    public SectionRepository(IQueryExecutor q) => _q = q;

    private static Section MapearFila(System.Data.Common.DbDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal(ColumnIdSeccion)),
        IdArea = reader.IsDBNull(reader.GetOrdinal(ColumnIdArea)) ? null : reader.GetInt32(reader.GetOrdinal(ColumnIdArea)),
        Nombre = reader.IsDBNull(reader.GetOrdinal(ColumnNombre)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnNombre)),
        Descripcion = reader.IsDBNull(reader.GetOrdinal(ColumnDescripcion)) ? string.Empty : reader.GetString(reader.GetOrdinal(ColumnDescripcion)),
        Estado = reader.GetInt32(reader.GetOrdinal(ColumnEstado)),
    };

    public async Task<List<Section>> ObtenerTodasAsync()
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
            var secciones = new List<Section>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                secciones.Add(MapearFila(reader));
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

    public async Task<int> InsertarAsync(Section seccion)
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
            OracleCommandHelpers.AddStringParam(cmd, ParamNombre, seccion.Nombre);
            OracleCommandHelpers.AddStringParam(cmd, ":descripcion", seccion.Descripcion);
            cmd.Parameters.Add(":estado", seccion.Estado);
            cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output));
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<Section?> ObtenerPorNombreAsync(string nombre)
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
                return MapearFila(reader);
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Section seccion)
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
            OracleCommandHelpers.AddStringParam(cmd, ParamNombre, seccion.Nombre);
            OracleCommandHelpers.AddStringParam(cmd, ":descripcion", seccion.Descripcion);
            cmd.Parameters.Add(":estado", seccion.Estado);
            OracleCommandHelpers.AddStringParam(cmd, ":nombreOriginal", nombreOriginal);
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
