using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record LoginDto(
    // Ambos campos comparten el mismo mensaje para conservar el texto combinado original
    // ("Correo y contraseña son obligatorios.") sea cual sea el campo que falte.
    [property: Required(ErrorMessage = "Correo y contraseña son obligatorios.")]
    [property: MaxLength(190, ErrorMessage = "El correo no puede superar los 190 caracteres.")]
    string CorreoInstitucional,
    [property: Required(ErrorMessage = "Correo y contraseña son obligatorios.")]
    [property: MaxLength(30, ErrorMessage = "La contraseña no puede superar los 30 caracteres.")]
    string Contrasena)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el mensaje de error.
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(CorreoInstitucional), nameof(Contrasena));
}
