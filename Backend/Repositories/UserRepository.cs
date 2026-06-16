// UserRepository.cs
using Backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Repositories;

internal sealed class UserRepository : IUserRepository
{
    private const string ColumnCorreoInstitucional = "CORREO_INSTITUCIONAL";
    private const string ColumnPrimerNombre = "PRIMER_NOMBRE";
    private const string ColumnSegundoNombre = "SEGUNDO_NOMBRE";
    private const string ColumnPrimerApellido = "PRIMER_APELLIDO";
    private const string ColumnSegundoApellido = "SEGUNDO_APELLIDO";
    private const string ColumnRol = "ROL";
    private const string ColumnEstado = "ESTADO";

    private readonly IQueryExecutor _q;

    public UserRepository(IQueryExecutor q) => _q = q;

    // ------------------------------------------------------------------ //
    // Helpers privados                                                     //
    // ------------------------------------------------------------------ //
    private static User MapearFila(System.Data.Common.DbDataReader r) => new()
    {
        CorreoInstitucional = r.GetString(r.GetOrdinal(ColumnCorreoInstitucional)),
        PrimerNombre = r.GetString(r.GetOrdinal(ColumnPrimerNombre)),
        SegundoNombre = r.IsDBNull(r.GetOrdinal(ColumnSegundoNombre)) ? null : r.GetString(r.GetOrdinal(ColumnSegundoNombre)),
        PrimerApellido = r.GetString(r.GetOrdinal(ColumnPrimerApellido)),
        SegundoApellido = r.IsDBNull(r.GetOrdinal(ColumnSegundoApellido)) ? null : r.GetString(r.GetOrdinal(ColumnSegundoApellido)),
        Rol = r.GetInt32(r.GetOrdinal(ColumnRol)),
        Estado = r.GetInt32(r.GetOrdinal(ColumnEstado)),
    };

    private static void AgregarParametros(OracleCommand cmd, User u)
    {
        OracleCommandHelpers.AddStringParam(cmd, "correo", u.CorreoInstitucional);
        OracleCommandHelpers.AddStringParam(cmd, "primerNombre", u.PrimerNombre);
        OracleCommandHelpers.AddStringParam(cmd, "segundoNombre", u.SegundoNombre);
        OracleCommandHelpers.AddStringParam(cmd, "primerApellido", u.PrimerApellido);
        OracleCommandHelpers.AddStringParam(cmd, "segundoApellido", u.SegundoApellido);
        OracleCommandHelpers.AddInt32Param(cmd, "rol", u.Rol);
        OracleCommandHelpers.AddInt32Param(cmd, "estado", u.Estado);
    }

    // ------------------------------------------------------------------ //
    // SELECT ALL                                                           //
    // ------------------------------------------------------------------ //
    public async Task<IEnumerable<User>> ObtenerTodosAsync()
    {
        const string sql = """
            SELECT CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                   PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO
            FROM   USUARIOS
            ORDER BY PRIMER_APELLIDO, PRIMER_NOMBRE
            """;

        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            return cmd;
        }, async reader =>
        {
            var lista = new List<User>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearFila(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // SELECT BY PK                                                         //
    // ------------------------------------------------------------------ //
    public async Task<User?> ObtenerPorCorreoAsync(string correo)
    {
        const string sql = """
            SELECT CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                   PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO
            FROM   USUARIOS
            WHERE  CORREO_INSTITUCIONAL = :correo
            """;

        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            return cmd;
        }, async reader =>
        {
            return await reader.ReadAsync().ConfigureAwait(false) ? MapearFila(reader) : null;
        }).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // INSERT                                                               //
    // ------------------------------------------------------------------ //
    public async Task InsertarAsync(User usuario)
    {
        const string sql = """
            INSERT INTO USUARIOS
                (CORREO_INSTITUCIONAL, PRIMER_NOMBRE, SEGUNDO_NOMBRE,
                 PRIMER_APELLIDO, SEGUNDO_APELLIDO, ROL, ESTADO)
            VALUES
                (:correo, :primerNombre, :segundoNombre,
                 :primerApellido, :segundoApellido, :rol, :estado)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            AgregarParametros(cmd, usuario);
            return cmd;
        }).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // INSERT USUARIO + CONTRASEÑA TEMPORAL (transaccional)                //
    // ------------------------------------------------------------------ //
    public async Task InsertarConContrasenaAsync(User usuario, string contrasenaHash)
    {
        // Insertar usuario
        await InsertarAsync(usuario).ConfigureAwait(false);

        // Insertar contraseña
        await InsertarContraseñaAsync(usuario.CorreoInstitucional, contrasenaHash).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // INSERT CONTRASEÑA TEMPORAL (válida por 2 días)                     //
    // ------------------------------------------------------------------ //
    public async Task InsertarContraseñaAsync(string correo, string contrasenaHash)
    {
        const string sql = """
            INSERT INTO CONTRASENAS
                (CORREO_INSTITUCIONAL, CONTRASENA_HASH, FECHA_CREACION, FECHA_EXPIRACION, ES_TEMPORAL)
            VALUES
                (:correo, :hash, SYSDATE, SYSDATE + 2, 1)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            OracleCommandHelpers.AddStringParam(cmd, "hash", contrasenaHash);
            return cmd;
        }).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // CAMBIAR CONTRASEÑA (válida por 90 días)                            //
    // ------------------------------------------------------------------ //
    public async Task ChangePasswordAsync(string correo, string contrasenaHash)
    {
        const string sql = """
            INSERT INTO CONTRASENAS
                (CORREO_INSTITUCIONAL, CONTRASENA_HASH, FECHA_CREACION, FECHA_EXPIRACION, ES_TEMPORAL)
            VALUES
                (:correo, :hash, SYSDATE, SYSDATE + 90, 0)
            """;

        await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            OracleCommandHelpers.AddStringParam(cmd, "hash", contrasenaHash);
            return cmd;
        }).ConfigureAwait(false);
    }

    // ------------------------------------------------------------------ //
    // GET HASH MÁS RECIENTE                                               //
    // ------------------------------------------------------------------ //
    public async Task<Password?> ObtenerContrasenaMasRecienteAsync(string correo)
    {
        const string sql = """
            SELECT CONTRASENA_HASH, FECHA_EXPIRACION, ES_TEMPORAL
            FROM   CONTRASENAS
            WHERE  CORREO_INSTITUCIONAL = :correo
            ORDER BY FECHA_CREACION DESC
            FETCH FIRST 1 ROWS ONLY
            """;

        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            return cmd;
        }, async reader =>
        {
            if (!await reader.ReadAsync().ConfigureAwait(false))
                return null;

            return new Password
            {
                Hash = reader.GetString(0),
                FechaExpiracion = reader.GetDateTime(1),
                EsTemporal = reader.GetInt32(2) == 1,
            };
        }).ConfigureAwait(false);
    }

    public async Task<string?> ObtenerHashMasRecienteAsync(string correo)
    {
        var contrasena = await ObtenerContrasenaMasRecienteAsync(correo).ConfigureAwait(false);
        return contrasena?.Hash;
    }

    // ------------------------------------------------------------------ //
    // UPDATE                                                               //
    // ------------------------------------------------------------------ //
    public async Task<bool> ActualizarAsync(string correo, User usuario)
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

        var updated = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection)
            {
                BindByName = true,
            };
            // Asegura que se use el correo del path, no el del body
            usuario.CorreoInstitucional = correo;
            AgregarParametros(cmd, usuario);
            return cmd;
        }).ConfigureAwait(false);
        return updated > 0;
    }

    // ------------------------------------------------------------------ //
    // DELETE                                                               //
    // ------------------------------------------------------------------ //
    public async Task<bool> EliminarAsync(string correo)
    {
        const string sqlUsuario = "UPDATE USUARIOS SET ESTADO = 0 WHERE CORREO_INSTITUCIONAL = :correo";

        var filas = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sqlUsuario, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            return cmd;
        }).ConfigureAwait(false);
        return filas > 0;
    }

    public async Task<bool> DesactivarPorContrasenaTemporalExpiradaAsync(string correo)
    {
        const string sqlUsuario = "UPDATE USUARIOS SET ESTADO = 0 WHERE CORREO_INSTITUCIONAL = :correo AND ESTADO = 1";

        var filas = await _q.ExecuteAsync(connection =>
        {
            var cmd = new OracleCommand(sqlUsuario, connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, nameof(correo), correo);
            return cmd;
        }).ConfigureAwait(false);
        return filas > 0;
    }
}
