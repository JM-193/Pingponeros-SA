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

    // ---------------------------------------------------------------- //
    // Helpers                                                           //
    // ---------------------------------------------------------------- //

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
