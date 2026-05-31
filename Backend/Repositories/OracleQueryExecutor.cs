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
            var scalar = await cmd.ExecuteScalarAsync().ConfigureAwait(false);

            // Para DML con RETURNING INTO, ODP.NET no devuelve el valor a través de ExecuteScalar
            // sino que lo deposita en el parámetro de salida. Si el escalar es nulo, se retorna
            // el primer parámetro de tipo Output/ReturnValue que tenga valor.
            if (scalar is null or DBNull)
            {
                foreach (OracleParameter p in cmd.Parameters)
                {
                    if (p.Direction is ParameterDirection.Output or ParameterDirection.ReturnValue)
                        return p.Value;
                }
            }

            return scalar;
        }).ConfigureAwait(false);
    }
}
