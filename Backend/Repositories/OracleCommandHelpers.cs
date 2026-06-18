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
}
