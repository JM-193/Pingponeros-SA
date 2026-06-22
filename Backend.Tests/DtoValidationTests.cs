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
            new CreateDepartmentDto("", "desc", 1, 1).Validar());
    }

    [Fact]
    public void CreateDepartmentDto_Valido_RetornaNull()
    {
        Assert.Null(new CreateDepartmentDto("Contabilidad", "desc", 1, 1).Validar());
    }

    [Fact]
    public void CreateSectionDto_NombreVacio_UsaArticuloDeLaSeccion()
    {
        Assert.Equal("El nombre de la sección es obligatorio.",
            new CreateSectionDto("", "desc", 1, 1).Validar());
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
    [InlineData(0)]
    [InlineData(-5)]
    public void CreatePositionDto_NumeroNoPositivo_RetornaMensaje(long numero)
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
}
