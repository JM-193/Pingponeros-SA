using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class PositionRepositoryTests
{
    [Fact]
    public async Task ObtenerTodasAsync_ReturnsPlazasConRelacionesOpcionales()
    {
        var table = CrearTablaPlazas();
        table.Rows.Add(1001L, 1, 2, 3, 4);
        table.Rows.Add(1002L, DBNull.Value, DBNull.Value, DBNull.Value, DBNull.Value);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Position>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Position>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionRepository(q);
        var plazas = await repo.ObtenerTodasAsync();

        Assert.Equal(2, plazas.Count);
        Assert.Equal(1001UL, plazas[0].NumeroPlaza);
        Assert.Equal(1, plazas[0].IdUnidad);
        Assert.Equal(2, plazas[0].IdDepartamento);
        Assert.Equal(3, plazas[0].IdSeccion);
        Assert.Equal(4, plazas[0].IdArea);
        Assert.Equal(1002UL, plazas[1].NumeroPlaza);
        Assert.Null(plazas[1].IdUnidad);
        Assert.Null(plazas[1].IdDepartamento);
        Assert.Null(plazas[1].IdSeccion);
        Assert.Null(plazas[1].IdArea);
    }

    [Fact]
    public async Task ObtenerTodasAsync_ReturnsEmptyList()
    {
        var table = CrearTablaPlazas();
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Position>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Position>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionRepository(q);
        var plazas = await repo.ObtenerTodasAsync();

        Assert.Empty(plazas);
    }

    [Fact]
    public async Task ExisteNumeroPlazaAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new PositionRepository(q);
        var exists = await repo.ExisteNumeroPlazaAsync(1001);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExisteNumeroPlazaAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new PositionRepository(q);
        var exists = await repo.ExisteNumeroPlazaAsync(9999);

        Assert.False(exists);
    }

    [Fact]
    public async Task InsertarAsync_EjecutaComandoConParametros()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new PositionRepository(q);
        await repo.InsertarAsync(new Position
        {
            NumeroPlaza = 1001,
            IdUnidad = 1,
            IdDepartamento = null,
            IdSeccion = 3,
            IdArea = null,
        });

        Assert.NotNull(command);
        Assert.Equal(1001m, command!.Parameters[":numeroPlaza"].Value);
        Assert.Equal(1, command.Parameters[":idUnidad"].Value);
        Assert.Equal(DBNull.Value, command.Parameters[":idDepartamento"].Value);
        Assert.Equal(3, command.Parameters[":idSeccion"].Value);
        Assert.Equal(DBNull.Value, command.Parameters[":idArea"].Value);
    }

    [Fact]
    public async Task InsertarAsync_LanzaExcepcionCuandoPlazaEsNull()
    {
        var repo = new PositionRepository(Substitute.For<IQueryExecutor>());

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task ObtenerPorNumeroAsync_ReturnsPlazaCuandoExiste()
    {
        var table = CrearTablaPlazas();
        table.Rows.Add(1001L, 1, DBNull.Value, 3, DBNull.Value);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Position?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Position?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionRepository(q);
        var plaza = await repo.ObtenerPorNumeroAsync(1001);

        Assert.NotNull(plaza);
        Assert.Equal(1001UL, plaza!.NumeroPlaza);
        Assert.Equal(1, plaza.IdUnidad);
        Assert.Null(plaza.IdDepartamento);
        Assert.Equal(3, plaza.IdSeccion);
        Assert.Null(plaza.IdArea);
    }

    [Fact]
    public async Task ObtenerPorNumeroAsync_MapeaRelacionesOpcionalesAlternas()
    {
        var table = CrearTablaPlazas();
        table.Rows.Add(1002L, DBNull.Value, 2, DBNull.Value, 4);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Position?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Position?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionRepository(q);
        var plaza = await repo.ObtenerPorNumeroAsync(1002);

        Assert.NotNull(plaza);
        Assert.Equal(1002UL, plaza!.NumeroPlaza);
        Assert.Null(plaza.IdUnidad);
        Assert.Equal(2, plaza.IdDepartamento);
        Assert.Null(plaza.IdSeccion);
        Assert.Equal(4, plaza.IdArea);
    }

    [Fact]
    public async Task ObtenerPorNumeroAsync_ReturnsNullCuandoNoExiste()
    {
        var table = CrearTablaPlazas();
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Position?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Position?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionRepository(q);
        var plaza = await repo.ObtenerPorNumeroAsync(9999);

        Assert.Null(plaza);
    }

    [Fact]
    public async Task ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new PositionRepository(q);
        var updated = await repo.ActualizarAsync(1001, new Position { NumeroPlaza = 1001, IdUnidad = 1, IdArea = 4 });

        Assert.True(updated);
    }

    [Fact]
    public async Task ActualizarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new PositionRepository(q);
        var updated = await repo.ActualizarAsync(9999, new Position { NumeroPlaza = 9999 });

        Assert.False(updated);
    }

    [Fact]
    public async Task ActualizarAsync_LanzaExcepcionCuandoPlazaEsNull()
    {
        var repo = new PositionRepository(Substitute.For<IQueryExecutor>());

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync(1001, null!));
    }

    private static DataTable CrearTablaPlazas()
    {
        var table = new DataTable();
        table.Columns.Add("NUMERO_PLAZA", typeof(long));
        table.Columns.Add("ID_UNIDAD", typeof(int));
        table.Columns.Add("ID_DEPARTAMENTO", typeof(int));
        table.Columns.Add("ID_SECCION", typeof(int));
        table.Columns.Add("ID_AREA", typeof(int));
        return table;
    }
}
