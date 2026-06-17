// RepositoryHelpersTests.cs
using System.Data;
using System.Reflection;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class AreaRepositoryTests
{
    [Fact]
    public async Task InsertarAsync_ThrowsCuandoAreaEsNull()
    {
        var repo = new AreaRepository(Substitute.For<IQueryExecutor>());

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.InsertarAsync(null!));
    }

    [Fact]
    public async Task ActualizarAsync_ThrowsCuandoAreaEsNull()
    {
        var repo = new AreaRepository(Substitute.For<IQueryExecutor>());

        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.ActualizarAsync("area", null!));
    }
}

public sealed class UserRepositoryTests
{
    private static MethodInfo ObtenerMetodoPrivado(string nombre) =>
        typeof(UserRepository).GetMethod(nombre, BindingFlags.NonPublic | BindingFlags.Static)
        ?? throw new InvalidOperationException($"No se encontro el metodo {nombre}.");

    [Fact]
    public void MapearFila_ConvierteOpcionalesEnNull()
    {
        var table = CrearTablaUsuarios();
        table.Rows.Add("ana@test.com", "Ana", DBNull.Value, "Lopez", DBNull.Value, 1, 1);

        using var reader = table.CreateDataReader();
        Assert.True(reader.Read());

        var method = ObtenerMetodoPrivado("MapearFila");
        var usuario = (User)method.Invoke(null, new object[] { reader })!;

        Assert.Null(usuario.SegundoNombre);
        Assert.Null(usuario.SegundoApellido);
    }

    [Fact]
    public void MapearFila_LeeOpcionalesCuandoExisten()
    {
        var table = CrearTablaUsuarios();
        table.Rows.Add("ana@test.com", "Ana", "Maria", "Lopez", "Vega", 0, 1);

        using var reader = table.CreateDataReader();
        Assert.True(reader.Read());

        var method = ObtenerMetodoPrivado("MapearFila");
        var usuario = (User)method.Invoke(null, new object[] { reader })!;

        Assert.Equal("Maria", usuario.SegundoNombre);
        Assert.Equal("Vega", usuario.SegundoApellido);
    }

    [Fact]
    public void AgregarParametros_UsaDbNullParaOpcionalesVacios()
    {
        var cmd = new OracleCommand();
        var usuario = new User
        {
            CorreoInstitucional = "ana@test.com",
            PrimerNombre = "Ana",
            SegundoNombre = null,
            PrimerApellido = "Lopez",
            SegundoApellido = "Cruz",
            Rol = 0,
            Estado = 1,
        };

        var method = ObtenerMetodoPrivado("AgregarParametros");
        method.Invoke(null, new object[] { cmd, usuario });

        var segundoNombre = cmd.Parameters["segundoNombre"].Value;
        var segundoApellido = cmd.Parameters["segundoApellido"].Value;
        Assert.True(segundoNombre is null || segundoNombre == DBNull.Value);
        Assert.True(segundoApellido is null || segundoApellido == DBNull.Value);
    }

    [Fact]
    public void AgregarParametros_UsaValoresParaOpcionales()
    {
        var cmd = new OracleCommand();
        var usuario = new User
        {
            CorreoInstitucional = "ana@test.com",
            PrimerNombre = "Ana",
            SegundoNombre = "Maria",
            PrimerApellido = "Lopez",
            SegundoApellido = "Vega",
            Rol = 0,
            Estado = 1,
        };

        var method = ObtenerMetodoPrivado("AgregarParametros");
        method.Invoke(null, new object[] { cmd, usuario });

        Assert.Equal("Maria", cmd.Parameters["segundoNombre"].Value);
        Assert.Equal("Vega", cmd.Parameters["segundoApellido"].Value);
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
}
