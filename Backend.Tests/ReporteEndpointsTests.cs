// ReporteEndpointsTests.cs
using System.Net;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class ReporteEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private const string MimePdf = "application/pdf";
    private const string MimeExcel = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ReporteEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ---------------------------------------------------------------- //
    // GET /reportes/funcionarios                                        //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task Funcionarios_SinDatos_Returns404()
    {
        _factory.ReporteRepo.ObtenerFuncionariosAsync().Returns(new List<ReporteFuncionarioFila>());

        var response = await _client.GetAsync("/reportes/funcionarios?formato=pdf");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var cuerpo = await response.Content.ReadAsStringAsync();
        Assert.Contains("No se encontraron datos para el reporte seleccionado.", cuerpo, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Funcionarios_ConDatos_Pdf_Returns200ConPdf()
    {
        _factory.ReporteRepo.ObtenerFuncionariosAsync().Returns(UnFuncionario());

        var response = await _client.GetAsync("/reportes/funcionarios?formato=pdf");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MimePdf, response.Content.Headers.ContentType?.MediaType);
        Assert.True((await response.Content.ReadAsByteArrayAsync()).Length > 0);
    }

    [Fact]
    public async Task Funcionarios_Excel_Returns200ConXlsx()
    {
        _factory.ReporteRepo.ObtenerFuncionariosAsync().Returns(UnFuncionario());

        var response = await _client.GetAsync("/reportes/funcionarios?formato=excel");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MimeExcel, response.Content.Headers.ContentType?.MediaType);
        Assert.True((await response.Content.ReadAsByteArrayAsync()).Length > 0);
    }

    [Fact]
    public async Task Funcionarios_FormatoInvalido_Returns400()
    {
        _factory.ReporteRepo.ObtenerFuncionariosAsync().Returns(UnFuncionario());

        var response = await _client.GetAsync("/reportes/funcionarios?formato=word");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Funcionarios_SinFormato_DefaultPdf_Returns200()
    {
        _factory.ReporteRepo.ObtenerFuncionariosAsync().Returns(UnFuncionario());

        var response = await _client.GetAsync("/reportes/funcionarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MimePdf, response.Content.Headers.ContentType?.MediaType);
    }

    // ---------------------------------------------------------------- //
    // GET /reportes/declaraciones y /reportes/horas                     //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task Declaraciones_ConDatos_Excel_Returns200ConXlsx()
    {
        _factory.ReporteRepo.ObtenerDeclaracionesAsync().Returns(new List<ReporteDeclaracionFila>
        {
            new() { Id = 1, CorreoInstitucional = "juan@ucr.ac.cr", NombreCompleto = "Juan Pérez", NumeroPlaza = 100, Cargo = "Analista", FechaDeclaracion = DateTime.Today, Completa = 1 },
        });

        var response = await _client.GetAsync("/reportes/declaraciones?formato=excel");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MimeExcel, response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Horas_SinDatos_Returns404()
    {
        _factory.ReporteRepo.ObtenerHorasAsync().Returns(new List<ReporteHorasFila>());

        var response = await _client.GetAsync("/reportes/horas?formato=pdf");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // GET /reportes/declaraciones/{id}/horas  (reporte personal, PDF)   //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task HorasDeclaracion_SinActividades_Returns404()
    {
        _factory.DeclaracionRepo.ObtenerDetalleAsync(Arg.Any<int>()).Returns((DeclaracionDetalle?)null);

        var response = await _client.GetAsync("/reportes/declaraciones/99/horas");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task HorasDeclaracion_ConActividades_Returns200ConPdf()
    {
        var detalle = new DeclaracionDetalle
        {
            Declaracion = new Declaracion { Id = 1, NumeroPlaza = 100, CorreoInstitucional = "juan@ucr.ac.cr", FechaDeclaracion = DateTime.Today, Completa = 1 },
            Cargo = "Analista",
            ClaseOcupacional = "Profesional",
            LugarTrabajo = "Edificio A",
            Horario = new HorarioLaboral { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
            Actividades = [new Actividad { TipoFuncion = "Propia de mi puesto", Periodicidad = "Semanal", VecesRealizadas = 1, Duracion = 60, Nombre = "Informes", Descripcion = "Redactar" }],
        };
        _factory.DeclaracionRepo.ObtenerDetalleAsync(1).Returns(detalle);
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>())
            .Returns(new User { CorreoInstitucional = "juan@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Pérez", SegundoApellido = "García" });

        var response = await _client.GetAsync("/reportes/declaraciones/1/horas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MimePdf, response.Content.Headers.ContentType?.MediaType);
        Assert.True((await response.Content.ReadAsByteArrayAsync()).Length > 0);
    }

    private static List<ReporteFuncionarioFila> UnFuncionario() =>
    [
        new()
        {
            CorreoInstitucional = "juan@ucr.ac.cr",
            NombreCompleto = "Juan Pérez García",
            Rol = 0,
            Estado = 1,
            NumeroPlaza = 100,
            Cargo = "Analista",
            ClaseOcupacional = "Profesional",
            LugarTrabajo = "Edificio A",
        },
    ];
}
