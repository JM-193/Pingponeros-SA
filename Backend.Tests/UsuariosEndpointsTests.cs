// UsuariosEndpointsTests.cs
using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using NSubstitute;
using Xunit;

namespace Backend.Tests;

public sealed class UsuariosEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public UsuariosEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsuarios_Returns200ConLista()
    {
        var lista = new List<User>
        {
            new() { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 }
        };
        _factory.UsuarioRepo.ObtenerTodosAsync().Returns(lista);

        var response = await _client.GetAsync("/usuarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsuarioPorCorreo_Returns200CuandoExiste()
    {
        var usuario = new User { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };
        _factory.UsuarioRepo.ObtenerPorCorreoAsync("ana@test.com").Returns(usuario);

        var response = await _client.GetAsync("/usuarios/ana%40test.com");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsuarioPorCorreo_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo.ObtenerPorCorreoAsync(Arg.Any<string>()).Returns((User?)null);

        var response = await _client.GetAsync("/usuarios/noexiste%40test.com");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConRolInvalido()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 5 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConCorreoVacio()
    {
        var dto = new { CorreoInstitucional = "", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConFormatoCorreoInvalido()
    {
        var dto = new { CorreoInstitucional = "test@test.com", PrimerNombre = "Juan", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConNombreVacio()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "", PrimerApellido = "Perez", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConApellidoVacio()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns201CuandoSeCreaCorrecto()
    {
        _factory.UsuarioRepo
            .InsertarConContrasenaAsync(Arg.Any<User>(), Arg.Any<string>())
            .Returns(Task.CompletedTask);
        var dto = new { CorreoInstitucional = "nuevo.usuario@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Perez", SegundoApellido = "Garcia", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_NormalizaCamposAntesDeInsertar()
    {
        User? capturado = null;
        string? hashCapturado = null;
        _factory.UsuarioRepo
            .InsertarConContrasenaAsync(
                Arg.Do<User>(usuario => capturado = usuario),
                Arg.Do<string>(hash => hashCapturado = hash))
            .Returns(Task.CompletedTask);
        var dto = new
        {
            CorreoInstitucional = "  JUAN.PEREZ@UCR.AC.CR  ",
            PrimerNombre = "  jUaN ",
            SegundoNombre = "  carlos ",
            PrimerApellido = "  pEREZ  ",
            SegundoApellido = "  gONZALEZ  ",
            Rol = 0,
        };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturado);
        Assert.Equal("juan.perez@ucr.ac.cr", capturado!.CorreoInstitucional);
        Assert.Equal("Juan", capturado.PrimerNombre);
        Assert.Equal("Carlos", capturado.SegundoNombre);
        Assert.Equal("Perez", capturado.PrimerApellido);
        Assert.Equal("Gonzalez", capturado.SegundoApellido);
        Assert.Equal(0, capturado.Rol);
        Assert.Equal(1, capturado.Estado);
        Assert.False(string.IsNullOrWhiteSpace(hashCapturado));
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConSegundoApellidoVacio()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Perez", SegundoApellido = "", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConPrimerNombreConCaracteresInvalidos()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan123", PrimerApellido = "Perez", SegundoApellido = "Garcia", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConSegundoNombreConCaracteresInvalidos()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", SegundoNombre = "Carl0s", PrimerApellido = "Perez", SegundoApellido = "Garcia", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConPrimerApellidoConCaracteresInvalidos()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Per3z", SegundoApellido = "Garcia", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns400ConSegundoApellidoConCaracteresInvalidos()
    {
        var dto = new { CorreoInstitucional = "juan.perez@ucr.ac.cr", PrimerNombre = "Juan", PrimerApellido = "Perez", SegundoApellido = "Garc!a", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_Returns201CuandoSegundoNombreEsValidoOpcional()
    {
        _factory.UsuarioRepo
            .InsertarConContrasenaAsync(Arg.Any<User>(), Arg.Any<string>())
            .Returns(Task.CompletedTask);
        var dto = new { CorreoInstitucional = "maria.garcia@ucr.ac.cr", PrimerNombre = "María", SegundoNombre = "José", PrimerApellido = "García", SegundoApellido = "López", Rol = 0 };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CrearUsuario_ConvierteSegundoNombreEnNullCuandoVacio()
    {
        User? capturado = null;
        _factory.UsuarioRepo
            .InsertarConContrasenaAsync(Arg.Do<User>(usuario => capturado = usuario), Arg.Any<string>())
            .Returns(Task.CompletedTask);
        var dto = new
        {
            CorreoInstitucional = "ana.lopez@ucr.ac.cr",
            PrimerNombre = "Ana",
            SegundoNombre = "   ",
            PrimerApellido = "Lopez",
            SegundoApellido = "Mora",
            Rol = 0,
        };

        var response = await _client.PostAsJsonAsync("/usuarios", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturado);
        Assert.Null(capturado!.SegundoNombre);
        Assert.Equal("Mora", capturado.SegundoApellido);
    }

    [Fact]
    public async Task ActualizarUsuario_Returns200CuandoSeActualiza()
    {
        _factory.UsuarioRepo
            .ActualizarAsync(Arg.Any<string>(), Arg.Any<User>())
            .Returns(true);
        var body = new { CorreoInstitucional = "ana@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };

        var response = await _client.PutAsJsonAsync("/usuarios/ana%40test.com", body);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ActualizarUsuario_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo
            .ActualizarAsync(Arg.Any<string>(), Arg.Any<User>())
            .Returns(false);
        var body = new { CorreoInstitucional = "noexiste@test.com", PrimerNombre = "Ana", PrimerApellido = "Lopez", Rol = 0, Estado = 1 };

        var response = await _client.PutAsJsonAsync("/usuarios/noexiste%40test.com", body);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUsuario_Returns204CuandoSeElimina()
    {
        _factory.UsuarioRepo.EliminarAsync(Arg.Any<string>()).Returns(true);

        var response = await _client.DeleteAsync("/usuarios/ana%40test.com");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task EliminarUsuario_Returns404CuandoNoExiste()
    {
        _factory.UsuarioRepo.EliminarAsync(Arg.Any<string>()).Returns(false);

        var response = await _client.DeleteAsync("/usuarios/noexiste%40test.com");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------------------------------------------------------------- //
    // Plazas vinculadas al usuario (PLAZAS_USUARIOS)                    //
    // ---------------------------------------------------------------- //
    [Fact]
    public async Task GetPlazasUsuario_Returns200ConLista()
    {
        _factory.AsignacionRepo.ObtenerActivasPorUsuarioAsync("ana@test.com").Returns(new List<PositionAssignment>
        {
            new() { NumeroPlaza = 1001, CorreoInstitucional = "ana@test.com", IdPuesto = 5, PuestoNombre = "Analista", ClaseOcupacional = "Profesional 1", FechaInicio = new DateTime(2026, 1, 1) }
        });

        var response = await _client.GetAsync("/usuarios/ana%40test.com/plazas");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns201CuandoSeVincula()
    {
        PositionAssignment? capturada = null;
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(1001).Returns(true);
        _factory.AsignacionRepo.PlazaTieneAsignacionActivaAsync(1001).Returns(false);
        _factory.AsignacionRepo.AsignarAsync(Arg.Do<PositionAssignment>(a => capturada = a)).Returns(Task.CompletedTask);
        var dto = new { NumeroPlaza = 1001, IdPuesto = 5, ClaseOcupacional = "Profesional", LugarTrabajo = "Oficina Central", FechaInicio = "2026-01-01", FechaFinal = (string?)null };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(capturada);
        Assert.Equal(1001UL, capturada!.NumeroPlaza);
        Assert.Equal("ana@test.com", capturada.CorreoInstitucional);
        Assert.Equal(5, capturada.IdPuesto);
        Assert.Equal("Profesional", capturada.ClaseOcupacional);
        Assert.Equal("Oficina Central", capturada.LugarTrabajo);
        Assert.Null(capturada.FechaFinal);
    }

    [Fact]
    public async Task AsignarPlaza_Returns409CuandoPlazaYaOcupada()
    {
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(1001).Returns(true);
        _factory.AsignacionRepo.PlazaTieneAsignacionActivaAsync(1001).Returns(true);
        var dto = new { NumeroPlaza = 1001, IdPuesto = 5, ClaseOcupacional = "Profesional", LugarTrabajo = "Oficina Central", FechaInicio = "2026-01-01", FechaFinal = (string?)null };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns404CuandoPlazaNoExiste()
    {
        _factory.PlazaRepo.ExisteNumeroPlazaAsync(9999).Returns(false);
        var dto = new { NumeroPlaza = 9999, IdPuesto = 5, ClaseOcupacional = "Profesional", LugarTrabajo = "Oficina Central", FechaInicio = "2026-01-01", FechaFinal = (string?)null };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns400CuandoFaltaFechaInicio()
    {
        var dto = new { NumeroPlaza = 1001, IdPuesto = 5, ClaseOcupacional = "Profesional", FechaFinal = (string?)null };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns400CuandoFaltaPuesto()
    {
        var dto = new { NumeroPlaza = 1001, IdPuesto = 0, ClaseOcupacional = "Profesional", FechaInicio = "2026-01-01" };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns400CuandoClaseOcupacionalTieneCaracteresInvalidos()
    {
        var dto = new { NumeroPlaza = 1001, IdPuesto = 5, ClaseOcupacional = "Profesional 1", FechaInicio = "2026-01-01" };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AsignarPlaza_Returns400CuandoLugarTrabajoTieneCaracteresInvalidos()
    {
        var dto = new { NumeroPlaza = 1001, IdPuesto = 5, ClaseOcupacional = "Profesional", LugarTrabajo = "Edificio 3", FechaInicio = "2026-01-01" };

        var response = await _client.PostAsJsonAsync("/usuarios/ana%40test.com/plazas", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DesasignarPlaza_Returns200CuandoSeDesvincula()
    {
        _factory.AsignacionRepo.DesasignarAsync(1001, "ana@test.com").Returns(true);

        var response = await _client.DeleteAsync("/usuarios/ana%40test.com/plazas/1001");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DesasignarPlaza_Returns404CuandoNoHayVinculacionActiva()
    {
        _factory.AsignacionRepo.DesasignarAsync(9999, "ana@test.com").Returns(false);

        var response = await _client.DeleteAsync("/usuarios/ana%40test.com/plazas/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
