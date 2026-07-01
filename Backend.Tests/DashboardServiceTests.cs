// DashboardServiceTests.cs
using System.Globalization;
using Backend.Models;
using Backend.Repositories;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class DashboardServiceTests
{
    private static IDashboardRepository CrearRepo(
        DashboardConteos conteos,
        List<ConteoEtiqueta>? plazasPorArea = null,
        List<ConteoEtiqueta>? asignaciones = null,
        List<DashboardPlazaAsignada>? ultimasPlazas = null,
        List<DashboardDeclaracionReciente>? declaraciones = null)
    {
        var repo = Substitute.For<IDashboardRepository>();
        repo.ObtenerConteosAsync().Returns(conteos);
        repo.ObtenerPlazasPorAreaAsync().Returns(plazasPorArea ?? new List<ConteoEtiqueta>());
        repo.ObtenerAsignacionesPorPeriodoAsync().Returns(asignaciones ?? new List<ConteoEtiqueta>());
        repo.ObtenerUltimasPlazasAsignadasAsync(Arg.Any<int>()).Returns(ultimasPlazas ?? new List<DashboardPlazaAsignada>());
        repo.ObtenerDeclaracionesRecientesAsync(Arg.Any<int>()).Returns(declaraciones ?? new List<DashboardDeclaracionReciente>());
        return repo;
    }

    private static DashboardResumen ResumenDeResultado(IResult result)
    {
        var ok = Assert.IsType<Ok<DashboardResumen>>(result);
        Assert.NotNull(ok.Value);
        return ok.Value!;
    }

    [Fact]
    public async Task ObtenerResumenAsync_RepartelosConteosEntreLasSecciones()
    {
        var conteos = new DashboardConteos
        {
            TotalUsuarios = 50,
            UsuariosActivos = 40,
            UsuariosInactivos = 10,
            Administradores = 5,
            UsuariosRol = 45,
            TotalPlazas = 30,
            PlazasAsignadas = 18,
            DeclaracionesCompletadas = 12,
            DeclaracionesPendientes = 7,
            ContrasenasPorExpirar = 3,
        };
        var svc = new DashboardService(CrearRepo(conteos));

        var resumen = ResumenDeResultado(await svc.ObtenerResumenAsync(isDev: false));

        Assert.Equal(50, resumen.Indicadores.TotalUsuarios);
        Assert.Equal(40, resumen.Indicadores.UsuariosActivos);
        Assert.Equal(30, resumen.Indicadores.TotalPlazas);
        Assert.Equal(18, resumen.Indicadores.PlazasAsignadas);
        Assert.Equal(12, resumen.Indicadores.PlazasDisponibles);
        Assert.Equal(12, resumen.Indicadores.DeclaracionesCompletadas);
        Assert.Equal(7, resumen.Indicadores.DeclaracionesPendientes);

        Assert.Equal(7, resumen.Alertas.DeclaracionesPendientes);
        Assert.Equal(3, resumen.Alertas.ContrasenasPorExpirar);
        Assert.Equal(10, resumen.Alertas.UsuariosInactivos);
        Assert.Equal(12, resumen.Alertas.PlazasSinAsignar);

        Assert.Equal(5, resumen.UsuariosPorRol.Administradores);
        Assert.Equal(45, resumen.UsuariosPorRol.Usuarios);

        Assert.Equal(12, resumen.EstadoDeclaraciones.Completadas);
        Assert.Equal(7, resumen.EstadoDeclaraciones.Pendientes);
    }

    [Fact]
    public async Task ObtenerResumenAsync_PlazasDisponiblesNuncaEsNegativo()
    {
        // Más plazas asignadas que totales (estado inconsistente): se debe acotar a 0.
        var conteos = new DashboardConteos { TotalPlazas = 5, PlazasAsignadas = 8 };
        var svc = new DashboardService(CrearRepo(conteos));

        var resumen = ResumenDeResultado(await svc.ObtenerResumenAsync(isDev: false));

        Assert.Equal(0, resumen.Indicadores.PlazasDisponibles);
        Assert.Equal(0, resumen.Alertas.PlazasSinAsignar);
    }

    [Fact]
    public async Task ObtenerResumenAsync_RellenaDoceMesesContinuos()
    {
        var inicio = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-11);
        var mesActual = inicio.AddMonths(11).ToString("yyyy-MM", CultureInfo.InvariantCulture);
        var mesInicio = inicio.ToString("yyyy-MM", CultureInfo.InvariantCulture);

        var asignaciones = new List<ConteoEtiqueta>
        {
            new() { Etiqueta = mesInicio, Cantidad = 3 },
            new() { Etiqueta = mesActual, Cantidad = 9 },
            new() { Etiqueta = "1999-01", Cantidad = 100 }, // fuera de la ventana: se ignora
        };
        var svc = new DashboardService(CrearRepo(new DashboardConteos(), asignaciones: asignaciones));

        var resumen = ResumenDeResultado(await svc.ObtenerResumenAsync(isDev: false));
        var serie = resumen.AsignacionesPorPeriodo;

        Assert.Equal(12, serie.Count);
        Assert.Equal(mesInicio, serie[0].Etiqueta);
        Assert.Equal(3, serie[0].Cantidad);
        Assert.Equal(mesActual, serie[11].Etiqueta);
        Assert.Equal(9, serie[11].Cantidad);
        // Un mes intermedio sin datos se rellena con 0.
        Assert.Equal(0, serie[5].Cantidad);
        // El mes fuera de la ventana de 12 meses no aparece.
        Assert.DoesNotContain(serie, e => e.Etiqueta == "1999-01");
    }

    [Fact]
    public async Task ObtenerResumenAsync_PropagaTablasYDistribuciones()
    {
        var plazasPorArea = new List<ConteoEtiqueta> { new() { Etiqueta = "Recursos Humanos", Cantidad = 4 } };
        var ultimasPlazas = new List<DashboardPlazaAsignada>
        {
            new() { NumeroPlaza = 1001, Usuario = "Ana Perez", Puesto = "Analista", FechaInicio = new DateTime(2026, 1, 1) },
        };
        var declaraciones = new List<DashboardDeclaracionReciente>
        {
            new() { Id = 7, Usuario = "Ana Perez", NumeroPlaza = 1001, FechaDeclaracion = new DateTime(2026, 2, 1), Completa = 1 },
        };
        var svc = new DashboardService(CrearRepo(
            new DashboardConteos(),
            plazasPorArea: plazasPorArea,
            ultimasPlazas: ultimasPlazas,
            declaraciones: declaraciones));

        var resumen = ResumenDeResultado(await svc.ObtenerResumenAsync(isDev: false));

        Assert.Same(plazasPorArea, resumen.PlazasPorArea);
        Assert.Same(ultimasPlazas, resumen.UltimasPlazasAsignadas);
        Assert.Same(declaraciones, resumen.DeclaracionesRecientes);
        Assert.Equal("Recursos Humanos", resumen.PlazasPorArea[0].Etiqueta);
        Assert.Equal(1001UL, resumen.UltimasPlazasAsignadas[0].NumeroPlaza);
        Assert.Equal(7, resumen.DeclaracionesRecientes[0].Id);
    }
}
