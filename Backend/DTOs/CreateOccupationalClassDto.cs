using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateOccupationalClassDto(
    [property: Required(ErrorMessage = "El código es obligatorio.")]
    [property: Range(1, int.MaxValue, ErrorMessage = "El código debe ser un número entero positivo.")]
    int? Codigo,
    [property: Required(ErrorMessage = "El nombre es obligatorio.")]
    [property: MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetrasYPuntuacion, ErrorMessage = "El nombre solo puede contener letras, números, espacios, puntos, comas y dos puntos.")]
    string Nombre)
{
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(Codigo), nameof(Nombre));
}
