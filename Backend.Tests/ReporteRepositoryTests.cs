// ReporteRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class ReporteRepositoryTests
{
    private readonly IQueryExecutor _q = Substitute.For<IQueryExecutor>();
    private readonly ReporteRepository _repo;

    public ReporteRepositoryTests()
    {
        _repo = new ReporteRepository(_q);
    }

    // ---------------------------------------------------------------- //
    // ObtenerFuncionariosAsync                                          //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerFuncionariosAsync_MapeaNombreYPlazaOpcional()
    {
        ConfigurarQuery<List<ReporteFuncionarioFila>>(() =>
        {
            var t = CrearTablaFuncionarios();
            t.Rows.Add("juan@ucr.ac.cr", "Juan", "Carlos", "Pérez", "García", 1, 1, 100m, "Analista", "Profesional", "Edificio A");
            t.Rows.Add("ana@ucr.ac.cr", "Ana", DBNull.Value, "Mora", "Soto", 0, 1, DBNull.Value, DBNull.Value, DBNull.Value, DBNull.Value);
            return t;
        });

        var result = await _repo.ObtenerFuncionariosAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Juan Carlos Pérez García", result[0].NombreCompleto);
        Assert.Equal(1, result[0].Rol);
        Assert.Equal(100UL, result[0].NumeroPlaza);
        Assert.Equal("Analista", result[0].Cargo);
        // Funcionario sin plaza vigente: campos de plaza en null.
        Assert.Equal("Ana Mora Soto", result[1].NombreCompleto);
        Assert.Null(result[1].NumeroPlaza);
        Assert.Null(result[1].Cargo);
    }

    [Fact]
    public async Task ObtenerFuncionariosAsync_SinFilas_RetornaListaVacia()
    {
        ConfigurarQuery<List<ReporteFuncionarioFila>>(CrearTablaFuncionarios);

        var result = await _repo.ObtenerFuncionariosAsync();

        Assert.Empty(result);
    }

    // ---------------------------------------------------------------- //
    // ObtenerDeclaracionesAsync                                         //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerDeclaracionesAsync_MapeaCorrectamente()
    {
        ConfigurarQuery<List<ReporteDeclaracionFila>>(() =>
        {
            var t = CrearTablaDeclaraciones();
            t.Rows.Add(7, "juan@ucr.ac.cr", "Juan", DBNull.Value, "Pérez", "García", 100m, new DateTime(2025, 6, 1), 1, "Analista");
            return t;
        });

        var result = await _repo.ObtenerDeclaracionesAsync();

        var fila = Assert.Single(result);
        Assert.Equal(7, fila.Id);
        Assert.Equal("Juan Pérez García", fila.NombreCompleto);
        Assert.Equal(100UL, fila.NumeroPlaza);
        Assert.Equal("Analista", fila.Cargo);
        Assert.Equal(1, fila.Completa);
    }

    // ---------------------------------------------------------------- //
    // ObtenerHorasAsync (agregación por declaración)                    //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerHorasAsync_AgrupaPorDeclaracionYSumaMinutos()
    {
        ConfigurarQuery<List<ReporteHorasFila>>(() =>
        {
            var t = CrearTablaHoras();
            // Dos actividades de la MISMA declaración (id 5): 60 + 60 = 120 min, 2 funciones.
            t.Rows.Add(5, "juan@ucr.ac.cr", "Juan", DBNull.Value, "Pérez", "García", 100m, new DateTime(2025, 6, 1), "Tiempo Completo", "Semanal", 1, 60, "Analista");
            t.Rows.Add(5, "juan@ucr.ac.cr", "Juan", DBNull.Value, "Pérez", "García", 100m, new DateTime(2025, 6, 1), "Tiempo Completo", "Diario", 1, 10, "Analista");
            return t;
        });

        var result = await _repo.ObtenerHorasAsync();

        var fila = Assert.Single(result);
        Assert.Equal("Juan Pérez García", fila.NombreCompleto);
        Assert.Equal(2, fila.CantidadFunciones);
        Assert.Equal(120, fila.TotalMinutosSemanales, 3); // 60 (semanal) + 10×6 (diario)
        Assert.Equal("Tiempo Completo", fila.JornadaLaboral);
    }

    // ---------------------------------------------------------------- //
    // Helpers                                                           //
    // ---------------------------------------------------------------- //

    // Hace que QueryExecutor.QueryAsync invoque al mapper con un lector sobre la tabla dada.
    private void ConfigurarQuery<T>(Func<DataTable> crearTabla)
    {
        _q.QueryAsync(
            Arg.Any<Func<OracleConnection, OracleCommand>>(),
            Arg.Any<Func<DbDataReader, Task<T>>>())
            .Returns(callInfo =>
            {
                var mapper = callInfo.Arg<Func<DbDataReader, Task<T>>>();
                using var reader = crearTabla().CreateDataReader();
                return mapper(reader);
            });
    }

    private static DataTable CrearTablaFuncionarios()
    {
        var t = new DataTable();
        t.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        t.Columns.Add("PRIMER_NOMBRE", typeof(string));
        t.Columns.Add("SEGUNDO_NOMBRE", typeof(string));
        t.Columns.Add("PRIMER_APELLIDO", typeof(string));
        t.Columns.Add("SEGUNDO_APELLIDO", typeof(string));
        t.Columns.Add("ROL", typeof(int));
        t.Columns.Add("ESTADO", typeof(int));
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("CARGO", typeof(string));
        t.Columns.Add("CLASE_OCUPACIONAL", typeof(string));
        t.Columns.Add("LUGAR_TRABAJO", typeof(string));
        return t;
    }

    private static DataTable CrearTablaDeclaraciones()
    {
        var t = new DataTable();
        t.Columns.Add("ID_DECLARACION", typeof(int));
        t.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        t.Columns.Add("PRIMER_NOMBRE", typeof(string));
        t.Columns.Add("SEGUNDO_NOMBRE", typeof(string));
        t.Columns.Add("PRIMER_APELLIDO", typeof(string));
        t.Columns.Add("SEGUNDO_APELLIDO", typeof(string));
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("FECHA_DECLARACION", typeof(DateTime));
        t.Columns.Add("COMPLETA", typeof(int));
        t.Columns.Add("CARGO", typeof(string));
        return t;
    }

    private static DataTable CrearTablaHoras()
    {
        var t = new DataTable();
        t.Columns.Add("ID_DECLARACION", typeof(int));
        t.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        t.Columns.Add("PRIMER_NOMBRE", typeof(string));
        t.Columns.Add("SEGUNDO_NOMBRE", typeof(string));
        t.Columns.Add("PRIMER_APELLIDO", typeof(string));
        t.Columns.Add("SEGUNDO_APELLIDO", typeof(string));
        t.Columns.Add("NUMERO_PLAZA", typeof(decimal));
        t.Columns.Add("FECHA_DECLARACION", typeof(DateTime));
        t.Columns.Add("JORNADA_LABORAL", typeof(string));
        t.Columns.Add("PERIODICIDAD", typeof(string));
        t.Columns.Add("VECES_REALIZADAS", typeof(int));
        t.Columns.Add("DURACION", typeof(int));
        t.Columns.Add("CARGO", typeof(string));
        return t;
    }
}
