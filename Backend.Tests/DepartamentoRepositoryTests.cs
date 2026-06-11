// DepartmentRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class DepartmentRepositoryTests
{
    [Fact]
    public async Task DepartmentRepository_ObtenerTodosAsync_ReturnsDepartamentos()
    {
        var table = new DataTable();
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(1, 10, "Dept A", "Desc A", 1);
        table.Rows.Add(2, DBNull.Value, "Dept B", "Desc B", 0);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Department>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Department>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new DepartmentRepository(q);
        var res = await repo.ObtenerTodosAsync();

        Assert.Equal(2, res.Count);
        Assert.Equal("Dept A", res[0].Nombre);
        Assert.Equal(10, res[0].IdArea);
        Assert.Equal("Dept B", res[1].Nombre);
        Assert.Null(res[1].IdArea);
    }

    [Fact]
    public async Task DepartmentRepository_ExisteNombreAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new DepartmentRepository(q);
        var exists = await repo.ExisteNombreAsync("Dept A");

        Assert.True(exists);
    }

    [Fact]
    public async Task DepartmentRepository_ExisteNombreAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new DepartmentRepository(q);
        var exists = await repo.ExisteNombreAsync("NoExiste");

        Assert.False(exists);
    }

    [Fact]
    public async Task DepartmentRepository_InsertarAsync_ReturnsInsertedId()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(42));
            });

        var repo = new DepartmentRepository(q);
        var id = await repo.InsertarAsync(new Department { IdArea = 10, Nombre = "X", Descripcion = "Y", Estado = 1 });

        Assert.Equal(42, id);
    }

    [Fact]
    public async Task DepartmentRepository_InsertarAsync_LanzaExcepcionCuandoDepartamentoEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new DepartmentRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task DepartmentRepository_ObtenerPorNombreAsync_ReturnsDepartamentoCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(5, 10, "Sistemas", "Dept de sistemas", 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Department?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Department?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new DepartmentRepository(q);
        var dept = await repo.ObtenerPorNombreAsync("Sistemas");

        Assert.NotNull(dept);
        Assert.Equal(5, dept!.Id);
        Assert.Equal(10, dept.IdArea);
        Assert.Equal("Sistemas", dept.Nombre);
    }

    [Fact]
    public async Task DepartmentRepository_ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Department?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Department?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new DepartmentRepository(q);
        var dept = await repo.ObtenerPorNombreAsync("NoExiste");

        Assert.Null(dept);
    }

    [Fact]
    public async Task DepartmentRepository_ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new DepartmentRepository(q);
        var updated = await repo.ActualizarAsync("Sistemas", new Department { Nombre = "Sistemas", Descripcion = "Nueva desc", Estado = 1 });

        Assert.True(updated);
    }

    [Fact]
    public async Task DepartmentRepository_ActualizarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new DepartmentRepository(q);
        var updated = await repo.ActualizarAsync("NoExiste", new Department { Nombre = "NoExiste", Descripcion = "Desc", Estado = 1 });

        Assert.False(updated);
    }

    [Fact]
    public async Task DepartmentRepository_ActualizarAsync_LanzaExcepcionCuandoDepartamentoEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new DepartmentRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("Sistemas", null!));
    }

    [Fact]
    public async Task DepartmentRepository_DesactivarAsync_ReturnsTrueWhenDeactivated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new DepartmentRepository(q);
        var result = await repo.DesactivarAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task DepartmentRepository_DesactivarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new DepartmentRepository(q);
        var result = await repo.DesactivarAsync(99);

        Assert.False(result);
    }
}
