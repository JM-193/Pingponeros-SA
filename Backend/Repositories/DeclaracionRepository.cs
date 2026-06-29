using System.Data;
using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Backend.Models;

namespace Backend.Repositories;

internal sealed class DeclaracionRepository : IDeclaracionRepository
{
    private static readonly string[] TablasHijas =
        ["ACTIVIDADES", "HORARIOS_LABORALES", "DESCANSOS", "HORAS_EXTRAS", "PERMISOS_AUSENCIA"];

    private readonly IQueryExecutor _q;

    public DeclaracionRepository(IQueryExecutor q) => _q = q;

    private static string? LeerStringOpcional(DbDataReader r, string columna)
    {
        var ordinal = r.GetOrdinal(columna);
        return r.IsDBNull(ordinal) ? null : r.GetString(ordinal);
    }

    // ---------------------------------------------------------------- //
    // Mapeos                                                            //
    // ---------------------------------------------------------------- //
    private static Declaracion MapearCabecera(DbDataReader r) => new()
    {
        Id = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
        NumeroPlaza = Convert.ToUInt64(r.GetValue(r.GetOrdinal("NUMERO_PLAZA")), CultureInfo.InvariantCulture),
        CorreoInstitucional = r.GetString(r.GetOrdinal("CORREO_INSTITUCIONAL")),
        FechaDeclaracion = r.GetDateTime(r.GetOrdinal("FECHA_DECLARACION")),
        Completa = r.GetInt32(r.GetOrdinal("COMPLETA")),
    };

    private static Actividad MapearActividad(DbDataReader r) => new()
    {
        Id = r.GetInt32(r.GetOrdinal("ID_ACTIVIDAD")),
        IdFuncion = r.IsDBNull(r.GetOrdinal("ID_FUNCION")) ? null : r.GetInt32(r.GetOrdinal("ID_FUNCION")),
        IdFuncionPropia = r.IsDBNull(r.GetOrdinal("ID_FUNCION_PROPIA")) ? null : r.GetInt32(r.GetOrdinal("ID_FUNCION_PROPIA")),
        TipoFuncion = r.GetString(r.GetOrdinal("TIPO_FUNCION")),
        Periodicidad = r.GetString(r.GetOrdinal("PERIODICIDAD")),
        VecesRealizadas = r.GetInt32(r.GetOrdinal("VECES_REALIZADAS")),
        Duracion = r.GetInt32(r.GetOrdinal("DURACION")),
        Nombre = r.IsDBNull(r.GetOrdinal("NOMBRE")) ? null : r.GetString(r.GetOrdinal("NOMBRE")),
        Descripcion = r.IsDBNull(r.GetOrdinal("DESCRIPCION")) ? null : r.GetString(r.GetOrdinal("DESCRIPCION")),
    };

    // ---------------------------------------------------------------- //
    // Consultas de estado                                              //
    // ---------------------------------------------------------------- //
    public async Task<int?> ObtenerIdActivaPorUsuarioAsync(string correo)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT ID_DECLARACION FROM DECLARACIONES_JURADAS WHERE LOWER(CORREO_INSTITUCIONAL) = LOWER(:correo) AND COMPLETA = 0 ORDER BY ID_DECLARACION FETCH FIRST 1 ROWS ONLY",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            return cmd;
        }).ConfigureAwait(false);

        return result is null or DBNull ? null : Convert.ToInt32(result, CultureInfo.InvariantCulture);
    }

    public async Task<bool> ExisteActivaPorUsuarioAsync(string correo)
    {
        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(
                "SELECT COUNT(*) FROM DECLARACIONES_JURADAS WHERE LOWER(CORREO_INSTITUCIONAL) = LOWER(:correo) AND COMPLETA = 0",
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            return cmd;
        }).ConfigureAwait(false);

        return Convert.ToInt32(result, CultureInfo.InvariantCulture) > 0;
    }

    public async Task<Declaracion?> ObtenerCabeceraAsync(int id)
    {
        return await _q.QueryAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection,
                "SELECT ID_DECLARACION, NUMERO_PLAZA, CORREO_INSTITUCIONAL, FECHA_DECLARACION, COMPLETA FROM DECLARACIONES_JURADAS WHERE ID_DECLARACION = :id",
                id),
            async reader => await reader.ReadAsync().ConfigureAwait(false) ? MapearCabecera(reader) : null
        ).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Crear / completar / cancelar                                     //
    // ---------------------------------------------------------------- //
    public async Task<int> CrearAsync(ulong numeroPlaza, string correo)
    {
        const string sql = """
            INSERT INTO DECLARACIONES_JURADAS (NUMERO_PLAZA, CORREO_INSTITUCIONAL, FECHA_DECLARACION, COMPLETA)
            VALUES (:numeroPlaza, :correo, SYSDATE, 0)
            RETURNING ID_DECLARACION INTO :id
            """;

        var result = await _q.ExecuteScalarAsync(connection =>
        {
            var cmd = new OracleCommand(sql, connection) { BindByName = true };
            OracleCommandHelpers.AddUInt64Param(cmd, ":numeroPlaza", numeroPlaza);
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            cmd.Parameters.Add(new OracleParameter(":id", OracleDbType.Int32, ParameterDirection.Output));
            return cmd;
        }).ConfigureAwait(false);

        return (int)(OracleDecimal)result!;
    }

    public async Task<bool> CompletarAsync(int id)
    {
        var rows = await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection,
                "UPDATE DECLARACIONES_JURADAS SET COMPLETA = 1 WHERE ID_DECLARACION = :id AND COMPLETA = 0",
                id)
        ).ConfigureAwait(false);
        return rows > 0;
    }

    public async Task<bool> CancelarAsync(int id)
    {
        // El trigger TRG_Cascade_Delete_Declaracion borra los hijos antes de eliminar la cabecera.
        var rows = await _q.ExecuteAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection,
                "DELETE FROM DECLARACIONES_JURADAS WHERE ID_DECLARACION = :id AND COMPLETA = 0",
                id)
        ).ConfigureAwait(false);
        return rows > 0;
    }

    // ---------------------------------------------------------------- //
    // Guardar borrador (reemplazo transaccional de hijos)              //
    // ---------------------------------------------------------------- //
    public async Task GuardarBorradorAsync(int id, DeclaracionDetalle detalle)
    {
        ArgumentNullException.ThrowIfNull(detalle);

        await _q.ExecuteTransactionAsync(async (connection, tx) =>
        {
            foreach (var tabla in TablasHijas)
            {
                await EjecutarAsync(connection, tx, $"DELETE FROM {tabla} WHERE ID_DECLARACION = :id",
                    cmd => OracleCommandHelpers.AddInt32Param(cmd, ":id", id)).ConfigureAwait(false);
            }

            if (detalle.Horario is { } horario)
            {
                await EjecutarAsync(connection, tx,
                    "INSERT INTO HORARIOS_LABORALES (ID_DECLARACION, HORA_ENTRADA, HORA_SALIDA, JORNADA_LABORAL) VALUES (:id, :entrada, :salida, :jornada)",
                    cmd =>
                    {
                        OracleCommandHelpers.AddInt32Param(cmd, ":id", id);
                        OracleCommandHelpers.AddStringParam(cmd, ":entrada", horario.HoraEntrada);
                        OracleCommandHelpers.AddStringParam(cmd, ":salida", horario.HoraSalida);
                        OracleCommandHelpers.AddStringParam(cmd, ":jornada", horario.JornadaLaboral);
                    }).ConfigureAwait(false);
            }

            if (detalle.Descanso is { } descanso)
            {
                await EjecutarAsync(connection, tx,
                    "INSERT INTO DESCANSOS (ID_DECLARACION, TIEMPO) VALUES (:id, :tiempo)",
                    cmd =>
                    {
                        OracleCommandHelpers.AddInt32Param(cmd, ":id", id);
                        OracleCommandHelpers.AddDecimalParam(cmd, ":tiempo", descanso.Tiempo);
                    }).ConfigureAwait(false);
            }

            if (detalle.HoraExtra is { } horaExtra)
            {
                await EjecutarAsync(connection, tx,
                    "INSERT INTO HORAS_EXTRAS (ID_DECLARACION, TIEMPO_ADICIONAL, JUSTIFICACION, CONOCIMIENTO_JEFATURA) VALUES (:id, :tiempo, :justificacion, :conocimiento)",
                    cmd =>
                    {
                        OracleCommandHelpers.AddInt32Param(cmd, ":id", id);
                        OracleCommandHelpers.AddDecimalParam(cmd, ":tiempo", horaExtra.TiempoAdicional);
                        OracleCommandHelpers.AddStringParam(cmd, ":justificacion", horaExtra.Justificacion);
                        OracleCommandHelpers.AddInt32Param(cmd, ":conocimiento", horaExtra.ConocimientoJefatura);
                    }).ConfigureAwait(false);
            }

            if (detalle.PermisoAusencia is { } permiso)
            {
                await EjecutarAsync(connection, tx,
                    "INSERT INTO PERMISOS_AUSENCIA (ID_DECLARACION, DIAS, JUSTIFICACION, CONOCIMIENTO_JEFATURA) VALUES (:id, :dias, :justificacion, :conocimiento)",
                    cmd =>
                    {
                        OracleCommandHelpers.AddInt32Param(cmd, ":id", id);
                        OracleCommandHelpers.AddDecimalParam(cmd, ":dias", permiso.Dias);
                        OracleCommandHelpers.AddStringParam(cmd, ":justificacion", permiso.Justificacion);
                        OracleCommandHelpers.AddInt32Param(cmd, ":conocimiento", permiso.ConocimientoJefatura);
                    }).ConfigureAwait(false);
            }

            // Inserta todas las actividades en una sola llamada (paquete PKG_DECLARACIONES, FORALL).
            if (detalle.Actividades.Count > 0)
                await InsertarActividadesAsync(connection, tx, id, detalle.Actividades).ConfigureAwait(false);
        }).ConfigureAwait(false);
    }

    private static async Task InsertarActividadesAsync(
        OracleConnection connection, OracleTransaction tx, int idDeclaracion, IReadOnlyList<Actividad> actividades)
    {
        using var cmd = new OracleCommand("PKG_DECLARACIONES.INSERTAR_ACTIVIDADES", connection)
        {
            CommandType = CommandType.StoredProcedure,
            BindByName = true,
            Transaction = tx,
        };
        OracleCommandHelpers.AddInt32Param(cmd, "p_id_declaracion", idDeclaracion);
        AgregarArrayNumber(cmd, "p_id_funcion", actividades.Select(a => (object?)a.IdFuncion).ToArray());
        AgregarArrayNumber(cmd, "p_id_funcion_propia", actividades.Select(a => (object?)a.IdFuncionPropia).ToArray());
        AgregarArrayTexto(cmd, "p_tipo_funcion", actividades.Select(a => a.TipoFuncion).ToArray());
        AgregarArrayTexto(cmd, "p_periodicidad", actividades.Select(a => a.Periodicidad).ToArray());
        AgregarArrayNumber(cmd, "p_veces_realizadas", actividades.Select(a => (object?)a.VecesRealizadas).ToArray());
        AgregarArrayNumber(cmd, "p_duracion", actividades.Select(a => (object?)a.Duracion).ToArray());
        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
    }

    // Enlaza un arreglo asociativo PL/SQL de NUMBER (los nulos se envían como DBNull → NULL).
    private static void AgregarArrayNumber(OracleCommand cmd, string nombre, object?[] valores)
    {
        cmd.Parameters.Add(new OracleParameter(nombre, OracleDbType.Int32)
        {
            Direction = ParameterDirection.Input,
            CollectionType = OracleCollectionType.PLSQLAssociativeArray,
            Size = valores.Length,
            Value = Array.ConvertAll(valores, v => v ?? (object)DBNull.Value),
        });
    }

    // Enlaza un arreglo asociativo PL/SQL de VARCHAR2.
    private static void AgregarArrayTexto(OracleCommand cmd, string nombre, string[] valores)
    {
        cmd.Parameters.Add(new OracleParameter(nombre, OracleDbType.Varchar2)
        {
            Direction = ParameterDirection.Input,
            CollectionType = OracleCollectionType.PLSQLAssociativeArray,
            Size = valores.Length,
            Value = valores,
        });
    }

    [SuppressMessage("Security", "CA2100:Review SQL queries for security vulnerabilities",
        Justification = "Todas las sentencias provienen de literales en tiempo de compilación; los valores de usuario se enlazan por parámetros.")]
    private static async Task EjecutarAsync(OracleConnection connection, OracleTransaction tx, string sql, Action<OracleCommand> bind)
    {
        using var cmd = new OracleCommand(sql, connection) { BindByName = true, Transaction = tx };
        bind(cmd);
        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Lectura del detalle e historial                                  //
    // ---------------------------------------------------------------- //
    public async Task<DeclaracionDetalle?> ObtenerDetalleAsync(int id)
    {
        var cabecera = await ObtenerCabeceraAsync(id).ConfigureAwait(false);
        if (cabecera is null)
            return null;

        var detalle = new DeclaracionDetalle { Declaracion = cabecera };

        // Datos de la plaza (cargo, clase ocupacional y lugar de trabajo) desde PLAZAS_USUARIOS.
        await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                """
                SELECT pt.NOMBRE AS CARGO, pu.CLASE_OCUPACIONAL, pu.LUGAR_TRABAJO
                FROM   PLAZAS_USUARIOS pu
                JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                WHERE  pu.NUMERO_PLAZA = :numeroPlaza
                AND    pu.CORREO_INSTITUCIONAL = :correo
                ORDER BY pu.FECHA_INICIO DESC
                FETCH FIRST 1 ROWS ONLY
                """,
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddUInt64Param(cmd, ":numeroPlaza", cabecera.NumeroPlaza);
            OracleCommandHelpers.AddStringParam(cmd, ":correo", cabecera.CorreoInstitucional);
            return cmd;
        }, async reader =>
        {
            if (await reader.ReadAsync().ConfigureAwait(false))
                AplicarDatosPlaza(reader, detalle);
            return true;
        }).ConfigureAwait(false);

        detalle.Horario = await LeerUnoAsync(
            "SELECT ID_HORARIO_LABORAL, ID_DECLARACION, HORA_ENTRADA, HORA_SALIDA, JORNADA_LABORAL FROM HORARIOS_LABORALES WHERE ID_DECLARACION = :id",
            id,
            r => new HorarioLaboral
            {
                Id = r.GetInt32(r.GetOrdinal("ID_HORARIO_LABORAL")),
                IdDeclaracion = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
                HoraEntrada = r.GetString(r.GetOrdinal("HORA_ENTRADA")),
                HoraSalida = r.GetString(r.GetOrdinal("HORA_SALIDA")),
                JornadaLaboral = r.GetString(r.GetOrdinal("JORNADA_LABORAL")),
            }).ConfigureAwait(false);

        detalle.Descanso = await LeerUnoAsync(
            "SELECT ID_DESCANSO, ID_DECLARACION, TIEMPO FROM DESCANSOS WHERE ID_DECLARACION = :id",
            id,
            r => new Descanso
            {
                Id = r.GetInt32(r.GetOrdinal("ID_DESCANSO")),
                IdDeclaracion = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
                Tiempo = r.GetDecimal(r.GetOrdinal("TIEMPO")),
            }).ConfigureAwait(false);

        detalle.HoraExtra = await LeerUnoAsync(
            "SELECT ID_HORAS_EXTRAS, ID_DECLARACION, TIEMPO_ADICIONAL, JUSTIFICACION, CONOCIMIENTO_JEFATURA FROM HORAS_EXTRAS WHERE ID_DECLARACION = :id",
            id,
            r => new HoraExtra
            {
                Id = r.GetInt32(r.GetOrdinal("ID_HORAS_EXTRAS")),
                IdDeclaracion = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
                TiempoAdicional = r.GetDecimal(r.GetOrdinal("TIEMPO_ADICIONAL")),
                Justificacion = r.GetString(r.GetOrdinal("JUSTIFICACION")),
                ConocimientoJefatura = r.GetInt32(r.GetOrdinal("CONOCIMIENTO_JEFATURA")),
            }).ConfigureAwait(false);

        detalle.PermisoAusencia = await LeerUnoAsync(
            "SELECT ID_PERMISO_AUSENCIA, ID_DECLARACION, DIAS, JUSTIFICACION, CONOCIMIENTO_JEFATURA FROM PERMISOS_AUSENCIA WHERE ID_DECLARACION = :id",
            id,
            r => new PermisoAusencia
            {
                Id = r.GetInt32(r.GetOrdinal("ID_PERMISO_AUSENCIA")),
                IdDeclaracion = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
                Dias = r.GetDecimal(r.GetOrdinal("DIAS")),
                Justificacion = r.GetString(r.GetOrdinal("JUSTIFICACION")),
                ConocimientoJefatura = r.GetInt32(r.GetOrdinal("CONOCIMIENTO_JEFATURA")),
            }).ConfigureAwait(false);

        detalle.Actividades = await _q.QueryAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection,
                """
                SELECT a.ID_ACTIVIDAD, a.ID_FUNCION, a.ID_FUNCION_PROPIA, a.TIPO_FUNCION,
                       a.PERIODICIDAD, a.VECES_REALIZADAS, a.DURACION,
                       COALESCE(f.NOMBRE, fu.NOMBRE) AS NOMBRE,
                       COALESCE(f.DESCRIPCION, fu.DESCRIPCION) AS DESCRIPCION
                FROM   ACTIVIDADES a
                LEFT JOIN FUNCIONES f           ON f.ID_FUNCION = a.ID_FUNCION
                LEFT JOIN FUNCIONES_USUARIOS fu ON fu.ID_FUNCION_PROPIA = a.ID_FUNCION_PROPIA
                WHERE  a.ID_DECLARACION = :id
                ORDER BY a.ID_ACTIVIDAD
                """,
                id),
            async reader =>
            {
                var lista = new List<Actividad>();
                while (await reader.ReadAsync().ConfigureAwait(false))
                    lista.Add(MapearActividad(reader));
                return lista;
            }).ConfigureAwait(false);

        return detalle;
    }

    [SuppressMessage("Security", "CA2100:Review SQL queries for security vulnerabilities",
        Justification = "El sql siempre es un literal en tiempo de compilación; el id va enlazado por parámetro.")]
    private async Task<T?> LeerUnoAsync<T>(string sql, int id, Func<DbDataReader, T> map) where T : class
    {
        return await _q.QueryAsync(connection =>
            OracleCommandHelpers.CreateByIdCommand(connection, sql, id),
            async reader => await reader.ReadAsync().ConfigureAwait(false) ? map(reader) : null
        ).ConfigureAwait(false);
    }

    public async Task<List<DeclaracionResumen>> ObtenerCompletasPorUsuarioAsync(string correo)
    {
        return await _q.QueryAsync(connection =>
        {
            var cmd = new OracleCommand(
                """
                SELECT d.ID_DECLARACION, d.NUMERO_PLAZA, d.FECHA_DECLARACION, d.COMPLETA,
                       (SELECT pt.NOMBRE
                        FROM   PLAZAS_USUARIOS pu
                        JOIN   PUESTOS_TRABAJO pt ON pt.ID_PUESTO = pu.ID_PUESTO
                        WHERE  pu.NUMERO_PLAZA = d.NUMERO_PLAZA
                        AND    pu.CORREO_INSTITUCIONAL = d.CORREO_INSTITUCIONAL
                        ORDER BY pu.FECHA_INICIO DESC
                        FETCH FIRST 1 ROWS ONLY) AS CARGO
                FROM   DECLARACIONES_JURADAS d
                WHERE  LOWER(d.CORREO_INSTITUCIONAL) = LOWER(:correo)
                AND    d.COMPLETA = 1
                ORDER BY d.FECHA_DECLARACION DESC, d.ID_DECLARACION DESC
                """,
                connection)
            {
                BindByName = true,
            };
            OracleCommandHelpers.AddStringParam(cmd, ":correo", correo);
            return cmd;
        }, async reader =>
        {
            var lista = new List<DeclaracionResumen>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearResumen(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- //
    // Autocompletado (función de base de datos FN_DATOS_AUTOCOMPLETADO) //
    // ---------------------------------------------------------------- //
    public async Task<List<DatosAutocompletado>> ObtenerDatosAutocompletadoAsync(string correo)
    {
        return await _q.QueryCursorAsync(connection =>
        {
            var cmd = new OracleCommand("FN_DATOS_AUTOCOMPLETADO", connection)
            {
                CommandType = CommandType.StoredProcedure,
                BindByName = true,
            };
            cmd.Parameters.Add(new OracleParameter("ret", OracleDbType.RefCursor) { Direction = ParameterDirection.ReturnValue });
            OracleCommandHelpers.AddStringParam(cmd, "p_correo", correo);
            return cmd;
        }, async reader =>
        {
            var lista = new List<DatosAutocompletado>();
            while (await reader.ReadAsync().ConfigureAwait(false))
                lista.Add(MapearAutocompletado(reader));
            return lista;
        }).ConfigureAwait(false);
    }

    private static DeclaracionResumen MapearResumen(DbDataReader r) => new()
    {
        Id = r.GetInt32(r.GetOrdinal("ID_DECLARACION")),
        NumeroPlaza = Convert.ToUInt64(r.GetValue(r.GetOrdinal("NUMERO_PLAZA")), CultureInfo.InvariantCulture),
        Cargo = LeerStringOpcional(r, "CARGO"),
        FechaDeclaracion = r.GetDateTime(r.GetOrdinal("FECHA_DECLARACION")),
        Completa = r.GetInt32(r.GetOrdinal("COMPLETA")),
    };

    private static DatosAutocompletado MapearAutocompletado(DbDataReader r) => new()
    {
        NumeroPlaza = Convert.ToUInt64(r.GetValue(r.GetOrdinal("NUMERO_PLAZA")), CultureInfo.InvariantCulture),
        IdPuesto = r.GetInt32(r.GetOrdinal("ID_PUESTO")),
        Cargo = LeerStringOpcional(r, "CARGO"),
        ClaseOcupacional = LeerStringOpcional(r, "CLASE_OCUPACIONAL") ?? string.Empty,
        LugarTrabajo = LeerStringOpcional(r, "LUGAR_TRABAJO") ?? string.Empty,
        Titular = LeerStringOpcional(r, "TITULAR") ?? string.Empty,
    };

    private static void AplicarDatosPlaza(DbDataReader r, DeclaracionDetalle detalle)
    {
        detalle.Cargo = LeerStringOpcional(r, "CARGO");
        detalle.ClaseOcupacional = LeerStringOpcional(r, "CLASE_OCUPACIONAL");
        detalle.LugarTrabajo = LeerStringOpcional(r, "LUGAR_TRABAJO");
    }
}
