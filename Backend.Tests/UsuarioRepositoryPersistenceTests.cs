using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class UserRepositoryPersistenceTests
{
    [Fact]
    public async Task ObtenerTodosAsync_ReturnsUsuarios()
    {
        var table = CrearTablaUsuarios();
        table.Rows.Add("ana@test.com", "Ana", DBNull.Value, "Lopez", DBNull.Value, 0, 1);
        table.Rows.Add("juan@test.com", "Juan", "Carlos", "Mora", "Vega", 1, 0);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<User>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<User>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var usuarios = (await repo.ObtenerTodosAsync()).ToList();

        Assert.Equal(2, usuarios.Count);
        Assert.Equal("ana@test.com", usuarios[0].CorreoInstitucional);
        Assert.Null(usuarios[0].SegundoNombre);
        Assert.Equal("Carlos", usuarios[1].SegundoNombre);
        Assert.Equal("Vega", usuarios[1].SegundoApellido);
    }

    [Fact]
    public async Task ObtenerPorCorreoAsync_ReturnsNullCuandoNoExiste()
    {
        var table = CrearTablaUsuarios();
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<User?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<User?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var usuario = await repo.ObtenerPorCorreoAsync("noexiste@test.com");

        Assert.Null(usuario);
    }

    [Fact]
    public async Task ObtenerContrasenaMasRecienteAsync_ReturnsNullCuandoNoExiste()
    {
        var table = CrearTablaContrasenas();
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Password?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Password?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var contrasena = await repo.ObtenerContrasenaMasRecienteAsync("noexiste@test.com");

        Assert.Null(contrasena);
    }

    [Fact]
    public async Task ObtenerHashMasRecienteAsync_ReturnsHashCuandoExiste()
    {
        var vencimiento = DateTime.Now.AddDays(90);
        var table = CrearTablaContrasenas();
        table.Rows.Add("hash-activo", vencimiento, 0);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<Password?>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<Password?>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new UserRepository(q);
        var hash = await repo.ObtenerHashMasRecienteAsync("ana@test.com");

        Assert.Equal("hash-activo", hash);
    }

    [Fact]
    public async Task InsertarAsync_EjecutaComandoConParametrosNormalizados()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UserRepository(q);
        await repo.InsertarAsync(new User
        {
            CorreoInstitucional = "ana@test.com",
            PrimerNombre = "Ana",
            SegundoNombre = null,
            PrimerApellido = "Lopez",
            SegundoApellido = "Mora",
            Rol = 0,
            Estado = 1,
        });

        Assert.NotNull(command);
        Assert.Equal("ana@test.com", command!.Parameters["correo"].Value);
        var segundoNombre = command.Parameters["segundoNombre"].Value;
        Assert.True(segundoNombre is null || segundoNombre == DBNull.Value);
        Assert.Equal("Mora", command.Parameters["segundoApellido"].Value);
    }

    [Fact]
    public async Task InsertarConContrasenaAsync_InsertaUsuarioYContrasena()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UserRepository(q);
        await repo.InsertarConContrasenaAsync(
            new User { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 },
            "hash-temporal");

        await q.Received(2).ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>());
    }

    [Fact]
    public async Task CambiarContrasenaAsync_EjecutaComandoConHashNoTemporal()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UserRepository(q);
        await repo.ChangePasswordAsync("ana@test.com", "hash-nuevo");

        Assert.NotNull(command);
        Assert.Equal("ana@test.com", command!.Parameters["correo"].Value);
        Assert.Equal("hash-nuevo", command.Parameters["hash"].Value);
        Assert.Contains("SYSDATE + 90", command.CommandText, StringComparison.Ordinal);
        Assert.Contains("0)", command.CommandText, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DesactivarPorContrasenaTemporalExpiradaAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UserRepository(q);
        var result = await repo.DesactivarPorContrasenaTemporalExpiradaAsync("ana@test.com");

        Assert.True(result);
    }

    [Fact]
    public async Task DesactivarPorContrasenaTemporalExpiradaAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new UserRepository(q);
        var result = await repo.DesactivarPorContrasenaTemporalExpiradaAsync("noexiste@test.com");

        Assert.False(result);
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

        var repo = new UserRepository(q);
        var updated = await repo.ActualizarAsync("ana@test.com", new User
        {
            CorreoInstitucional = "ana@test.com",
            PrimerNombre = "Ana",
            SegundoNombre = null,
            PrimerApellido = "Lopez",
            SegundoApellido = "Mora",
            Rol = 1,
            Estado = 1,
        });

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

        var repo = new UserRepository(q);
        var updated = await repo.ActualizarAsync("noexiste@test.com", new User
        {
            CorreoInstitucional = "noexiste@test.com",
            PrimerNombre = "NoExiste",
            PrimerApellido = "Usuario",
            Rol = 0,
            Estado = 1,
        });

        Assert.False(updated);
    }

    [Fact]
    public async Task ActualizarAsync_LanzaExcepcionCuandoUsuarioEsNulo()
    {
        var q = Substitute.For<IQueryExecutor>();
        var repo = new UserRepository(q);

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("ana@test.com", null!));
    }

    [Fact]
    public async Task EliminarAsync_ReturnsTrueWhenDeactivated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new UserRepository(q);
        var result = await repo.EliminarAsync("ana@test.com");

        Assert.True(result);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsFalseWhenNotFound()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new UserRepository(q);
        var result = await repo.EliminarAsync("noexiste@test.com");

        Assert.False(result);
    }

    private static DataTable CrearTablaUsuarios()
    {
        var table = new DataTable();
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("PRIMER_NOMBRE", typeof(string));
        table.Columns.Add("SEGUNDO_NOMBRE", typeof(string));
        table.Columns.Add("PRIMER_APELLIDO", typeof(string));
        table.Columns.Add("SEGUNDO_APELLIDO", typeof(string));
        table.Columns.Add("ROL", typeof(int));
        table.Columns.Add("ESTADO", typeof(int));
        return table;
    }

    private static DataTable CrearTablaContrasenas()
    {
        var table = new DataTable();
        table.Columns.Add("CONTRASENA_HASH", typeof(string));
        table.Columns.Add("FECHA_EXPIRACION", typeof(DateTime));
        table.Columns.Add("ES_TEMPORAL", typeof(int));
        return table;
    }
}
