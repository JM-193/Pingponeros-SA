using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal static class OracleCommandHelpers
{
    internal static void AddNullableIntParam(OracleCommand cmd, string paramName, int? value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Int32);
        param.Value = value.HasValue ? (object)value.Value : DBNull.Value;
        cmd.Parameters.Add(param);
    }

    internal static void AddStringParam(OracleCommand cmd, string paramName, string? value)
    {
        var param = new OracleParameter(paramName, OracleDbType.Varchar2);
        param.Value = value is null ? DBNull.Value : value;
        cmd.Parameters.Add(param);
    }
}
