// FunctionRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class FunctionRepositoryTests
{
    [Fact]
    public async Task ObtenerTodasAsync_ReturnsFunciones()
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

        var repo = new FunctionRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Elaborar informes", result[0].Nombre);
        Assert.Equal("Redactar informes mensuales", result[0].Descripcion);
        Assert.Equal("Atención al cliente", result[1].Nombre);
    }

    [Fact]
    public async Task ObtenerTodasAsync_ReturnsListaVacia()
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

        var repo = new FunctionRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Empty(result);
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

        var repo = new FunctionRepository(q);
        var existe = await repo.ExisteNombreAsync("Elaborar informes");

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

        var repo = new FunctionRepository(q);
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
                return Task.FromResult<object?>(new OracleDecimal(5));
            });

        var repo = new FunctionRepository(q);
        var id = await repo.InsertarAsync(new Function { Nombre = "Elaborar informes", Descripcion = "Redactar informes" });

        Assert.Equal(5, id);
    }

    [Fact]
    public async Task InsertarAsync_LanzaExcepcionCuandoFuncionEsNula()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new FunctionRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_ReturnsFuncionCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(3, "Elaborar informes", "Redactar informes mensuales");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Function?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Function?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new FunctionRepository(q);
        var funcion = await repo.ObtenerPorNombreAsync("Elaborar informes");

        Assert.NotNull(funcion);
        Assert.Equal(3, funcion!.Id);
        Assert.Equal("Elaborar informes", funcion.Nombre);
        Assert.Equal("Redactar informes mensuales", funcion.Descripcion);
    }

    [Fact]
    public async Task ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Function?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Function?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new FunctionRepository(q);
        var funcion = await repo.ObtenerPorNombreAsync("noexiste");

        Assert.Null(funcion);
    }

    [Fact]
    public async Task EstaEnActividadesAsync_ReturnsTrueCuandoTieneActividades()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(3);
            });

        var repo = new FunctionRepository(q);
        var enActividades = await repo.EstaEnActividadesAsync(1);

        Assert.True(enActividades);
    }

    [Fact]
    public async Task EstaEnActividadesAsync_ReturnsFalseCuandoNoTieneActividades()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new FunctionRepository(q);
        var enActividades = await repo.EstaEnActividadesAsync(99);

        Assert.False(enActividades);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsTrueCuandoSeElimina()
    {
        // EliminarAsync ejecuta dos queries: DELETE FUNCIONES_PUESTOS luego DELETE FUNCIONES
        var callCount = 0;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                callCount++;
                return Task.FromResult(callCount == 2 ? 1 : 0);
            });

        var repo = new FunctionRepository(q);
        var eliminado = await repo.EliminarAsync(1);

        Assert.True(eliminado);
        Assert.Equal(2, callCount);
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

        var repo = new FunctionRepository(q);
        var eliminado = await repo.EliminarAsync(99);

        Assert.False(eliminado);
    }
}
