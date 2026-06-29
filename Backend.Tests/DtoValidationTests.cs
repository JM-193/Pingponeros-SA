// DtoValidationTests.cs
// Pruebas unitarias directas de la validación de forma trasladada a los DTOs durante la
// refactorización. Antes solo se ejercían indirectamente vía HTTP (código de estado);
// aquí se valida el contrato exacto (mensaje y orden de evaluación) a nivel de unidad.
using Backend.DTOs;
using Xunit;

namespace Backend.Tests;

public sealed class DtoValidationTests
{
    // ---------------------------------------------------------------- //
    // CreateUserDto                                                     //
    // ---------------------------------------------------------------- //
    private static CreateUserDto UsuarioValido() =>
        new("juan.perez@ucr.ac.cr", "Juan", null, "Perez", "Garcia", 0);

    [Fact]
    public void CreateUserDto_Valido_RetornaNull()
    {
        Assert.Null(UsuarioValido().Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoNombreValido_RetornaNull()
    {
        var dto = UsuarioValido() with { SegundoNombre = "Carlos" };
        Assert.Null(dto.Validar());
    }

    [Theory]
    [InlineData(2)]
    [InlineData(-1)]
    [InlineData(5)]
    public void CreateUserDto_RolInvalido_RetornaMensaje(int rol)
    {
        var dto = UsuarioValido() with { Rol = rol };
        Assert.Equal("Rol inválido. Use 0 (Funcionario) o 1 (Administrador).", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_CorreoVacio_RetornaMensaje()
    {
        var dto = UsuarioValido() with { CorreoInstitucional = "  " };
        Assert.Equal("El correo institucional es obligatorio.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_CorreoFormatoInvalido_RetornaMensaje()
    {
        var dto = UsuarioValido() with { CorreoInstitucional = "juan@test.com" };
        Assert.Contains("El correo debe ser válido", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_PrimerNombreVacio_RetornaMensaje()
    {
        var dto = UsuarioValido() with { PrimerNombre = "" };
        Assert.Equal("El primer nombre es obligatorio.", dto.Validar());
    }

    [Theory]
    [InlineData("Juan123")]
    [InlineData("Ju4n")]
    [InlineData("Juan Perez")]
    public void CreateUserDto_PrimerNombreConCaracteresInvalidos_RetornaMensaje(string nombre)
    {
        var dto = UsuarioValido() with { PrimerNombre = nombre };
        Assert.Equal("El primer nombre solo debe contener letras.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoNombreConCaracteresInvalidos_RetornaMensaje()
    {
        var dto = UsuarioValido() with { SegundoNombre = "Carl0s" };
        Assert.Equal("El segundo nombre solo debe contener letras.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_PrimerApellidoVacio_RetornaMensaje()
    {
        var dto = UsuarioValido() with { PrimerApellido = "" };
        Assert.Equal("El primer apellido es obligatorio.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_PrimerApellidoInvalido_RetornaMensaje()
    {
        var dto = UsuarioValido() with { PrimerApellido = "Per3z" };
        Assert.Equal("El primer apellido solo debe contener letras.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoApellidoVacio_RetornaMensaje()
    {
        var dto = UsuarioValido() with { SegundoApellido = "" };
        Assert.Equal("El segundo apellido es obligatorio.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoApellidoInvalido_RetornaMensaje()
    {
        var dto = UsuarioValido() with { SegundoApellido = "Garc!a" };
        Assert.Equal("El segundo apellido solo debe contener letras.", dto.Validar());
    }

    [Fact]
    public void CreateUserDto_RolTienePrioridadSobreCorreo()
    {
        // El rol se evalúa primero: aunque el correo también sea inválido, gana el rol.
        var dto = new CreateUserDto("correo-malo", "Juan", null, "Perez", "Garcia", 9);
        Assert.Equal("Rol inválido. Use 0 (Funcionario) o 1 (Administrador).", dto.Validar());
    }

    // ---------------------------------------------------------------- //
    // CreateAreaDto                                                     //
    // ---------------------------------------------------------------- //
    [Fact]
    public void CreateAreaDto_Valido_RetornaNull()
    {
        Assert.Null(new CreateAreaDto("Finanzas", "Área de finanzas", 1).Validar());
    }

    [Fact]
    public void CreateAreaDto_EstadoNull_RetornaNull()
    {
        Assert.Null(new CreateAreaDto("Finanzas", "Área de finanzas", null).Validar());
    }

    [Fact]
    public void CreateAreaDto_NombreVacio_RetornaMensaje()
    {
        Assert.Equal("El nombre del área es obligatorio.",
            new CreateAreaDto(" ", "desc", 1).Validar());
    }

    [Fact]
    public void CreateAreaDto_DescripcionVacia_RetornaMensaje()
    {
        Assert.Equal("La descripción es obligatoria.",
            new CreateAreaDto("Finanzas", "", 1).Validar());
    }

    [Fact]
    public void CreateAreaDto_EstadoInvalido_RetornaMensaje()
    {
        Assert.Equal("El estado debe ser 0 (Inactivo) o 1 (Activo).",
            new CreateAreaDto("Finanzas", "desc", 7).Validar());
    }

    // ---------------------------------------------------------------- //
    // CreateDepartmentDto / CreateSectionDto / CreateUnitDto           //
    // ---------------------------------------------------------------- //
    [Fact]
    public void CreateDepartmentDto_NombreVacio_UsaArticuloDelDepartamento()
    {
        Assert.Equal("El nombre del departamento es obligatorio.",
            new CreateDepartmentDto { Nombre = "", Descripcion = "desc", IdArea = 1, Estado = 1 }.Validar());
    }

    [Fact]
    public void CreateDepartmentDto_Valido_RetornaNull()
    {
        Assert.Null(new CreateDepartmentDto { Nombre = "Contabilidad", Descripcion = "desc", IdArea = 1, Estado = 1 }.Validar());
    }

    [Fact]
    public void CreateSectionDto_NombreVacio_UsaArticuloDeLaSeccion()
    {
        Assert.Equal("El nombre de la sección es obligatorio.",
            new CreateSectionDto { Nombre = "", Descripcion = "desc", IdArea = 1, Estado = 1 }.Validar());
    }

    [Fact]
    public void CreateUnitDto_NombreVacio_UsaArticuloDeLaUnidad()
    {
        Assert.Equal("El nombre de la unidad es obligatorio.",
            new CreateUnitDto("", "desc", 1, null, null, 1).Validar());
    }

    [Fact]
    public void CreateUnitDto_Valido_RetornaNull()
    {
        Assert.Null(new CreateUnitDto("Soporte", "desc", 1, 2, null, 1).Validar());
    }

    [Fact]
    public void CreateUnitDto_DepartamentoYSeccionSimultaneos_RetornaMensaje()
    {
        var dto = new CreateUnitDto("Soporte", "desc", 1, 2, 3, 1);
        Assert.Equal("Una unidad no puede pertenecer a un departamento y a una sección al mismo tiempo.",
            dto.Validar());
    }

    [Fact]
    public void CreateUnitDto_ValidacionBaseTienePrioridadSobreExclusividad()
    {
        // Si el nombre está vacío, gana ese mensaje aunque también haya conflicto depto/sección.
        var dto = new CreateUnitDto("", "desc", 1, 2, 3, 1);
        Assert.Equal("El nombre de la unidad es obligatorio.", dto.Validar());
    }

    // ---------------------------------------------------------------- //
    // CreatePositionDto                                                 //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData(0UL)]
    public void CreatePositionDto_NumeroNoPositivo_RetornaMensaje(ulong numero)
    {
        var dto = new CreatePositionDto(numero, null, null, null, null);
        Assert.Equal("El número de plaza debe ser un entero positivo.", dto.Validar());
    }

    [Fact]
    public void CreatePositionDto_NumeroPositivo_RetornaNull()
    {
        Assert.Null(new CreatePositionDto(1234, null, null, null, null).Validar());
    }

    // ---------------------------------------------------------------- //
    // LoginDto                                                          //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData("", "pass")]
    [InlineData("correo@ucr.ac.cr", "")]
    [InlineData("  ", "  ")]
    public void LoginDto_CamposVacios_RetornaMensaje(string correo, string contrasena)
    {
        Assert.Equal("Correo y contraseña son obligatorios.",
            new LoginDto(correo, contrasena).Validar());
    }

    [Fact]
    public void LoginDto_Valido_RetornaNull()
    {
        Assert.Null(new LoginDto("correo@ucr.ac.cr", "secreta").Validar());
    }

    // ---------------------------------------------------------------- //
    // ChangePasswordDto                                                 //
    // ---------------------------------------------------------------- //
    [Fact]
    public void ChangePasswordDto_CorreoVacio_RetornaMensaje()
    {
        Assert.Equal("El correo institucional es obligatorio.",
            new ChangePasswordDto("", "actual", "nueva").Validar());
    }

    [Fact]
    public void ChangePasswordDto_ContrasenaActualVacia_RetornaMensaje()
    {
        Assert.Equal("La contraseña actual es obligatoria.",
            new ChangePasswordDto("correo@ucr.ac.cr", "", "nueva").Validar());
    }

    [Fact]
    public void ChangePasswordDto_ContrasenaNuevaVacia_RetornaMensaje()
    {
        Assert.Equal("La nueva contraseña es obligatoria.",
            new ChangePasswordDto("correo@ucr.ac.cr", "actual", "").Validar());
    }

    [Fact]
    public void ChangePasswordDto_NuevaIgualAActual_RetornaMensaje()
    {
        Assert.Equal("La nueva contraseña debe ser diferente a la actual.",
            new ChangePasswordDto("correo@ucr.ac.cr", "MismaClave1!", "MismaClave1!").Validar());
    }

    [Fact]
    public void ChangePasswordDto_FormaValida_RetornaNull()
    {
        // Validar() solo cubre la forma; la complejidad la valida PasswordPolicy aparte.
        Assert.Null(new ChangePasswordDto("correo@ucr.ac.cr", "actual", "nuevaDistinta").Validar());
    }

    // ---------------------------------------------------------------- //
    // CreateDeclaracionDto                                              //
    // ---------------------------------------------------------------- //
    [Fact]
    public void CreateDeclaracionDto_NumeroPlazaCero_RetornaMensaje()
    {
        var dto = new CreateDeclaracionDto(0UL);
        Assert.Equal("El número de plaza debe ser un entero positivo.", dto.Validar());
    }

    [Fact]
    public void CreateDeclaracionDto_NumeroPlazaPositivo_RetornaNull()
    {
        Assert.Null(new CreateDeclaracionDto(100UL).Validar());
    }

    // ---------------------------------------------------------------- //
    // GuardarDeclaracionDto                                             //
    // ---------------------------------------------------------------- //
    private static GuardarDeclaracionDto DtoVacio() =>
        new(null, null, null, null, null);

    private static GuardarDeclaracionDto DtoConHorario(string entrada = "08:00", string salida = "17:00", string jornada = "Tiempo Completo") =>
        new(new HorarioInputDto(entrada, salida, jornada), null, null, null, null);

    private static ActividadInputDto ActividadOficialValida() =>
        new(IdFuncion: 1, IdFuncionPropia: null, TipoFuncion: "Propia de mi puesto", Periodicidad: "Semanal", VecesRealizadas: 1, Duracion: 30);

    private static ActividadInputDto ActividadDefinidaValida() =>
        new(IdFuncion: null, IdFuncionPropia: 5, TipoFuncion: "Definida por mí", Periodicidad: "Diario", VecesRealizadas: 2, Duracion: 15);

    [Fact]
    public void GuardarDeclaracionDto_TodoNull_RetornaNull()
    {
        Assert.Null(DtoVacio().Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_HorarioValido_RetornaNull()
    {
        Assert.Null(DtoConHorario().Validar());
    }

    [Theory]
    [InlineData("8:00")]
    [InlineData("30:00")]
    [InlineData("")]
    [InlineData("  ")]
    public void GuardarDeclaracionDto_HoraEntradaFormatoInvalido_RetornaMensaje(string entrada)
    {
        var dto = DtoConHorario(entrada: entrada);
        Assert.Equal("La hora de entrada debe tener el formato HH:MM.", dto.Validar());
    }

    [Theory]
    [InlineData("8:00")]
    [InlineData("30:00")]
    [InlineData("")]
    public void GuardarDeclaracionDto_HoraSalidaFormatoInvalido_RetornaMensaje(string salida)
    {
        var dto = DtoConHorario(salida: salida);
        Assert.Equal("La hora de salida debe tener el formato HH:MM.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_JornadaVacia_RetornaMensaje()
    {
        var dto = DtoConHorario(jornada: "");
        Assert.Equal("La jornada laboral es obligatoria.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_JornadaMayorA25Caracteres_RetornaMensaje()
    {
        var dto = DtoConHorario(jornada: new string('A', 26));
        Assert.Equal("La jornada laboral es obligatoria.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_TiempoDescansoNegativo_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, -1m, null, null, null);
        Assert.Equal("El tiempo de descanso no puede ser negativo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_TiempoDescansoCero_RetornaNull()
    {
        var dto = new GuardarDeclaracionDto(null, 0m, null, null, null);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_HoraExtraSinTiempo_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, new HoraExtraInputDto(null, "Justificacion", false), null, null);
        Assert.Equal("El tiempo adicional debe ser un valor positivo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_HoraExtraTiempoNegativo_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, new HoraExtraInputDto(-10m, "Justificacion", false), null, null);
        Assert.Equal("El tiempo adicional debe ser un valor positivo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_HoraExtraSinJustificacion_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, new HoraExtraInputDto(60m, "", false), null, null);
        Assert.Equal("Debe justificar el tiempo adicional fuera de su jornada.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_HoraExtraValida_RetornaNull()
    {
        var dto = new GuardarDeclaracionDto(null, null, new HoraExtraInputDto(60m, "Reuniones", true), null, null);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_PermisoSinDias_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, new PermisoAusenciaInputDto(null, "Permiso médico", false), null);
        Assert.Equal("Los días de permiso o licencia deben ser un valor positivo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_PermisoDiasNegativos_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, new PermisoAusenciaInputDto(-1m, "Permiso médico", false), null);
        Assert.Equal("Los días de permiso o licencia deben ser un valor positivo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_PermisoSinJustificacion_RetornaMensaje()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, new PermisoAusenciaInputDto(2m, " ", false), null);
        Assert.Equal("Debe indicar cuál es el permiso o licencia.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_PermisoValido_RetornaNull()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, new PermisoAusenciaInputDto(2m, "Permiso médico", true), null);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadOficialValida_RetornaNull()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, null, [ActividadOficialValida()]);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadDefinidaValida_RetornaNull()
    {
        var dto = new GuardarDeclaracionDto(null, null, null, null, [ActividadDefinidaValida()]);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadSinTipo_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, null, "", "Semanal", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("Cada actividad debe indicar su tipo de función.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadTipoDesconocido_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, null, "Tipo inválido", "Semanal", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Contains("Tipo de función no válido", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadOficialSinIdFuncion_RetornaMensaje()
    {
        var act = new ActividadInputDto(null, null, "Propia de mi puesto", "Semanal", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("La actividad oficial debe referenciar una función válida del catálogo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadOficialConIdFuncionPropia_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, 2, "Propia de mi puesto", "Semanal", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("La actividad oficial debe referenciar una función válida del catálogo.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadDefinidaSinIdFuncionPropia_RetornaMensaje()
    {
        var act = new ActividadInputDto(null, null, "Definida por mí", "Semanal", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("La actividad «Definida por mí» debe referenciar una función propia válida.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadSinPeriodicidad_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, null, "Propia de mi puesto", "", 1, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("Cada actividad debe indicar su periodicidad.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadVecesRealizadasCero_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, null, "Propia de mi puesto", "Semanal", 0, 30);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("La cantidad de veces realizada debe ser al menos 1.", dto.Validar());
    }

    [Fact]
    public void GuardarDeclaracionDto_ActividadDuracionCero_RetornaMensaje()
    {
        var act = new ActividadInputDto(1, null, "Propia de mi puesto", "Semanal", 1, 0);
        var dto = new GuardarDeclaracionDto(null, null, null, null, [act]);
        Assert.Equal("La duración de la actividad debe ser al menos 1 minuto.", dto.Validar());
    }
}
