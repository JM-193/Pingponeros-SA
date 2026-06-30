// OccupationalClassRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class OccupationalClassRepositoryTests
{
    [Fact]
    public async Task ObtenerTodasAsync_ReturnsClases()
    {
        var table = CrearTabla();
        table.Rows.Add(10L, 100, "Profesional 1");
        table.Rows.Add(11L, 200, "Tecnico");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<OccupationalClass>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<OccupationalClass>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new OccupationalClassRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal(10L, result[0].IdClaseOcupacional);
        Assert.Equal(100, result[0].Codigo);
        Assert.Equal("Profesional 1", result[0].Nombre);
        Assert.Equal("Tecnico", result[1].Nombre);
    }

    [Fact]
    public async Task ObtenerTodasAsync_NombreNuloSeMapeaComoCadenaVacia()
    {
        var table = CrearTabla();
        table.Rows.Add(12L, 300, DBNull.Value);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<OccupationalClass>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<OccupationalClass>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new OccupationalClassRepository(q);
        var result = await repo.ObtenerTodasAsync();

        Assert.Single(result);
        Assert.Equal(string.Empty, result[0].Nombre);
    }

    [Fact]
    public async Task ExisteNombreAsync_ReturnsTrueCuandoExiste()
    {
        var q = SustitutoScalar(1);
        var repo = new OccupationalClassRepository(q);

        Assert.True(await repo.ExisteNombreAsync("Profesional 1"));
    }

    [Fact]
    public async Task ExisteNombreAsync_ReturnsFalseCuandoNoExiste()
    {
        var q = SustitutoScalar(0);
        var repo = new OccupationalClassRepository(q);

        Assert.False(await repo.ExisteNombreAsync("noexiste"));
    }

    [Fact]
    public async Task ExisteCodigoAsync_ReturnsTrueCuandoExiste()
    {
        var q = SustitutoScalar(1);
        var repo = new OccupationalClassRepository(q);

        Assert.True(await repo.ExisteCodigoAsync(100));
    }

    [Fact]
    public async Task ExisteCodigoAsync_ReturnsFalseCuandoNoExiste()
    {
        var q = SustitutoScalar(0);
        var repo = new OccupationalClassRepository(q);

        Assert.False(await repo.ExisteCodigoAsync(999));
    }

    [Fact]
    public async Task InsertarAsync_ReturnsIdInsertado()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(7));
            });

        var repo = new OccupationalClassRepository(q);
        var id = await repo.InsertarAsync(new OccupationalClass { Codigo = 100, Nombre = "Profesional 1" });

        Assert.Equal(7L, id);
        Assert.NotNull(command);
        Assert.Equal(100, command!.Parameters[":codigo"].Value);
        Assert.Equal("Profesional 1", command.Parameters[":nombre"].Value);
    }

    [Fact]
    public async Task InsertarAsync_LanzaExcepcionCuandoEsNull()
    {
        var repo = new OccupationalClassRepository(Substitute.For<IQueryExecutor>());

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task ObtenerPorIdAsync_ReturnsClaseCuandoExiste()
    {
        var table = CrearTabla();
        table.Rows.Add(15L, 400, "Servicio");

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<OccupationalClass?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<OccupationalClass?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new OccupationalClassRepository(q);
        var clase = await repo.ObtenerPorIdAsync(15);

        Assert.NotNull(clase);
        Assert.Equal(15L, clase!.IdClaseOcupacional);
        Assert.Equal(400, clase.Codigo);
        Assert.Equal("Servicio", clase.Nombre);
    }

    [Fact]
    public async Task ObtenerPorIdAsync_ReturnsNullCuandoNoExiste()
    {
        var table = CrearTabla();

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<OccupationalClass?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<OccupationalClass?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new OccupationalClassRepository(q);
        var clase = await repo.ObtenerPorIdAsync(999);

        Assert.Null(clase);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsTrueCuandoSeElimina()
    {
        var q = SustitutoExecute(1);
        var repo = new OccupationalClassRepository(q);

        Assert.True(await repo.EliminarAsync(15));
    }

    [Fact]
    public async Task EliminarAsync_ReturnsFalseCuandoNoExiste()
    {
        var q = SustitutoExecute(0);
        var repo = new OccupationalClassRepository(q);

        Assert.False(await repo.EliminarAsync(999));
    }

    [Fact]
    public async Task EstaAsociadoAsync_ReturnsTrueCuandoTienePlazas()
    {
        var q = SustitutoScalar(2);
        var repo = new OccupationalClassRepository(q);

        Assert.True(await repo.EstaAsociadoAsync(15));
    }

    [Fact]
    public async Task EstaAsociadoAsync_ReturnsFalseCuandoNoTienePlazas()
    {
        var q = SustitutoScalar(0);
        var repo = new OccupationalClassRepository(q);

        Assert.False(await repo.EstaAsociadoAsync(15));
    }

    private static DataTable CrearTabla()
    {
        var table = new DataTable();
        table.Columns.Add("ID_CLASE_OCUPACIONAL", typeof(long));
        table.Columns.Add("CODIGO", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        return table;
    }

    private static IQueryExecutor SustitutoScalar(object? valor)
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(valor);
            });
        return q;
    }

    private static IQueryExecutor SustitutoExecute(int filas)
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(filas);
            });
        return q;
    }
}
