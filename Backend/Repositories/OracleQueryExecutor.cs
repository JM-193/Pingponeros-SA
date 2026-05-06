using System.Data.Common;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Backend.Repositories;

internal sealed class OracleQueryExecutor : IQueryExecutor
{
    private readonly IDbExecutor _db;

    public OracleQueryExecutor(IDbExecutor db) => _db = db;

    public async Task<T> QueryAsync<T>(Func<OracleConnection, OracleCommand> createCommand, Func<DbDataReader, Task<T>> map)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = createCommand(connection);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            return await map(reader).ConfigureAwait(false);
        }).ConfigureAwait(false);
    }

    public async Task<int> ExecuteAsync(Func<OracleConnection, OracleCommand> createCommand)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = createCommand(connection);
            return await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }).ConfigureAwait(false);
    }

    public async Task<object?> ExecuteScalarAsync(Func<OracleConnection, OracleCommand> createCommand)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = createCommand(connection);
            return await cmd.ExecuteScalarAsync().ConfigureAwait(false);
        }).ConfigureAwait(false);
    }
}
