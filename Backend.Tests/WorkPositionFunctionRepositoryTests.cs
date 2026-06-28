// WorkPositionFunctionRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class WorkPositionFunctionRepositoryTests
{
    // ── ObtenerFuncionesDePuestoAsync ────────────────────────────────────────

    [Fact]
    public async Task ObtenerFuncionesDePuestoAsync_ReturnsFunciones()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(1, "Elaborar informes", "Redactar informes mensuales");
        table.Rows.Add(2, "Atención al cliente", "Brindar atención al público");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Function>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Function>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var result = await repo.ObtenerFuncionesDePuestoAsync(1);

        Assert.Equal(2, result.Count);
        Assert.Equal("Elaborar informes", result[0].Nombre);
        Assert.Equal("Redactar informes mensuales", result[0].Descripcion);
        Assert.Equal("Atención al cliente", result[1].Nombre);
    }

    [Fact]
    public async Task ObtenerFuncionesDePuestoAsync_ReturnsListaVacia()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Function>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Function>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var result = await repo.ObtenerFuncionesDePuestoAsync(99);

        Assert.Empty(result);
    }

    // ── EstaAsociadaAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task EstaAsociadaAsync_ReturnsTrueCuandoEstaAsociada()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var resultado = await repo.EstaAsociadaAsync(1, 2);

        Assert.True(resultado);
    }

    [Fact]
    public async Task EstaAsociadaAsync_ReturnsFalseCuandoNoEstaAsociada()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var resultado = await repo.EstaAsociadaAsync(1, 99);

        Assert.False(resultado);
    }

    // ── AgregarAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AgregarAsync_EjecutaInsert()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new WorkPositionFunctionRepository(q);
        await repo.AgregarAsync(1, 2);

        await q.Received(1).ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>());
    }

    // ── QuitarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task QuitarAsync_ReturnsTrueCuandoSeElimina()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var resultado = await repo.QuitarAsync(1, 2);

        Assert.True(resultado);
    }

    [Fact]
    public async Task QuitarAsync_ReturnsFalseCuandoNoExisteAsociacion()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new WorkPositionFunctionRepository(q);
        var resultado = await repo.QuitarAsync(1, 99);

        Assert.False(resultado);
    }
}
