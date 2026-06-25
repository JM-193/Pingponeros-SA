// WorkPositionRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class WorkPositionRepositoryTests
{
    [Fact]
    public async Task ObtenerTodasAsync_ReturnsPuestos()
    {
        var table = new DataTable();
        table.Columns.Add("ID_PUESTO", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(1, "chofer", "Puesto de chofer");
        table.Rows.Add(2, "digitador", "Puesto de digitador");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<WorkPosition>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<WorkPosition>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new WorkPositionRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("chofer", result[0].Nombre);
        Assert.Equal("Puesto de chofer", result[0].Descripcion);
        Assert.Equal("digitador", result[1].Nombre);
    }

    [Fact]
    public async Task ExisteNombreAsync_ReturnsTrueCuandoExiste()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new WorkPositionRepository(q);
        var existe = await repo.ExisteNombreAsync("chofer");

        Assert.True(existe);
    }

    [Fact]
    public async Task ExisteNombreAsync_ReturnsFalseCuandoNoExiste()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new WorkPositionRepository(q);
        var existe = await repo.ExisteNombreAsync("noexiste");

        Assert.False(existe);
    }

    [Fact]
    public async Task InsertarAsync_ReturnsIdInsertado()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(7));
            });

        var repo = new WorkPositionRepository(q);
        var id = await repo.InsertarAsync(new WorkPosition { Nombre = "chofer", Descripcion = "Puesto de chofer" });

        Assert.Equal(7, id);
    }

    [Fact]
    public async Task InsertarAsync_LanzaExcepcionCuandoPuestoEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new WorkPositionRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_ReturnsPuestoCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_PUESTO", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(3, "chofer", "Puesto de chofer");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<WorkPosition?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<WorkPosition?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new WorkPositionRepository(q);
        var puesto = await repo.ObtenerPorNombreAsync("chofer");

        Assert.NotNull(puesto);
        Assert.Equal(3, puesto!.Id);
        Assert.Equal("chofer", puesto.Nombre);
        Assert.Equal("Puesto de chofer", puesto.Descripcion);
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_PUESTO", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<WorkPosition?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<WorkPosition?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new WorkPositionRepository(q);
        var puesto = await repo.ObtenerPorNombreAsync("noexiste");

        Assert.Null(puesto);
    }

    [Fact]
    public async Task EstaAsociadoAsync_ReturnsTrueCuandoTieneAsociaciones()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(2);
            });

        var repo = new WorkPositionRepository(q);
        var asociado = await repo.EstaAsociadoAsync(1);

        Assert.True(asociado);
    }

    [Fact]
    public async Task EstaAsociadoAsync_ReturnsFalseCuandoNoTieneAsociaciones()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new WorkPositionRepository(q);
        var asociado = await repo.EstaAsociadoAsync(99);

        Assert.False(asociado);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsTrueCuandoSeElimina()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new WorkPositionRepository(q);
        var eliminado = await repo.EliminarAsync(1);

        Assert.True(eliminado);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsFalseCuandoNoExiste()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new WorkPositionRepository(q);
        var eliminado = await repo.EliminarAsync(99);

        Assert.False(eliminado);
    }
}
