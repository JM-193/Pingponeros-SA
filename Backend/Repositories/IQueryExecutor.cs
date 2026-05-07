using System.Data.Common;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal interface IQueryExecutor
{
    Task<T> QueryAsync<T>(Func<OracleConnection, OracleCommand> createCommand, Func<DbDataReader, Task<T>> map);
    Task<int> ExecuteAsync(Func<OracleConnection, OracleCommand> createCommand);
    Task<object?> ExecuteScalarAsync(Func<OracleConnection, OracleCommand> createCommand);
}
