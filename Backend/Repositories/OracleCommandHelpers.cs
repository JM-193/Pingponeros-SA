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
}
