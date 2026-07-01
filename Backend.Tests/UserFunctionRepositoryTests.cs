// UserFunctionRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class UserFunctionRepositoryTests
{
    [Fact]
    public async Task ObtenerTodasAsync_ReturnsFunciones()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION_PROPIA", typeof(int));
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(1, "usuario1@ucr.ac.cr", "Función propia A", "Descripción A");
        table.Rows.Add(2, "usuario2@ucr.ac.cr", "Función propia B", "Descripción B");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<UserFunction>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<UserFunction>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserFunctionRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("usuario1@ucr.ac.cr", result[0].CorreoInstitucional);
        Assert.Equal("Función propia A", result[0].Nombre);
        Assert.Equal("Descripción A", result[0].Descripcion);
    }

    [Fact]
    public async Task ObtenerTodasAsync_ReturnsListaVacia()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION_PROPIA", typeof(int));
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<UserFunction>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<UserFunction>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserFunctionRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task ObtenerPorCorreoAsync_ReturnsFuncionesDelUsuario()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION_PROPIA", typeof(int));
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Rows.Add(1, "carlos@ucr.ac.cr", "Mi función", "Descripción de mi función");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<UserFunction>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<UserFunction>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserFunctionRepository(q);
        var result = await repo.ObtenerPorCorreoAsync("carlos@ucr.ac.cr");

        Assert.Single(result);
        Assert.Equal("carlos@ucr.ac.cr", result[0].CorreoInstitucional);
        Assert.Equal("Mi función", result[0].Nombre);
    }

    [Fact]
    public async Task ObtenerPorCorreoAsync_ReturnsListaVaciaCuandoNoHayFunciones()
    {
        var table = new DataTable();
        table.Columns.Add("ID_FUNCION_PROPIA", typeof(int));
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<UserFunction>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<UserFunction>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserFunctionRepository(q);
        var result = await repo.ObtenerPorCorreoAsync("sinregistros@ucr.ac.cr");

        Assert.Empty(result);
    }

    [Fact]
    public async Task InsertarAsync_ReturnsIdInsertado()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(10));
            });

        var repo = new UserFunctionRepository(q);
        var id = await repo.InsertarAsync(new UserFunction
        {
            CorreoInstitucional = "carlos@ucr.ac.cr",
            Nombre = "Mi función",
            Descripcion = "Descripción de mi función",
        });

        Assert.Equal(10, id);
    }

    [Fact]
    public async Task InsertarAsync_LanzaExcepcionCuandoFuncionEsNula()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new UserFunctionRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task EstaEnActividadesAsync_ReturnsTrueCuandoTieneActividades()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(2);
            });

        var repo = new UserFunctionRepository(q);
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

        var repo = new UserFunctionRepository(q);
        var enActividades = await repo.EstaEnActividadesAsync(99);

        Assert.False(enActividades);
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

        var repo = new UserFunctionRepository(q);
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

        var repo = new UserFunctionRepository(q);
        var eliminado = await repo.EliminarAsync(99);

        Assert.False(eliminado);
    }
}
