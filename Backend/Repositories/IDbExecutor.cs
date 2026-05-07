using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Backend.Repositories;

internal interface IDbExecutor
{
    Task<T> UsingConnectionAsync<T>(Func<OracleConnection, Task<T>> work);
    Task UsingConnectionAsync(Func<OracleConnection, Task> work);
}
