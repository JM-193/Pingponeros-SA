using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal static class OracleCommandHelpers
{
    internal static void AddNullableIntParam(OracleCommand cmd, string paramName, int? value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Int32)
        {
            Value = value.HasValue ? (object)value.Value : DBNull.Value
        };
        cmd.Parameters.Add(param);
    }

    internal static void AddInt32Param(OracleCommand cmd, string paramName, int value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Int32)
        {
            Value = value
        };
        cmd.Parameters.Add(param);
    }

    internal static void AddStringParam(OracleCommand cmd, string paramName, string? value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Varchar2)
        {
            Value = value is null ? DBNull.Value : value
        };
        cmd.Parameters.Add(param);
    }

    internal static void AddInt64Param(OracleCommand cmd, string paramName, long value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Int64)
        {
            Value = value
        };
        cmd.Parameters.Add(param);
    }

    // El número de plaza es un entero sin signo (NUMBER(20)). Se enlaza como Decimal porque
    // OracleDbType no tiene un tipo UInt64 y un valor > long.MaxValue desbordaría Int64;
    // decimal representa todo el rango de ulong sin pérdida.
    internal static void AddUInt64Param(OracleCommand cmd, string paramName, ulong value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Decimal)
        {
            Value = (decimal)value
        };
        cmd.Parameters.Add(param);
    }

    internal static void AddDateParam(OracleCommand cmd, string paramName, DateTime value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Date)
        {
            Value = value
        };
        cmd.Parameters.Add(param);
    }

    internal static void AddNullableDateParam(OracleCommand cmd, string paramName, DateTime? value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Date)
        {
            Value = value.HasValue ? (object)value.Value : DBNull.Value
        };
        cmd.Parameters.Add(param);
    }

    // table y column son siempre constantes internas; nunca provienen de entrada del usuario.
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "table and column are internal constants, never user input.")]
    internal static OracleCommand CreateCountByIdCommand(OracleConnection conn, string table, string column, int id)
    {
        var cmd = new OracleCommand($"SELECT COUNT(*) FROM {table} WHERE {column} = :id", conn)
        {
            BindByName = true,
        };
        cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32) { Value = id });
        return cmd;
    }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "table and column are internal constants, never user input.")]
    internal static OracleCommand CreateDeleteByIdCommand(OracleConnection conn, string table, string column, int id)
    {
        var cmd = new OracleCommand($"DELETE FROM {table} WHERE {column} = :id", conn)
        {
            BindByName = true,
        };
        cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32) { Value = id });
        return cmd;
    }
}
