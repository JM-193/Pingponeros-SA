using System.Data.Common;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal interface IQueryExecutor
{
    Task<T> QueryAsync<T>(Func<OracleConnection, OracleCommand> createCommand, Func<DbDataReader, Task<T>> map);

    /// <summary>
    /// Ejecuta un comando que devuelve un <c>SYS_REFCURSOR</c> (función/procedimiento de base de datos)
    /// y proyecta sus filas con <paramref name="map"/>. El comando debe incluir un parámetro
    /// <see cref="Oracle.ManagedDataAccess.Client.OracleDbType.RefCursor"/>.
    /// </summary>
    Task<T> QueryCursorAsync<T>(Func<OracleConnection, OracleCommand> createCommand, Func<DbDataReader, Task<T>> map);

    Task<int> ExecuteAsync(Func<OracleConnection, OracleCommand> createCommand);
    Task<object?> ExecuteScalarAsync(Func<OracleConnection, OracleCommand> createCommand);

    /// <summary>
    /// Ejecuta varias operaciones sobre una misma conexión dentro de una transacción. Hace
    /// <c>commit</c> al finalizar <paramref name="work"/> y <c>rollback</c> si lanza una excepción.
    /// </summary>
    Task ExecuteTransactionAsync(Func<OracleConnection, OracleTransaction, Task> work);
}
