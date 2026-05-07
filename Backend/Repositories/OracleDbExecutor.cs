using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Backend.Repositories;

internal sealed class OracleDbExecutor : IDbExecutor
{
    private readonly OracleConnection _connection;

    public OracleDbExecutor(OracleConnection connection)
    {
        _connection = connection;
    }

    public async Task<T> UsingConnectionAsync<T>(Func<OracleConnection, Task<T>> work)
    {
        try
        {
            await _connection.OpenAsync().ConfigureAwait(false);
            return await work(_connection).ConfigureAwait(false);
        }
        finally
        {
            if (_connection.State == ConnectionState.Open)
                await _connection.CloseAsync().ConfigureAwait(false);
        }
    }

    public async Task UsingConnectionAsync(Func<OracleConnection, Task> work)
    {
        try
        {
            await _connection.OpenAsync().ConfigureAwait(false);
            await work(_connection).ConfigureAwait(false);
        }
        finally
        {
            if (_connection.State == ConnectionState.Open)
                await _connection.CloseAsync().ConfigureAwait(false);
        }
    }
}
