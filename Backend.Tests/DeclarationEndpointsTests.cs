// DeclarationEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class DeclarationEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public DeclarationEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ---------------------------------------------------------------- //
    // POST /declaraciones/usuario/{correo}                              //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CrearDeclaracion_NumeroPlazaCero_Returns400()
    {
        var dto = new { NumeroPlaza = 0 };

        var response = await _client.PostAsJsonAsync("/declaraciones/usuario/juan@ucr.ac.cr", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearDeclaracion_YaTieneActiva_Returns409()
    {
        _factory.DeclaracionRepo.ExisteActivaPorUsuarioAsync(Arg.Any<string>()).Returns(true);
        var dto = new { NumeroPlaza = 100 };

        var response = await _client.PostAsJsonAsync("/declaraciones/usuario/juan@ucr.ac.cr", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CrearDeclaracion_PlazaNoAsignada_Returns400()
    {
        _factory.DeclaracionRepo.ExisteActivaPorUsuarioAsync(Arg.Any<string>()).Returns(false);
        _factory.AsignacionRepo.ObtenerActivasPorUsuarioAsync(Arg.Any<string>())
            .Returns(new List<PositionAssignment>());
        var dto = new { NumeroPlaza = 100 };

        var response = await _client.PostAsJsonAsync("/declaraciones/usuario/juan@ucr.ac.cr", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearDeclaracion_Exitosa_Returns201()
    {
        _factory.DeclaracionRepo.ExisteActivaPorUsuarioAsync(Arg.Any<string>()).Returns(false);
        _factory.AsignacionRepo.ObtenerActivasPorUsuarioAsync(Arg.Any<string>())
            .Returns(new List<PositionAssignment>
            {
                new() { NumeroPlaza = 100UL, CorreoInstitucional = "juan@ucr.ac.cr" },
            });
        _factory.DeclaracionRepo.CrearAsync(Arg.Any<ulong>(), Arg.Any<string>()).Returns(7);
        var dto = new { NumeroPlaza = 100 };

        var response = await _client.PostAsJsonAsync("/declaraciones/usuario/juan@ucr.ac.cr", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // GET /declaraciones/usuario/{correo}/activa                        //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerActiva_SinBorrador_Returns204()
    {
        _factory.DeclaracionRepo.ObtenerIdActivaPorUsuarioAsync(Arg.Any<string>()).Returns((int?)null);

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr/activa");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ObtenerActiva_ConBorrador_Returns200ConDetalle()
    {
        var cabecera = new Declaracion { Id = 3, NumeroPlaza = 100, CorreoInstitucional = "juan@ucr.ac.cr", Completa = 0 };
        var detalle = new DeclaracionDetalle { Declaracion = cabecera };
        _factory.DeclaracionRepo.ObtenerIdActivaPorUsuarioAsync(Arg.Any<string>()).Returns(3);
        _factory.DeclaracionRepo.ObtenerDetalleAsync(3).Returns(detalle);

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr/activa");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // GET /declaraciones/usuario/{correo}/autocompletado                //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerAutocompletado_Returns200ConLista()
    {
        _factory.DeclaracionRepo.ObtenerDatosAutocompletadoAsync(Arg.Any<string>())
            .Returns(new List<DatosAutocompletado>
            {
                new() { NumeroPlaza = 100, IdPuesto = 1, Cargo = "Analista", ClaseOcupacional = "Profesional", LugarTrabajo = "Edificio A", Titular = "Juan" },
            });

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr/autocompletado");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ObtenerAutocompletado_ListaVacia_Returns200()
    {
        _factory.DeclaracionRepo.ObtenerDatosAutocompletadoAsync(Arg.Any<string>())
            .Returns(new List<DatosAutocompletado>());

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr/autocompletado");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // GET /declaraciones/usuario/{correo}  (historial)                 //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerHistorial_Returns200ConLista()
    {
        _factory.DeclaracionRepo.ObtenerCompletasPorUsuarioAsync(Arg.Any<string>())
            .Returns(new List<DeclaracionResumen>
            {
                new() { Id = 1, NumeroPlaza = 100, FechaDeclaracion = DateTime.Today, Completa = 1 },
            });

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ObtenerHistorial_SinDeclaraciones_Returns200ListaVacia()
    {
        _factory.DeclaracionRepo.ObtenerCompletasPorUsuarioAsync(Arg.Any<string>())
            .Returns(new List<DeclaracionResumen>());

        var response = await _client.GetAsync("/declaraciones/usuario/juan@ucr.ac.cr");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // GET /declaraciones/{id}                                           //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task ObtenerDetalle_NoExiste_Returns404()
    {
        _factory.DeclaracionRepo.ObtenerDetalleAsync(Arg.Any<int>()).Returns((DeclaracionDetalle?)null);

        var response = await _client.GetAsync("/declaraciones/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ObtenerDetalle_Existe_Returns200()
    {
        var cabecera = new Declaracion { Id = 1, NumeroPlaza = 100, CorreoInstitucional = "juan@ucr.ac.cr", Completa = 1 };
        var detalle = new DeclaracionDetalle { Declaracion = cabecera };
        _factory.DeclaracionRepo.ObtenerDetalleAsync(1).Returns(detalle);

        var response = await _client.GetAsync("/declaraciones/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // PUT /declaraciones/{id}  (guardar borrador)                      //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task GuardarDeclaracion_HoraEntradaInvalida_Returns400()
    {
        var dto = new
        {
            Horario = new { HoraEntrada = "8:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
        };

        var response = await _client.PutAsJsonAsync("/declaraciones/1", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GuardarDeclaracion_DeclaracionNoExiste_Returns404()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>()).Returns((Declaracion?)null);
        var dto = new
        {
            Horario = new { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
        };

        var response = await _client.PutAsJsonAsync("/declaraciones/99", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GuardarDeclaracion_YaCompleta_Returns409()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>())
            .Returns(new Declaracion { Id = 1, Completa = 1 });
        var dto = new
        {
            Horario = new { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
        };

        var response = await _client.PutAsJsonAsync("/declaraciones/1", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task GuardarDeclaracion_Exitoso_Returns200()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(1)
            .Returns(new Declaracion { Id = 1, Completa = 0 });
        _factory.DeclaracionRepo.GuardarBorradorAsync(Arg.Any<int>(), Arg.Any<DeclaracionDetalle>())
            .Returns(Task.CompletedTask);
        var dto = new
        {
            Horario = new { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
        };

        var response = await _client.PutAsJsonAsync("/declaraciones/1", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GuardarDeclaracion_ConTodosLosCamposOpcionales_Returns200()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(2)
            .Returns(new Declaracion { Id = 2, Completa = 0 });
        _factory.DeclaracionRepo.GuardarBorradorAsync(Arg.Any<int>(), Arg.Any<DeclaracionDetalle>())
            .Returns(Task.CompletedTask);
        var dto = new
        {
            Horario = new { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Medio Tiempo" },
            TiempoDescanso = 30,
            HoraExtra = new { TiempoAdicional = 60, Justificacion = "Cierre contable", ConocimientoJefatura = true },
            PermisoAusencia = new { Dias = 2, Justificacion = "Asuntos personales", ConocimientoJefatura = false },
            Actividades = new[]
            {
                new
                {
                    IdFuncion = (int?)1,
                    IdFuncionPropia = (int?)null,
                    TipoFuncion = "Propia de mi puesto",
                    Periodicidad = "Semanal",
                    VecesRealizadas = 3,
                    Duracion = 45,
                },
            },
        };

        var response = await _client.PutAsJsonAsync("/declaraciones/2", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // PUT /declaraciones/{id}/completar                                 //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CompletarDeclaracion_NoExiste_Returns404()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>()).Returns((Declaracion?)null);

        var response = await _client.PutAsync("/declaraciones/99/completar", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CompletarDeclaracion_YaCompleta_Returns409()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>())
            .Returns(new Declaracion { Id = 1, Completa = 1 });

        var response = await _client.PutAsync("/declaraciones/1/completar", null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CompletarDeclaracion_SinHorario_Returns400()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>())
            .Returns(new Declaracion { Id = 1, Completa = 0 });
        var detalleSinHorario = new DeclaracionDetalle
        {
            Declaracion = new Declaracion { Id = 1 },
            Horario = null,
            Actividades = [new Actividad { TipoFuncion = "Propia de mi puesto", Periodicidad = "Semanal", VecesRealizadas = 1, Duracion = 30 }],
        };
        _factory.DeclaracionRepo.ObtenerDetalleAsync(1).Returns(detalleSinHorario);

        var response = await _client.PutAsync("/declaraciones/1/completar", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CompletarDeclaracion_SinActividades_Returns400()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>())
            .Returns(new Declaracion { Id = 1, Completa = 0 });
        var detalleSinActividades = new DeclaracionDetalle
        {
            Declaracion = new Declaracion { Id = 1 },
            Horario = new HorarioLaboral { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
            Actividades = [],
        };
        _factory.DeclaracionRepo.ObtenerDetalleAsync(1).Returns(detalleSinActividades);

        var response = await _client.PutAsync("/declaraciones/1/completar", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CompletarDeclaracion_Exitosa_Returns200()
    {
        _factory.DeclaracionRepo.ObtenerCabeceraAsync(Arg.Any<int>())
            .Returns(new Declaracion { Id = 1, Completa = 0 });
        var detalleCompleto = new DeclaracionDetalle
        {
            Declaracion = new Declaracion { Id = 1 },
            Horario = new HorarioLaboral { HoraEntrada = "08:00", HoraSalida = "17:00", JornadaLaboral = "Tiempo Completo" },
            Actividades = [new Actividad { TipoFuncion = "Propia de mi puesto", Periodicidad = "Semanal", VecesRealizadas = 1, Duracion = 30 }],
        };
        _factory.DeclaracionRepo.ObtenerDetalleAsync(1).Returns(detalleCompleto);
        _factory.DeclaracionRepo.CompletarAsync(1).Returns(true);

        var response = await _client.PutAsync("/declaraciones/1/completar", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // DELETE /declaraciones/{id}                                        //
    // ---------------------------------------------------------------- //

    [Fact]
    public async Task CancelarDeclaracion_NoExiste_Returns404()
    {
        _factory.DeclaracionRepo.CancelarAsync(Arg.Any<int>()).Returns(false);

        var response = await _client.DeleteAsync("/declaraciones/99");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CancelarDeclaracion_Exitosa_Returns200()
    {
        _factory.DeclaracionRepo.CancelarAsync(Arg.Any<int>()).Returns(true);

        var response = await _client.DeleteAsync("/declaraciones/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
