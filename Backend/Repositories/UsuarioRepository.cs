using Backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

#pragma warning disable CA1812 // Instanciado por el contenedor de DI
internal sealed class UsuarioRepository(OracleConnection db) : IUsuarioRepository
{
    // ------------------------------------------------------------------ //
    // SELECT ALL                                                           //
    // ------------------------------------------------------------------ //
    public async Task<IEnumerable<Usuario>> ObtenerTodosAsync()
    {
        const string sql = """
            SELECT CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                   PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO
            FROM   USUARIOS
            ORDER BY PRIMER_APELLIDO, PRIMER_NOMBRE
            """;

        var lista = new List<Usuario>();

        await db.OpenAsync().ConfigureAwait(false);
        try
        {
            using var cmd = new OracleCommand(sql, db);
            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);

            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearFila(reader));
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }

        return lista;
    }

    // ------------------------------------------------------------------ //
    // SELECT BY PK                                                         //
    // ------------------------------------------------------------------ //
    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo)
    {
        const string sql = """
            SELECT CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                   PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO
            FROM   USUARIOS
            WHERE  CORREO_INSTITUCIONAL = :correo
            """;

        await db.OpenAsync().ConfigureAwait(false);
        try
        {
            using var cmd = new OracleCommand(sql, db);
            cmd.Parameters.Add("correo", correo);

            using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            return await reader.ReadAsync().ConfigureAwait(false) ? MapearFila(reader) : null;
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // INSERT                                                               //
    // ------------------------------------------------------------------ //
    public async Task InsertarAsync(Usuario usuario)
    {
        const string sql = """
            INSERT INTO USUARIOS
                (CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                 PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO)
            VALUES
                (:correo, :primerNombre, :segundoNombre,
                 :primerApellido, :segundoApellido, :rol, :estado)
            """;

        await db.OpenAsync().ConfigureAwait(false);
        try
        {
            using var cmd = new OracleCommand(sql, db);
            AgregarParametros(cmd, usuario);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // INSERT USUARIO + CONTRASEÑA TEMPORAL (transaccional)                //
    // ------------------------------------------------------------------ //
    public async Task InsertarConContrasenaAsync(Usuario usuario, string contrasenaHash)
    {
        const string sqlUsuario = """
            INSERT INTO USUARIOS
                (CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                 PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO)
            VALUES
                (:correo, :primerNombre, :segundoNombre,
                 :primerApellido, :segundoApellido, :rol, :estado)
            """;

        const string sqlContrasena = """
            INSERT INTO CONTRASENAS
                (CORREO_INSTITUCIONAL, CONTRASENA_HASH,
                 FECHA_CREACION, FECHA_EXPIRACION)
            VALUES
                (:correo, :hash, :fechaCreacion, :fechaExpiracion)
            """;

        await db.OpenAsync().ConfigureAwait(false);
        using var transaction = (Oracle.ManagedDataAccess.Client.OracleTransaction)
            await db.BeginTransactionAsync().ConfigureAwait(false);
        try
        {
            using var cmdUsuario = new OracleCommand(sqlUsuario, db);
            cmdUsuario.Transaction = transaction;
            AgregarParametros(cmdUsuario, usuario);
            await cmdUsuario.ExecuteNonQueryAsync().ConfigureAwait(false);

            var ahora = DateTime.UtcNow;

            using var cmdContrasena = new OracleCommand(sqlContrasena, db);
            cmdContrasena.Transaction = transaction;
            cmdContrasena.Parameters.Add("correo", usuario.CorreoInstitucional);
            cmdContrasena.Parameters.Add("hash",   contrasenaHash);
            cmdContrasena.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter("fechaCreacion",   Oracle.ManagedDataAccess.Client.OracleDbType.Date) { Value = ahora });
            cmdContrasena.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter("fechaExpiracion", Oracle.ManagedDataAccess.Client.OracleDbType.Date) { Value = ahora.AddHours(48) });
            await cmdContrasena.ExecuteNonQueryAsync().ConfigureAwait(false);

            await transaction.CommitAsync().ConfigureAwait(false);
        }
        catch
        {
            await transaction.RollbackAsync().ConfigureAwait(false);
            throw;
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // GET HASH MÁS RECIENTE                                               //
    // ------------------------------------------------------------------ //
    public async Task<string?> ObtenerHashMasRecienteAsync(string correo)
    {
        const string sql = """
            SELECT CONTRASENA_HASH
            FROM   CONTRASENAS
            WHERE  CORREO_INSTITUCIONAL = :correo
            ORDER BY FECHA_CREACION DESC
            FETCH FIRST 1 ROWS ONLY
            """;

        await db.OpenAsync().ConfigureAwait(false);
        try
        {
            using var cmd = new OracleCommand(sql, db);
            cmd.Parameters.Add("correo", correo);
            var result = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
            return result is DBNull or null ? null : (string)result;
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // UPDATE                                                               //
    // ------------------------------------------------------------------ //
    public async Task<bool> ActualizarAsync(string correo, Usuario usuario)
    {
        const string sql = """
            UPDATE USUARIOS SET
                PRIMER_NOMBRE    = :primerNombre,
                SEGUNDO_NOMBRE   = :segundoNombre,
                PRIMER_APELLIDO  = :primerApellido,
                SEGUNDO_APELLIDO = :segundoApellido,
                ROL              = :rol,
                ESTADO           = :estado
            WHERE CORREO_INSTITUCIONAL = :correo
            """;

        await db.OpenAsync().ConfigureAwait(false);
        try
        {
            using var cmd = new OracleCommand(sql, db);
            // Asegura que se use el correo del path, no el del body
            usuario.CorreoInstitucional = correo;
            AgregarParametros(cmd, usuario);
            return await cmd.ExecuteNonQueryAsync().ConfigureAwait(false) > 0;
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // DELETE                                                               //
    // ------------------------------------------------------------------ //
    public async Task<bool> EliminarAsync(string correo)
    {
        const string sqlContrasena = "DELETE FROM CONTRASENAS WHERE CORREO_INSTITUCIONAL = :correo";
        const string sqlUsuario    = "DELETE FROM USUARIOS    WHERE CORREO_INSTITUCIONAL = :correo";

        await db.OpenAsync().ConfigureAwait(false);
        using var transaction = (Oracle.ManagedDataAccess.Client.OracleTransaction)
            await db.BeginTransactionAsync().ConfigureAwait(false);
        try
        {
            using var cmdC = new OracleCommand(sqlContrasena, db);
            cmdC.Transaction = transaction;
            cmdC.Parameters.Add("correo", correo);
            await cmdC.ExecuteNonQueryAsync().ConfigureAwait(false);

            using var cmdU = new OracleCommand(sqlUsuario, db);
            cmdU.Transaction = transaction;
            cmdU.Parameters.Add("correo", correo);
            var filas = await cmdU.ExecuteNonQueryAsync().ConfigureAwait(false);

            await transaction.CommitAsync().ConfigureAwait(false);
            return filas > 0;
        }
        catch
        {
            await transaction.RollbackAsync().ConfigureAwait(false);
            throw;
        }
        finally { await db.CloseAsync().ConfigureAwait(false); }
    }

    // ------------------------------------------------------------------ //
    // Helpers privados                                                     //
    // ------------------------------------------------------------------ //
    private static Usuario MapearFila(System.Data.Common.DbDataReader r) => new()
    {
        CorreoInstitucional = r.GetString(0),
        PrimerNombre = r.GetString(1),
        SegundoNombre = r.IsDBNull(2) ? null : r.GetString(2),
        PrimerApellido = r.GetString(3),
        SegundoApellido = r.IsDBNull(4) ? null : r.GetString(4),
        Rol = r.GetInt32(5),
        Estado = r.GetInt32(6),
    };

    private static void AgregarParametros(OracleCommand cmd, Usuario u)
    {
        cmd.Parameters.Add("correo", u.CorreoInstitucional);
        cmd.Parameters.Add("primerNombre", u.PrimerNombre);
        cmd.Parameters.Add("segundoNombre", u.SegundoNombre ?? (object)DBNull.Value);
        cmd.Parameters.Add("primerApellido", u.PrimerApellido);
        cmd.Parameters.Add("segundoApellido", u.SegundoApellido ?? (object)DBNull.Value);
        cmd.Parameters.Add("rol", u.Rol);
        cmd.Parameters.Add("estado", u.Estado);
    }
}
