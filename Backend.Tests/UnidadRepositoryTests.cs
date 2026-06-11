// UnitRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class UnitRepositoryTests
{
    [Fact]
    public async Task UnitRepository_ObtenerTodasAsync_ReturnsUnidades()
    {
        var table = new DataTable();
        table.Columns.Add("ID_UNIDAD", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(1, 10, 20, 30, "Unidad A", "Desc A", 1);
        table.Rows.Add(2, DBNull.Value, DBNull.Value, DBNull.Value, "Unidad B", "Desc B", 0);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Unidad>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Unidad>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UnitRepository(q);
        var res = await repo.ObtenerTodasAsync();

        Assert.Equal(2, res.Count);
        Assert.Equal("Unidad A", res[0].Nombre);
        Assert.Equal(10, res[0].IdArea);
        Assert.Equal(20, res[0].IdDepartamento);
        Assert.Equal(30, res[0].IdSeccion);

        Assert.Equal("Unidad B", res[1].Nombre);
        Assert.Null(res[1].IdArea);
        Assert.Null(res[1].IdDepartamento);
        Assert.Null(res[1].IdSeccion);
    }

    [Fact]
    public async Task UnitRepository_ExisteNombreAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new UnitRepository(q);
        var exists = await repo.ExisteNombreAsync("Unidad A");

        Assert.True(exists);
    }

    [Fact]
    public async Task UnitRepository_ExisteNombreAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new UnitRepository(q);
        var exists = await repo.ExisteNombreAsync("NoExiste");

        Assert.False(exists);
    }

    [Fact]
    public async Task UnitRepository_InsertarAsync_ReturnsInsertedId()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(42));
            });

        var repo = new UnitRepository(q);
        var id = await repo.InsertarAsync(new Unidad { IdArea = 10, IdDepartamento = 20, IdSeccion = 30, Nombre = "X", Descripcion = "Y", Estado = 1 });

        Assert.Equal(42, id);
    }

    [Fact]
    public async Task UnitRepository_InsertarAsync_LanzaExcepcionCuandoUnidadEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new UnitRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task UnitRepository_ObtenerPorNombreAsync_ReturnsUnidadCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_UNIDAD", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(5, 10, 20, 30, "Sistemas", "Unidad de sistemas", 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Unidad?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Unidad?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UnitRepository(q);
        var unidad = await repo.ObtenerPorNombreAsync("Sistemas");

        Assert.NotNull(unidad);
        Assert.Equal(5, unidad!.Id);
        Assert.Equal(10, unidad.IdArea);
        Assert.Equal(20, unidad.IdDepartamento);
        Assert.Equal(30, unidad.IdSeccion);
        Assert.Equal("Sistemas", unidad.Nombre);
    }

    [Fact]
    public async Task UnitRepository_ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_UNIDAD", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Unidad?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Unidad?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UnitRepository(q);
        var unidad = await repo.ObtenerPorNombreAsync("NoExiste");

        Assert.Null(unidad);
    }

    [Fact]
    public async Task UnitRepository_ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UnitRepository(q);
        var updated = await repo.ActualizarAsync("Sistemas", new Unidad { Nombre = "Sistemas", Descripcion = "Nueva desc", Estado = 1 });

        Assert.True(updated);
    }

    [Fact]
    public async Task UnitRepository_ActualizarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new UnitRepository(q);
        var updated = await repo.ActualizarAsync("NoExiste", new Unidad { Nombre = "NoExiste", Descripcion = "Desc", Estado = 1 });

        Assert.False(updated);
    }

    [Fact]
    public async Task UnitRepository_ActualizarAsync_LanzaExcepcionCuandoUnidadEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new UnitRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("Sistemas", null!));
    }

    [Fact]
    public async Task UnitRepository_DesactivarAsync_ReturnsTrueWhenDeactivated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UnitRepository(q);
        var result = await repo.DesactivarAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task UnitRepository_DesactivarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new UnitRepository(q);
        var result = await repo.DesactivarAsync(99);

        Assert.False(result);
    }
}
