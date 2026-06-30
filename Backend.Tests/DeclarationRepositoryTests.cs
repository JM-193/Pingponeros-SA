// DeclarationRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class DeclarationRepositoryTests
{
    private readonly IQueryExecutor _q = Substitute.For<IQueryExecutor>();
    private readonly DeclaracionRepository _repo;

    public DeclarationRepositoryTests()
    {
        _repo = new DeclaracionRepository(_q);
    }

    // ---------------------------------------------------------------- //
    // ObtenerIdActivaPorUsuarioAsync                                    //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerIdActivaPorUsuarioAsync_ResultadoNull_RetornaNull()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(null));

        var result = await _repo.ObtenerIdActivaPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.Null(result);
    }

    [Fact]
    public async Task ObtenerIdActivaPorUsuarioAsync_ResultadoDBNull_RetornaNull()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(DBNull.Value));

        var result = await _repo.ObtenerIdActivaPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.Null(result);
    }

    [Fact]
    public async Task ObtenerIdActivaPorUsuarioAsync_ConId_RetornaId()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(5));

        var result = await _repo.ObtenerIdActivaPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.Equal(5, result);
    }

    // ---------------------------------------------------------------- //
    // ExisteActivaPorUsuarioAsync                                       //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ExisteActivaPorUsuarioAsync_ContadorCero_RetornaFalse()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(0));

        var result = await _repo.ExisteActivaPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.False(result);
    }

    [Fact]
    public async Task ExisteActivaPorUsuarioAsync_ContadorMayorCero_RetornaTrue()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(1));

        var result = await _repo.ExisteActivaPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.True(result);
    }

    // ---------------------------------------------------------------- //
    // ObtenerCabeceraAsync                                              //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerCabeceraAsync_SinFila_RetornaNull()
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<Declaracion?>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<Declaracion?>>>();
                using var reader = CrearTablaDeclaracion().CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerCabeceraAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task ObtenerCabeceraAsync_ConFila_MapeoCorrectamente()
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<Declaracion?>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<Declaracion?>>>();
                var tabla = CrearTablaDeclaracion();
                tabla.Rows.Add(7, 100m, "juan@ucr.ac.cr", new DateTime(2025, 1, 15), 0);
                using var reader = tabla.CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerCabeceraAsync(7);

        Assert.NotNull(result);
        Assert.Equal(7, result.Id);
        Assert.Equal(100UL, result.NumeroPlaza);
        Assert.Equal("juan@ucr.ac.cr", result.CorreoInstitucional);
        Assert.Equal(new DateTime(2025, 1, 15), result.FechaDeclaracion);
        Assert.Equal(0, result.Completa);
    }

    // ---------------------------------------------------------------- //
    // CrearAsync                                                        //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CrearAsync_Exitoso_RetornaIdGenerado()
    {
        _q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(Task.FromResult<object?>(new OracleDecimal(42)));

        var result = await _repo.CrearAsync(100UL, "juan@ucr.ac.cr");

        Assert.Equal(42, result);
    }

    // ---------------------------------------------------------------- //
    // CompletarAsync                                                    //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CompletarAsync_SinFilasAfectadas_RetornaFalse()
    {
        _q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(0);

        var result = await _repo.CompletarAsync(1);

        Assert.False(result);
    }

    [Fact]
    public async Task CompletarAsync_ConFilaAfectada_RetornaTrue()
    {
        _q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(1);

        var result = await _repo.CompletarAsync(1);

        Assert.True(result);
    }

    // ---------------------------------------------------------------- //
    // CancelarAsync                                                     //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CancelarAsync_NoExiste_RetornaFalse()
    {
        _q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(0);

        var result = await _repo.CancelarAsync(99);

        Assert.False(result);
    }

    [Fact]
    public async Task CancelarAsync_Exitoso_RetornaTrue()
    {
        _q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(1);

        var result = await _repo.CancelarAsync(1);

        Assert.True(result);
    }

    // ---------------------------------------------------------------- //
    // GuardarBorradorAsync                                              //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task GuardarBorradorAsync_DetalleNull_LanzaArgumentNullException()
    {
        await Assert.ThrowsAsync<ArgumentNullException>(
            () => _repo.GuardarBorradorAsync(1, null!));
    }

    [Fact]
    public async Task GuardarBorradorAsync_DetalleValido_InvocaTransaction()
    {
        _q.ExecuteTransactionAsync(Arg.Any<Func<OracleConnection, OracleTransaction, Task>>())
            .Returns(Task.CompletedTask);

        await _repo.GuardarBorradorAsync(1, new DeclaracionDetalle());

        await _q.Received(1).ExecuteTransactionAsync(
            Arg.Any<Func<OracleConnection, OracleTransaction, Task>>());
    }

    // ---------------------------------------------------------------- //
    // ObtenerDetalleAsync                                               //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerDetalleAsync_SinCabecera_RetornaNull()
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<Declaracion?>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<Declaracion?>>>();
                using var reader = CrearTablaDeclaracion().CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerDetalleAsync(999);

        Assert.Null(result);
    }

    // ---------------------------------------------------------------- //
    // ObtenerCompletasPorUsuarioAsync                                   //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerCompletasPorUsuarioAsync_SinDeclaraciones_RetornaListaVacia()
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<List<DeclaracionResumen>>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<List<DeclaracionResumen>>>>();
                using var reader = CrearTablaResumen().CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerCompletasPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.Empty(result);
    }

    [Fact]
    public async Task ObtenerCompletasPorUsuarioAsync_ConDeclaraciones_MapeoCorrectamente()
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<List<DeclaracionResumen>>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<List<DeclaracionResumen>>>>();
                var tabla = CrearTablaResumen();
                tabla.Rows.Add(1, 100m, new DateTime(2025, 3, 1), 1, DBNull.Value);
                tabla.Rows.Add(2, 200m, new DateTime(2025, 6, 1), 1, "Analista");
                using var reader = tabla.CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerCompletasPorUsuarioAsync("juan@ucr.ac.cr");

        Assert.Equal(2, result.Count);
        Assert.Equal(100UL, result[0].NumeroPlaza);
        Assert.Null(result[0].Cargo);
        Assert.Equal(2, result[1].Id);
        Assert.Equal("Analista", result[1].Cargo);
    }

    [Fact]
    public async Task ObtenerDetalleAsync_ConCabecera_MapeaPlazaHijosYActividades()
    {
        // Cabecera (ObtenerCabeceraAsync usa QueryAsync<Declaracion?>).
        var cabecera = CrearTablaDeclaracion();
        cabecera.Rows.Add(7, 100m, "juan@ucr.ac.cr", new DateTime(2025, 5, 1), 0);
        ConfigurarQuery<Declaracion?>(cabecera);

        // Datos de la plaza (QueryAsync<bool> que aplica AplicarDatosPlaza).
        var plaza = new DataTable();
        plaza.Columns.Add("CARGO", typeof(string));
        plaza.Columns.Add("CLASE_OCUPACIONAL", typeof(string));
        plaza.Columns.Add("LUGAR_TRABAJO", typeof(string));
        plaza.Rows.Add("Analista", "Profesional 1", "Oficina Central");
        ConfigurarQuery<bool>(plaza);

        // Horario laboral.
        var horario = new DataTable();
        horario.Columns.Add("ID_HORARIO_LABORAL", typeof(int));
        horario.Columns.Add("ID_DECLARACION", typeof(int));
        horario.Columns.Add("HORA_ENTRADA", typeof(string));
        horario.Columns.Add("HORA_SALIDA", typeof(string));
        horario.Columns.Add("JORNADA_LABORAL", typeof(string));
        horario.Rows.Add(1, 7, "08:00", "17:00", "Diurna");
        ConfigurarQuery<HorarioLaboral?>(horario);

        // Descanso.
        var descanso = new DataTable();
        descanso.Columns.Add("ID_DESCANSO", typeof(int));
        descanso.Columns.Add("ID_DECLARACION", typeof(int));
        descanso.Columns.Add("TIEMPO", typeof(decimal));
        descanso.Rows.Add(2, 7, 1.5m);
        ConfigurarQuery<Descanso?>(descanso);

        // Horas extra.
        var horaExtra = new DataTable();
        horaExtra.Columns.Add("ID_HORAS_EXTRAS", typeof(int));
        horaExtra.Columns.Add("ID_DECLARACION", typeof(int));
        horaExtra.Columns.Add("TIEMPO_ADICIONAL", typeof(decimal));
        horaExtra.Columns.Add("JUSTIFICACION", typeof(string));
        horaExtra.Columns.Add("CONOCIMIENTO_JEFATURA", typeof(int));
        horaExtra.Rows.Add(3, 7, 2m, "Cierre mensual", 1);
        ConfigurarQuery<HoraExtra?>(horaExtra);

        // Permiso de ausencia.
        var permiso = new DataTable();
        permiso.Columns.Add("ID_PERMISO_AUSENCIA", typeof(int));
        permiso.Columns.Add("ID_DECLARACION", typeof(int));
        permiso.Columns.Add("DIAS", typeof(decimal));
        permiso.Columns.Add("JUSTIFICACION", typeof(string));
        permiso.Columns.Add("CONOCIMIENTO_JEFATURA", typeof(int));
        permiso.Rows.Add(4, 7, 3m, "Cita médica", 0);
        ConfigurarQuery<PermisoAusencia?>(permiso);

        // Actividades.
        var actividades = new DataTable();
        actividades.Columns.Add("ID_ACTIVIDAD", typeof(int));
        actividades.Columns.Add("ID_FUNCION", typeof(int));
        actividades.Columns.Add("ID_FUNCION_PROPIA", typeof(int));
        actividades.Columns.Add("TIPO_FUNCION", typeof(string));
        actividades.Columns.Add("PERIODICIDAD", typeof(string));
        actividades.Columns.Add("VECES_REALIZADAS", typeof(int));
        actividades.Columns.Add("DURACION", typeof(int));
        actividades.Columns.Add("NOMBRE", typeof(string));
        actividades.Columns.Add("DESCRIPCION", typeof(string));
        actividades.Rows.Add(5, 9, DBNull.Value, "Catalogo", "Diaria", 4, 30, "Elaborar informes", "Redactar informes");
        ConfigurarQuery<List<Actividad>>(actividades);

        var detalle = await _repo.ObtenerDetalleAsync(7);

        Assert.NotNull(detalle);
        Assert.Equal(7, detalle!.Declaracion.Id);
        Assert.Equal("Analista", detalle.Cargo);
        Assert.Equal("Profesional 1", detalle.ClaseOcupacional);
        Assert.Equal("Oficina Central", detalle.LugarTrabajo);
        Assert.NotNull(detalle.Horario);
        Assert.Equal("08:00", detalle.Horario!.HoraEntrada);
        Assert.Equal("Diurna", detalle.Horario.JornadaLaboral);
        Assert.NotNull(detalle.Descanso);
        Assert.Equal(1.5m, detalle.Descanso!.Tiempo);
        Assert.NotNull(detalle.HoraExtra);
        Assert.Equal(2m, detalle.HoraExtra!.TiempoAdicional);
        Assert.NotNull(detalle.PermisoAusencia);
        Assert.Equal(3m, detalle.PermisoAusencia!.Dias);
        Assert.Single(detalle.Actividades);
        Assert.Equal("Elaborar informes", detalle.Actividades[0].Nombre);
        Assert.Equal(9, detalle.Actividades[0].IdFuncion);
        Assert.Null(detalle.Actividades[0].IdFuncionPropia);
    }

    // ---------------------------------------------------------------- //
    // ObtenerDatosAutocompletadoAsync                                  //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerDatosAutocompletadoAsync_ConFilas_MapeoCorrectamente()
    {
        var tabla = CrearTablaAutocompletado();
        tabla.Rows.Add(100m, 5, "Analista", "Profesional 1", "Oficina Central", "Ana Perez");
        tabla.Rows.Add(200m, 6, DBNull.Value, DBNull.Value, DBNull.Value, DBNull.Value);

        _q.QueryCursorAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<List<DatosAutocompletado>>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<List<DatosAutocompletado>>>>();
                using var reader = tabla.CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerDatosAutocompletadoAsync("juan@ucr.ac.cr");

        Assert.Equal(2, result.Count);
        Assert.Equal(100UL, result[0].NumeroPlaza);
        Assert.Equal(5, result[0].IdPuesto);
        Assert.Equal("Analista", result[0].Cargo);
        Assert.Equal("Profesional 1", result[0].ClaseOcupacional);
        Assert.Equal("Oficina Central", result[0].LugarTrabajo);
        Assert.Equal("Ana Perez", result[0].Titular);
        // Columnas nulas: Cargo queda null y los demás como cadena vacía.
        Assert.Null(result[1].Cargo);
        Assert.Equal(string.Empty, result[1].ClaseOcupacional);
        Assert.Equal(string.Empty, result[1].LugarTrabajo);
        Assert.Equal(string.Empty, result[1].Titular);
    }

    [Fact]
    public async Task ObtenerDatosAutocompletadoAsync_SinFilas_RetornaListaVacia()
    {
        _q.QueryCursorAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<List<DatosAutocompletado>>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<List<DatosAutocompletado>>>>();
                using var reader = CrearTablaAutocompletado().CreateDataReader();
                return mapper(reader);
            });

        var result = await _repo.ObtenerDatosAutocompletadoAsync("juan@ucr.ac.cr");

        Assert.Empty(result);
    }

    // ---------------------------------------------------------------- //
    // Helpers                                                           //
    // ---------------------------------------------------------------- //

    private void ConfigurarQuery<T>(DataTable tabla)
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<T>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<T>>>();
                using var reader = tabla.CreateDataReader();
                return mapper(reader);
            });
    }

    private static DataTable CrearTablaAutocompletado()
    {
        var t = new DataTable();
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("ID_PUESTO", typeof(int));
        t.Columns.Add("CARGO", typeof(string));
        t.Columns.Add("CLASE_OCUPACIONAL", typeof(string));
        t.Columns.Add("LUGAR_TRABAJO", typeof(string));
        t.Columns.Add("TITULAR", typeof(string));
        return t;
    }

    private static DataTable CrearTablaDeclaracion()
    {
        var t = new DataTable();
        t.Columns.Add("ID_DECLARACION", typeof(int));
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        t.Columns.Add("FECHA_DECLARACION", typeof(DateTime));
        t.Columns.Add("COMPLETA", typeof(int));
        return t;
    }

    private static DataTable CrearTablaResumen()
    {
        var t = new DataTable();
        t.Columns.Add("ID_DECLARACION", typeof(int));
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("FECHA_DECLARACION", typeof(DateTime));
        t.Columns.Add("COMPLETA", typeof(int));
        t.Columns.Add("CARGO", typeof(string));
        return t;
    }
}
