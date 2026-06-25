using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

/// <summary>
/// DTO para la creación de un nuevo usuario.
/// <para><c>Rol</c>: 0 = Funcionario, 1 = Administrador.</para>
/// </summary>
[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateUserDto(
    [property: Required(ErrorMessage = "El correo institucional es obligatorio.")]
    [property: MaxLength(100, ErrorMessage = "El correo no puede superar los 100 caracteres.")]
    [property: RegularExpression(ValidationPatterns.CorreoUcr,
        ErrorMessage = "El correo debe ser válido. Formato: nombre.apellido@ucr.ac.cr (solo letras antes de @).")]
    string CorreoInstitucional,

    [property: Required(ErrorMessage = "El primer nombre es obligatorio.")]
    [property: MaxLength(25, ErrorMessage = "El primer nombre no puede superar los 25 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetras, ErrorMessage = "El primer nombre solo debe contener letras.")]
    string PrimerNombre,

    // Opcional: sin [Required]. La anotación de formato ignora null/vacío/espacios.
    [property: MaxLength(25, ErrorMessage = "El segundo nombre no puede superar los 25 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetras, ErrorMessage = "El segundo nombre solo debe contener letras.")]
    string? SegundoNombre,

    [property: Required(ErrorMessage = "El primer apellido es obligatorio.")]
    [property: MaxLength(25, ErrorMessage = "El primer apellido no puede superar los 25 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetras, ErrorMessage = "El primer apellido solo debe contener letras.")]
    string PrimerApellido,

    [property: Required(ErrorMessage = "El segundo apellido es obligatorio.")]
    [property: MaxLength(25, ErrorMessage = "El segundo apellido no puede superar los 25 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetras, ErrorMessage = "El segundo apellido solo debe contener letras.")]
    string SegundoApellido,

    [property: Range(0, 1, ErrorMessage = "Rol inválido. Use 0 (Funcionario) o 1 (Administrador).")]
    int Rol)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original: el rol primero).
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(
            this,
            nameof(Rol),
            nameof(CorreoInstitucional),
            nameof(PrimerNombre),
            nameof(SegundoNombre),
            nameof(PrimerApellido),
            nameof(SegundoApellido));
}
