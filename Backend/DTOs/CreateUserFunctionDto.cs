using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateUserFunctionDto(
    [property: Required(ErrorMessage = "El correo institucional es obligatorio.")]
    [property: MaxLength(190, ErrorMessage = "El correo no puede superar los 190 caracteres.")]
    string CorreoInstitucional,
    [property: Required(ErrorMessage = "El nombre de la función es obligatorio.")]
    [property: MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetrasYPuntuacion, ErrorMessage = "El nombre solo puede contener letras, números, espacios, puntos, comas y dos puntos.")]
    string Nombre,
    [property: Required(ErrorMessage = "La descripción es obligatoria.")]
    [property: MaxLength(2048, ErrorMessage = "La descripción no puede superar los 2048 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetrasYPuntuacion, ErrorMessage = "La descripción solo puede contener letras, números, espacios, puntos, comas y dos puntos.")]
    string Descripcion)
{
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(CorreoInstitucional), nameof(Nombre), nameof(Descripcion));
}
