// DataAnnotationsValidationTests.cs
// Pruebas de la capa de validación migrada a Data Annotations. Cubren dos aspectos que las
// pruebas de Validar() (DtoValidationTests).
using System.ComponentModel.DataAnnotations;
using Backend.DTOs;
using Xunit;

namespace Backend.Tests;

public sealed class DataAnnotationsValidationTests
{
    /// <summary>Valida un objeto con todas sus Data Annotations y devuelve los mensajes de error.</summary>
    private static List<string> ErroresDataAnnotations(object instancia)
    {
        var contexto = new ValidationContext(instancia);
        var resultados = new List<ValidationResult>();
        Validator.TryValidateObject(instancia, contexto, resultados, validateAllProperties: true);
        return resultados.Select(r => r.ErrorMessage ?? "").ToList();
    }

    private static bool EsValidoSegunAnotaciones(object instancia) =>
        ErroresDataAnnotations(instancia).Count == 0;

    private static CreateUserDto UsuarioValido() =>
        new("juan.perez@ucr.ac.cr", "Juan", null, "Perez", "Garcia", 0);

    [Fact]
    public void Annotations_UsuarioValido_NoProduceErrores()
    {
        Assert.True(EsValidoSegunAnotaciones(UsuarioValido()));
    }

    [Fact]
    public void Annotations_AreaValida_NoProduceErrores()
    {
        Assert.True(EsValidoSegunAnotaciones(new CreateAreaDto("Finanzas", "Área de finanzas", 1)));
    }

    [Fact]
    public void Annotations_CorreoFormatoInvalido_ProduceMensajeEsperado()
    {
        var dto = UsuarioValido() with { CorreoInstitucional = "juan@test.com" };
        Assert.Contains(ErroresDataAnnotations(dto),
            m => m.StartsWith("El correo debe ser válido", StringComparison.Ordinal));
    }

    [Fact]
    public void Annotations_NombreObligatorioFaltante_ProduceMensajeEsperado()
    {
        var dto = new CreateAreaDto("", "desc", 1);
        Assert.Contains("El nombre del área es obligatorio.", ErroresDataAnnotations(dto));
    }

    [Theory]
    [InlineData(2)]
    [InlineData(-1)]
    public void Annotations_RolFueraDeRango_ProduceMensajeEsperado(int rol)
    {
        var dto = UsuarioValido() with { Rol = rol };
        Assert.Contains("Rol inválido. Use 0 (Funcionario) o 1 (Administrador).", ErroresDataAnnotations(dto));
    }

    [Fact]
    public void Annotations_EstadoFueraDeRango_ProduceMensajeEsperado()
    {
        var dto = new CreateAreaDto("Finanzas", "desc", 7);
        Assert.Contains("El estado debe ser 0 (Inactivo) o 1 (Activo).", ErroresDataAnnotations(dto));
    }

    // ---------------------------------------------------------------- //
    // Tolerancia a espacios envolventes equivalente al .Trim()       //
    // ---------------------------------------------------------------- //
    [Fact]
    public void CreateUserDto_NombresConEspaciosEnvolventes_SonValidos()
    {
        var dto = new CreateUserDto("  juan.perez@ucr.ac.cr  ", "  Juan ", null, "  Perez  ", " Garcia ", 0);
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void CreateUserDto_CorreoConEspaciosEnvolventes_EsValido()
    {
        var dto = UsuarioValido() with { CorreoInstitucional = "\t maria.lopez@UCR.AC.CR \n" };
        Assert.Null(dto.Validar());
    }

    // ---------------------------------------------------------------- //
    // Segundo nombre opcional                                          //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateUserDto_SegundoNombreVacioOEspacios_EsValido(string? segundoNombre)
    {
        var dto = UsuarioValido() with { SegundoNombre = segundoNombre };
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoNombreConLetras_EsValido()
    {
        var dto = UsuarioValido() with { SegundoNombre = "  José  " };
        Assert.Null(dto.Validar());
    }

    [Fact]
    public void CreateUserDto_SegundoNombreConDigitos_RetornaMensaje()
    {
        var dto = UsuarioValido() with { SegundoNombre = "Carl0s" };
        Assert.Equal("El segundo nombre solo debe contener letras.", dto.Validar());
    }

    // ---------------------------------------------------------------- //
    // Límites de Range: Estado, Rol, NumeroPlaza                       //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    public void CreateAreaDto_EstadoEnLimite_EsValido(int estado)
    {
        Assert.Null(new CreateAreaDto("Finanzas", "desc", estado).Validar());
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(2)]
    public void CreateAreaDto_EstadoFueraDeLimite_RetornaMensaje(int estado)
    {
        Assert.Equal("El estado debe ser 0 (Inactivo) o 1 (Activo).",
            new CreateAreaDto("Finanzas", "desc", estado).Validar());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    public void CreateUserDto_RolEnLimite_EsValido(int rol)
    {
        Assert.Null((UsuarioValido() with { Rol = rol }).Validar());
    }

    [Theory]
    [InlineData(1L)]
    [InlineData(long.MaxValue)]
    public void CreatePositionDto_NumeroPositivo_EsValido(long numero)
    {
        Assert.Null(new CreatePositionDto(numero, null, null, null, null).Validar());
    }

    [Theory]
    [InlineData(0L)]
    [InlineData(-1L)]
    [InlineData(long.MinValue)]
    public void CreatePositionDto_NumeroNoPositivo_RetornaMensaje(long numero)
    {
        Assert.Equal("El número de plaza debe ser un entero positivo.",
            new CreatePositionDto(numero, null, null, null, null).Validar());
    }

    // ---------------------------------------------------------------- //
    // LoginDto: mensaje combinado independientemente del campo faltante //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData("", "secreta")]
    [InlineData("correo@ucr.ac.cr", "")]
    [InlineData("   ", "secreta")]
    [InlineData("correo@ucr.ac.cr", "   ")]
    public void LoginDto_CualquierCampoVacio_RetornaMensajeCombinado(string correo, string contrasena)
    {
        Assert.Equal("Correo y contraseña son obligatorios.",
            new LoginDto(correo, contrasena).Validar());
    }

    // ---------------------------------------------------------------- //
    // Mensajes específicos por entidad (Department / Section / Unit)    //
    // ---------------------------------------------------------------- //
    [Fact]
    public void CreateDepartmentDto_DescripcionVacia_RetornaMensajeCompartido()
    {
        Assert.Equal("La descripción es obligatoria.",
            new CreateDepartmentDto("Contabilidad", "", 1, 1).Validar());
    }

    [Fact]
    public void CreateUnitDto_EstadoInvalido_TienePrioridadSobreExclusividad()
    {
        // El estado (anotación) se evalúa antes que la regla cruzada depto/sección.
        var dto = new CreateUnitDto("Soporte", "desc", 1, 2, 3, 9);
        Assert.Equal("El estado debe ser 0 (Inactivo) o 1 (Activo).", dto.Validar());
    }

    // ---------------------------------------------------------------- //
    // ResetPasswordDto                                                 //
    // ---------------------------------------------------------------- //
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ResetPasswordDto_CorreoVacio_RetornaMensaje(string correo)
    {
        Assert.Equal("El correo institucional es obligatorio.",
            new ResetPasswordDto { CorreoInstitucional = correo }.Validar());
    }

    [Fact]
    public void ResetPasswordDto_CorreoPresente_RetornaNull()
    {
        Assert.Null(new ResetPasswordDto { CorreoInstitucional = "ana@ucr.ac.cr" }.Validar());
    }
}
