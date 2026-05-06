using System.Data.Common;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal interface IQueryExecutor
{
    Task<T> QueryAsync<T>(string sql, Func<DbDataReader, Task<T>> map, Action<OracleCommand>? configure = null);
    Task<int> ExecuteAsync(string sql, Action<OracleCommand>? configure = null);
    Task<object?> ExecuteScalarAsync(string sql, Action<OracleCommand>? configure = null);
}
