using System.Data;
using System.Data.Common;
using Backend.Models;
using Backend.Repositories;
using NSubstitute;
using Oracle.ManagedDataAccess.Client;
using Xunit;

namespace Backend.Tests;

public sealed class PositionAssignmentRepositoryTests
{
    [Fact]
    public async Task ObtenerActivasPorUsuarioAsync_MapeaFilasConNombreDePuesto()
    {
        var table = CrearTablaAsignaciones();
        table.Rows.Add(1001L, "ana@test.com", 5, "Analista", "Profesional 1", new DateTime(2026, 1, 1), DBNull.Value);
        table.Rows.Add(1002L, "ana@test.com", 6, "Asistente", "Tecnico", new DateTime(2026, 2, 1), DBNull.Value);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<PositionAssignment>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<PositionAssignment>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionAssignmentRepository(q);
        var asignaciones = await repo.ObtenerActivasPorUsuarioAsync("ana@test.com");

        Assert.Equal(2, asignaciones.Count);
        Assert.Equal(1001UL, asignaciones[0].NumeroPlaza);
        Assert.Equal("ana@test.com", asignaciones[0].CorreoInstitucional);
        Assert.Equal(5, asignaciones[0].IdPuesto);
        Assert.Equal("Analista", asignaciones[0].PuestoNombre);
        Assert.Equal("Profesional 1", asignaciones[0].ClaseOcupacional);
        Assert.Equal(new DateTime(2026, 1, 1), asignaciones[0].FechaInicio);
        Assert.Null(asignaciones[0].FechaFinal);
    }

    [Fact]
    public async Task ObtenerPlazasDisponiblesAsync_MapeaPlazas()
    {
        var table = CrearTablaPlazas();
        table.Rows.Add(2001L, 1, DBNull.Value, 3, DBNull.Value);
        table.Rows.Add(2002L, DBNull.Value, DBNull.Value, DBNull.Value, DBNull.Value);

        var q = Substitute.For<IQueryExecutor>();
        q.QueryAsync(Arg.Any<Func<OracleConnection, OracleCommand>>(), Arg.Any<Func<DbDataReader, Task<List<Position>>>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                var map = (Func<DbDataReader, Task<List<Position>>>)ci[1]!;
                using var reader = table.CreateDataReader();
                return map(reader);
            });

        var repo = new PositionAssignmentRepository(q);
        var disponibles = await repo.ObtenerPlazasDisponiblesAsync();

        Assert.Equal(2, disponibles.Count);
        Assert.Equal(2001UL, disponibles[0].NumeroPlaza);
        Assert.Equal(1, disponibles[0].IdUnidad);
        Assert.Null(disponibles[1].IdUnidad);
    }

    [Fact]
    public async Task PlazaTieneAsignacionActivaAsync_ReturnsTrueWhenExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(1);
            });

        var repo = new PositionAssignmentRepository(q);
        Assert.True(await repo.PlazaTieneAsignacionActivaAsync(1001));
    }

    [Fact]
    public async Task PlazaTieneAsignacionActivaAsync_ReturnsFalseWhenNotExists()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteScalarAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult<object?>(0);
            });

        var repo = new PositionAssignmentRepository(q);
        Assert.False(await repo.PlazaTieneAsignacionActivaAsync(9999));
    }

    [Fact]
    public async Task AsignarAsync_EjecutaComandoConParametros()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new PositionAssignmentRepository(q);
        await repo.AsignarAsync(new PositionAssignment
        {
            NumeroPlaza = 1001,
            CorreoInstitucional = "ana@test.com",
            IdPuesto = 5,
            ClaseOcupacional = "Profesional 1",
            FechaInicio = new DateTime(2026, 1, 1),
            FechaFinal = null,
        });

        Assert.NotNull(command);
        Assert.Equal(1001m, command!.Parameters[":numeroPlaza"].Value);
        Assert.Equal("ana@test.com", command.Parameters[":correo"].Value);
        Assert.Equal(5, command.Parameters[":idPuesto"].Value);
        Assert.Equal("Profesional 1", command.Parameters[":claseOcupacional"].Value);
        Assert.Equal(new DateTime(2026, 1, 1), command.Parameters[":fechaInicio"].Value);
        Assert.Equal(DBNull.Value, command.Parameters[":fechaFinal"].Value);
    }

    [Fact]
    public async Task AsignarAsync_EnviaFechaFinalCuandoPresente()
    {
        OracleCommand? command = null;
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                command = ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new PositionAssignmentRepository(q);
        await repo.AsignarAsync(new PositionAssignment
        {
            NumeroPlaza = 1001,
            CorreoInstitucional = "ana@test.com",
            IdPuesto = 5,
            ClaseOcupacional = "Profesional 1",
            FechaInicio = new DateTime(2026, 1, 1),
            FechaFinal = new DateTime(2026, 6, 1),
        });

        Assert.NotNull(command);
        Assert.Equal(new DateTime(2026, 6, 1), command!.Parameters[":fechaFinal"].Value);
    }

    [Fact]
    public async Task AsignarAsync_LanzaExcepcionCuandoEsNull()
    {
        var repo = new PositionAssignmentRepository(Substitute.For<IQueryExecutor>());
        await Assert.ThrowsAsync<ArgumentNullException>(() => repo.AsignarAsync(null!));
    }

    [Fact]
    public async Task DesasignarAsync_ReturnsTrueWhenUpdated()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(1);
            });

        var repo = new PositionAssignmentRepository(q);
        Assert.True(await repo.DesasignarAsync(1001, "ana@test.com"));
    }

    [Fact]
    public async Task DesasignarAsync_ReturnsFalseWhenNoActiveRow()
    {
        var q = Substitute.For<IQueryExecutor>();
        q.ExecuteAsync(Arg.Any<Func<OracleConnection, OracleCommand>>())
            .Returns(ci =>
            {
                ((Func<OracleConnection, OracleCommand>)ci[0]!)(new OracleConnection());
                return Task.FromResult(0);
            });

        var repo = new PositionAssignmentRepository(q);
        Assert.False(await repo.DesasignarAsync(9999, "ana@test.com"));
    }

    private static DataTable CrearTablaAsignaciones()
    {
        var table = new DataTable();
        table.Columns.Add("NUMERO_PLAZA", typeof(long));
        table.Columns.Add("CORREO_INSTITUCIONAL", typeof(string));
        table.Columns.Add("ID_PUESTO", typeof(int));
        table.Columns.Add("PUESTO_NOMBRE", typeof(string));
        table.Columns.Add("CLASE_OCUPACIONAL", typeof(string));
        table.Columns.Add("FECHA_INICIO", typeof(DateTime));
        table.Columns.Add("FECHA_FINAL", typeof(DateTime));
        return table;
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
