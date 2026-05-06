using System.Data.Common;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Backend.Repositories;

internal sealed class OracleQueryExecutor : IQueryExecutor
{
    private readonly IDbExecutor _db;

    public OracleQueryExecutor(IDbExecutor db) => _db = db;

    public async Task<T> QueryAsync<T>(string sql, Func<DbDataReader, Task<T>> map, Action<OracleCommand>? configure = null)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = new OracleCommand(sql, connection);
            configure?.Invoke(cmd);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            return await map(reader).ConfigureAwait(false);
        }).ConfigureAwait(false);
    }

    public async Task<int> ExecuteAsync(string sql, Action<OracleCommand>? configure = null)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = new OracleCommand(sql, connection);
            configure?.Invoke(cmd);
            return await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }).ConfigureAwait(false);
    }

    public async Task<object?> ExecuteScalarAsync(string sql, Action<OracleCommand>? configure = null)
    {
        return await _db.UsingConnectionAsync(async connection =>
        {
            using var cmd = new OracleCommand(sql, connection);
            configure?.Invoke(cmd);
            return await cmd.ExecuteScalarAsync().ConfigureAwait(false);
        }).ConfigureAwait(false);
    }
}
