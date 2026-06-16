using System.Data;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class UnitRepository : IUnitRepository
{
    private const string ParamNombre = ":nombre";
    private const string ColumnIdUnidad = "ID_UNIDAD";
    private const string ColumnIdArea = "ID_AREA";
    private const string ColumnIdDepartamento = "ID_DEPARTAMENTO";
    private const string ColumnIdSeccion = "ID_SECCION";
    private const string ColumnNombre = "NOMBRE";
    private const string ColumnDescripcion = "DESCRIPCION";
    private const string ColumnEstado = "ESTADO";

    private readonly IQueryExecutor _q;

    public UnitRepository(IQueryExecutor q) => _q = q;

    public async Task<List<Unit>> ObtenerTodasAsync()
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
            var unidades = new List<Unit>();
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                unidades.Add(new Unit
                {
                    Id = Convert.ToInt32(reader[ColumnIdUnidad], CultureInfo.InvariantCulture),
                    IdArea = reader[ColumnIdArea] is DBNull ? null : Convert.ToInt32(reader[ColumnIdArea], CultureInfo.InvariantCulture),
                    IdDepartamento = reader[ColumnIdDepartamento] is DBNull ? null : Convert.ToInt32(reader[ColumnIdDepartamento], CultureInfo.InvariantCulture),
                    IdSeccion = reader[ColumnIdSeccion] is DBNull ? null : Convert.ToInt32(reader[ColumnIdSeccion], CultureInfo.InvariantCulture),
                    Nombre = reader[ColumnNombre].ToString() ?? "",
                    Descripcion = reader[ColumnDescripcion].ToString() ?? "",
                    Estado = Convert.ToInt32(reader[ColumnEstado], CultureInfo.InvariantCulture),
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

    public async Task<int> InsertarAsync(Unit unidad)
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

    public async Task<Unit?> ObtenerPorNombreAsync(string nombre)
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
                return new Unit
                {
                    Id = Convert.ToInt32(reader[ColumnIdUnidad], CultureInfo.InvariantCulture),
                    IdArea = reader[ColumnIdArea] is DBNull ? null : Convert.ToInt32(reader[ColumnIdArea], CultureInfo.InvariantCulture),
                    IdDepartamento = reader[ColumnIdDepartamento] is DBNull ? null : Convert.ToInt32(reader[ColumnIdDepartamento], CultureInfo.InvariantCulture),
                    IdSeccion = reader[ColumnIdSeccion] is DBNull ? null : Convert.ToInt32(reader[ColumnIdSeccion], CultureInfo.InvariantCulture),
                    Nombre = reader[ColumnNombre].ToString() ?? "",
                    Descripcion = reader[ColumnDescripcion].ToString() ?? "",
                    Estado = Convert.ToInt32(reader[ColumnEstado], CultureInfo.InvariantCulture),
                };
            }
            return null;
        }).ConfigureAwait(false);
    }

    public async Task<bool> ActualizarAsync(string nombreOriginal, Unit unidad)
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
