using Backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

public class UsuarioRepository(OracleConnection db) : IUsuarioRepository
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

        await db.OpenAsync();
        try
        {
            using var cmd    = new OracleCommand(sql, db);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                lista.Add(MapearFila(reader));
        }
        finally { await db.CloseAsync(); }

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

        await db.OpenAsync();
        try
        {
            using var cmd = new OracleCommand(sql, db);
            cmd.Parameters.Add("correo", correo);

            using var reader = await cmd.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapearFila(reader) : null;
        }
        finally { await db.CloseAsync(); }
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

        await db.OpenAsync();
        try
        {
            using var cmd = new OracleCommand(sql, db);
            AgregarParametros(cmd, usuario);
            await cmd.ExecuteNonQueryAsync();
        }
        finally { await db.CloseAsync(); }
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

        await db.OpenAsync();
        try
        {
            using var cmd = new OracleCommand(sql, db);
            // Asegura que se use el correo del path, no el del body
            usuario.CorreoInstitucional = correo;
            AgregarParametros(cmd, usuario);
            return await cmd.ExecuteNonQueryAsync() > 0;
        }
        finally { await db.CloseAsync(); }
    }

    // ------------------------------------------------------------------ //
    // DELETE                                                               //
    // ------------------------------------------------------------------ //
    public async Task<bool> EliminarAsync(string correo)
    {
        const string sql = "DELETE FROM USUARIOS WHERE CORREO_INSTITUCIONAL = :correo";

        await db.OpenAsync();
        try
        {
            using var cmd = new OracleCommand(sql, db);
            cmd.Parameters.Add("correo", correo);
            return await cmd.ExecuteNonQueryAsync() > 0;
        }
        finally { await db.CloseAsync(); }
    }

    // ------------------------------------------------------------------ //
    // Helpers privados                                                     //
    // ------------------------------------------------------------------ //
    private static Usuario MapearFila(System.Data.Common.DbDataReader r) => new()
    {
        CorreoInstitucional = r.GetString(0),
        PrimerNombre        = r.GetString(1),
        SegundoNombre       = r.IsDBNull(2) ? null : r.GetString(2),
        PrimerApellido      = r.GetString(3),
        SegundoApellido     = r.IsDBNull(4) ? null : r.GetString(4),
        Rol                 = r.GetString(5),
        Estado              = r.GetInt32(6),
    };

    private static void AgregarParametros(OracleCommand cmd, Usuario u)
    {
        cmd.Parameters.Add("correo",         u.CorreoInstitucional);
        cmd.Parameters.Add("primerNombre",   u.PrimerNombre);
        cmd.Parameters.Add("segundoNombre",  u.SegundoNombre   ?? (object)DBNull.Value);
        cmd.Parameters.Add("primerApellido", u.PrimerApellido);
        cmd.Parameters.Add("segundoApellido",u.SegundoApellido ?? (object)DBNull.Value);
        cmd.Parameters.Add("rol",            u.Rol);
        cmd.Parameters.Add("estado",         u.Estado);
    }
}
