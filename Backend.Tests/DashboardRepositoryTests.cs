// DashboardRepositoryTests.cs
using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class DashboardRepositoryTests
{
    private static IQueryExecutor SustitutoQuery<T>(DataTable table)
    {
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<T>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<T>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });
        return q;
    }

    [Fact]
    public async Task ObtenerConteosAsync_MapeaLaFilaEscalar()
    {
        var table = new DataTable();
        foreach (var col in new[]
        {
            "TOTAL_USUARIOS", "USUARIOS_ACTIVOS", "USUARIOS_INACTIVOS", "ADMINISTRADORES", "USUARIOS_ROL",
            "TOTAL_PLAZAS", "PLAZAS_ASIGNADAS", "DECL_COMPLETADAS", "DECL_PENDIENTES", "CONTRASENAS_POR_EXPIRAR",
        })
        {
            table.Columns.Add(col, typeof(decimal));
        }
        table.Rows.Add(50m, 40m, 10m, 5m, 45m, 30m, 18m, 12m, 7m, 3m);

        var repo = new DashboardRepository(SustitutoQuery<DashboardConteos>(table));
        var conteos = await repo.ObtenerConteosAsync();

        Assert.Equal(50, conteos.TotalUsuarios);
        Assert.Equal(40, conteos.UsuariosActivos);
        Assert.Equal(10, conteos.UsuariosInactivos);
        Assert.Equal(5, conteos.Administradores);
        Assert.Equal(45, conteos.UsuariosRol);
        Assert.Equal(30, conteos.TotalPlazas);
        Assert.Equal(18, conteos.PlazasAsignadas);
        Assert.Equal(12, conteos.DeclaracionesCompletadas);
        Assert.Equal(7, conteos.DeclaracionesPendientes);
        Assert.Equal(3, conteos.ContrasenasPorExpirar);
    }

    [Fact]
    public async Task ObtenerPlazasPorAreaAsync_MapeaEtiquetasYCantidades()
    {
        var table = CrearTablaConteos();
        table.Rows.Add("Recursos Humanos", 8m);
        table.Rows.Add("Sin área", 2m);

        var repo = new DashboardRepository(SustitutoQuery<List<ConteoEtiqueta>>(table));
        var resultado = await repo.ObtenerPlazasPorAreaAsync();

        Assert.Equal(2, resultado.Count);
        Assert.Equal("Recursos Humanos", resultado[0].Etiqueta);
        Assert.Equal(8, resultado[0].Cantidad);
        Assert.Equal("Sin área", resultado[1].Etiqueta);
    }

    [Fact]
    public async Task ObtenerAsignacionesPorPeriodoAsync_MapeaSerieMensual()
    {
        var table = CrearTablaConteos();
        table.Rows.Add("2026-05", 4m);
        table.Rows.Add("2026-06", 9m);

        var repo = new DashboardRepository(SustitutoQuery<List<ConteoEtiqueta>>(table));
        var resultado = await repo.ObtenerAsignacionesPorPeriodoAsync();

        Assert.Equal(2, resultado.Count);
        Assert.Equal("2026-06", resultado[1].Etiqueta);
        Assert.Equal(9, resultado[1].Cantidad);
    }

    [Fact]
    public async Task ObtenerUltimasPlazasAsignadasAsync_MapeaFilas()
    {
        var table = new DataTable();
        table.Columns.Add("NUMERO_PLAZA", typeof(long));
        table.Columns.Add("USUARIO", typeof(string));
        table.Columns.Add("PUESTO", typeof(string));
        table.Columns.Add("FECHA_INICIO", typeof(DateTime));
        table.Rows.Add(1001L, "Ana Perez", "Analista", new DateTime(2026, 1, 15));

        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<DashboardPlazaAsignada>>>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<DashboardPlazaAsignada>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new DashboardRepository(q);
        var resultado = await repo.ObtenerUltimasPlazasAsignadasAsync(5);

        Assert.Single(resultado);
        Assert.Equal(1001UL, resultado[0].NumeroPlaza);
        Assert.Equal("Ana Perez", resultado[0].Usuario);
        Assert.Equal("Analista", resultado[0].Puesto);
        Assert.Equal(new DateTime(2026, 1, 15), resultado[0].FechaInicio);
        Assert.NotNull(command);
        Assert.Equal(5, command!.Parameters[":limite"].Value);
    }

    [Fact]
    public async Task ObtenerDeclaracionesRecientesAsync_MapeaFilas()
    {
        var table = new DataTable();
        table.Columns.Add("ID_DECLARACION", typeof(int));
        table.Columns.Add("USUARIO", typeof(string));
        table.Columns.Add("NUMERO_PLAZA", typeof(long));
        table.Columns.Add("FECHA_DECLARACION", typeof(DateTime));
        table.Columns.Add("COMPLETA", typeof(int));
        table.Rows.Add(7, "Ana Perez", 1001L, new DateTime(2026, 2, 1), 1);
        table.Rows.Add(8, "Luis Gomez", 1002L, new DateTime(2026, 2, 2), 0);

        var repo = new DashboardRepository(SustitutoQuery<List<DashboardDeclaracionReciente>>(table));
        var resultado = await repo.ObtenerDeclaracionesRecientesAsync(5);

        Assert.Equal(2, resultado.Count);
        Assert.Equal(7, resultado[0].Id);
        Assert.Equal("Ana Perez", resultado[0].Usuario);
        Assert.Equal(1001UL, resultado[0].NumeroPlaza);
        Assert.Equal(new DateTime(2026, 2, 1), resultado[0].FechaDeclaracion);
        Assert.Equal(1, resultado[0].Completa);
        Assert.Equal(0, resultado[1].Completa);
    }

    private static DataTable CrearTablaConteos()
    {
        var table = new DataTable();
        table.Columns.Add("ETIQUETA", typeof(string));
        table.Columns.Add("CANTIDAD", typeof(decimal));
        return table;
    }
}
