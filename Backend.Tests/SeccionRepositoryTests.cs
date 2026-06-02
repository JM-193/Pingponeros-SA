// SeccionRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class SeccionRepositoryTests
{
    [Fact]
    public async Task SeccionRepository_ObtenerTodasAsync_ReturnsSecciones()
    {
        var table = new DataTable();
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(1, 10, "Seccion A", "Desc A", 1);
        table.Rows.Add(2, DBNull.Value, "Seccion B", "Desc B", 0);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Seccion>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Seccion>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new SeccionRepository(q);
        var res = await repo.ObtenerTodasAsync();

        Assert.Equal(2, res.Count);
        Assert.Equal("Seccion A", res[0].Nombre);
        Assert.Equal(10, res[0].IdArea);
        Assert.Equal("Seccion B", res[1].Nombre);
        Assert.Null(res[1].IdArea);
    }

    [Fact]
    public async Task SeccionRepository_ExisteNombreAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new SeccionRepository(q);
        var exists = await repo.ExisteNombreAsync("Seccion A");

        Assert.True(exists);
    }

    [Fact]
    public async Task SeccionRepository_ExisteNombreAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new SeccionRepository(q);
        var exists = await repo.ExisteNombreAsync("NoExiste");

        Assert.False(exists);
    }

    [Fact]
    public async Task SeccionRepository_InsertarAsync_ReturnsInsertedId()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(42));
            });

        var repo = new SeccionRepository(q);
        var id = await repo.InsertarAsync(new Seccion { IdArea = 10, Nombre = "X", Descripcion = "Y", Estado = 1 });

        Assert.Equal(42, id);
    }

    [Fact]
    public async Task SeccionRepository_InsertarAsync_LanzaExcepcionCuandoSeccionEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new SeccionRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task SeccionRepository_ObtenerPorNombreAsync_ReturnsSeccionCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(5, 10, "Sistemas", "Seccion de sistemas", 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Seccion?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Seccion?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new SeccionRepository(q);
        var seccion = await repo.ObtenerPorNombreAsync("Sistemas");

        Assert.NotNull(seccion);
        Assert.Equal(5, seccion!.Id);
        Assert.Equal(10, seccion.IdArea);
        Assert.Equal("Sistemas", seccion.Nombre);
    }

    [Fact]
    public async Task SeccionRepository_ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Seccion?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Seccion?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new SeccionRepository(q);
        var seccion = await repo.ObtenerPorNombreAsync("NoExiste");

        Assert.Null(seccion);
    }

    [Fact]
    public async Task SeccionRepository_ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new SeccionRepository(q);
        var updated = await repo.ActualizarAsync("Sistemas", new Seccion { Nombre = "Sistemas", Descripcion = "Nueva desc", Estado = 1 });

        Assert.True(updated);
    }

    [Fact]
    public async Task SeccionRepository_ActualizarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new SeccionRepository(q);
        var updated = await repo.ActualizarAsync("NoExiste", new Seccion { Nombre = "NoExiste", Descripcion = "Desc", Estado = 1 });

        Assert.False(updated);
    }

    [Fact]
    public async Task SeccionRepository_ActualizarAsync_LanzaExcepcionCuandoSeccionEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new SeccionRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("Sistemas", null!));
    }

    [Fact]
    public async Task SeccionRepository_DesactivarAsync_ReturnsTrueWhenDeactivated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new SeccionRepository(q);
        var result = await repo.DesactivarAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task SeccionRepository_DesactivarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new SeccionRepository(q);
        var result = await repo.DesactivarAsync(99);

        Assert.False(result);
    }
}
