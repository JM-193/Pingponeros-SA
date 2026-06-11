// RepositoriesTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Xunit;

namespace Backend.Tests;

public sealed class RepositoriesTests
{
    [Fact]
    public async Task AreaRepository_ObtenerTodasAsync_ReturnsAreas()
    {
        var table = new DataTable();
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(1, "Area A", "Desc A", 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Area>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Area>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new AreaRepository(q);
        var res = await repo.ObtenerTodasAsync();

        Assert.Single(res);
        Assert.Equal("Area A", res[0].Nombre);
    }

    [Fact]
    public async Task AreaRepository_ExisteNombreAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new AreaRepository(q);
        var exists = await repo.ExisteNombreAsync("Area A");

        Assert.True(exists);
    }

    [Fact]
    public async Task AreaRepository_InsertarAsync_ReturnsInsertedId()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(new OracleDecimal(42));
            });

        var repo = new AreaRepository(q);
        var id = await repo.InsertarAsync(new Area { Nombre = "X", Descripcion = "Y", Estado = 1 });

        Assert.Equal(42, id);
    }

    [Fact]
    public async Task AreaRepository_InsertarAsync_LanzaExcepcionCuandoAreaEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new AreaRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task AreaRepository_ExisteNombreAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new AreaRepository(q);
        var exists = await repo.ExisteNombreAsync("NoExiste");

        Assert.False(exists);
    }

    [Fact]
    public async Task AreaRepository_ObtenerTodasAsync_ReturnsEmptyList()
    {
        var table = new DataTable();
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Area>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Area>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new AreaRepository(q);
        var res = await repo.ObtenerTodasAsync();

        Assert.Empty(res);
    }

    [Fact]
    public async Task AreaRepository_ObtenerPorNombreAsync_ReturnsAreaCuandoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add(5, "Sistemas", "Área de sistemas", 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Area?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Area?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new AreaRepository(q);
        var area = await repo.ObtenerPorNombreAsync("Sistemas");

        Assert.NotNull(area);
        Assert.Equal(5, area!.Id);
        Assert.Equal("Sistemas", area.Nombre);
    }

    [Fact]
    public async Task AreaRepository_ObtenerPorNombreAsync_ReturnsNullCuandoNoExiste()
    {
        var table = new DataTable();
        table.Columns.Add("ID_AREA", typeof(int));
        table.Columns.Add("NOMBRE", typeof(string));
        table.Columns.Add("DESCRIPCION", typeof(string));
        table.Columns.Add("ESTADO", typeof(int));

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Area?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Area?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new AreaRepository(q);
        var area = await repo.ObtenerPorNombreAsync("NoExiste");

        Assert.Null(area);
    }

    [Fact]
    public async Task AreaRepository_ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new AreaRepository(q);
        var updated = await repo.ActualizarAsync("Sistemas", new Area { Nombre = "Sistemas", Descripcion = "Nueva desc", Estado = 1 });

        Assert.True(updated);
    }

    [Fact]
    public async Task AreaRepository_ActualizarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new AreaRepository(q);
        var updated = await repo.ActualizarAsync("NoExiste", new Area { Nombre = "NoExiste", Descripcion = "Desc", Estado = 1 });

        Assert.False(updated);
    }

    [Fact]
    public async Task AreaRepository_ActualizarAsync_LanzaExcepcionCuandoAreaEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new AreaRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("Sistemas", null!));
    }

    [Fact]
    public async Task AreaRepository_DesactivarAsync_ReturnsTrueWhenDeactivated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new AreaRepository(q);
        var result = await repo.DesactivarAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task AreaRepository_DesactivarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new AreaRepository(q);
        var result = await repo.DesactivarAsync(99);

        Assert.False(result);
    }

    [Fact]
    public async Task UserRepository_ObtenerPorCorreoAsync_ReturnsUsuario()
    {
        var table = new DataTable();
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("PRIMER_NOMBRE", typeof(string));
        table.Columns.Add("SEGUNDO_NOMBRE", typeof(string));
        table.Columns.Add("PRIMER_APELLIDO", typeof(string));
        table.Columns.Add("SEGUNDO_APELLIDO", typeof(string));
        table.Columns.Add("ROL", typeof(int));
        table.Columns.Add("ESTADO", typeof(int));
        table.Rows.Add("u@test.com", "U", DBNull.Value, "T", DBNull.Value, 1, 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Usuario?>>>() )
            .Returns(ci =>
            {
                var map = (Func<DbDataReader, Task<Usuario?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var usuario = await repo.ObtenerPorCorreoAsync("u@test.com");

        Assert.NotNull(usuario);
        Assert.Equal("u@test.com", usuario!.CorreoInstitucional);
    }

    [Fact]
    public async Task UserRepository_ObtenerContrasenaMasRecienteAsync_ReturnsContrasena()
    {
        var vencimiento = DateTime.Now.AddDays(2);
        var table = new DataTable();
        table.Columns.Add("CONTRASENA_HASH", typeof(string));
        table.Columns.Add("FECHA_EXPIRACION", typeof(DateTime));
        table.Columns.Add("ES_TEMPORAL", typeof(int));
        table.Rows.Add("hashvalue", vencimiento, 1);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Password?>>>() )
            .Returns(ci =>
            {
                var map = (Func<DbDataReader, Task<Password?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var contrasena = await repo.ObtenerContrasenaMasRecienteAsync("u@test.com");

        Assert.NotNull(contrasena);
        Assert.Equal("hashvalue", contrasena!.Hash);
        Assert.True(contrasena.EsTemporal);
        Assert.Equal(vencimiento, contrasena.FechaExpiracion);
    }

    [Fact]
    public async Task UserRepository_ActualizarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(1);

        var repo = new UserRepository(q);
        var updated = await repo.ActualizarAsync("u@test.com", new Usuario { CorreoInstitucional = "u@test.com", PrimerNombre = "A", PrimerApellido = "B", Rol = 0, Estado = 1 });

        Assert.True(updated);
    }

    [Fact]
    public async Task UserRepository_EliminarAsync_ReturnsTrueWhenDeleted()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>()).Returns(1);

        var repo = new UserRepository(q);
        var deleted = await repo.EliminarAsync("u@test.com");

        Assert.True(deleted);
    }
}
