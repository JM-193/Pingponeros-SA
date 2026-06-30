using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateSectionDto : CreateOrganizationalUnitDto
{
    [Required(ErrorMessage = "El nombre de la sección es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres.")]
    [RegularExpression(ValidationPatterns.SoloLetrasYPuntuacion, ErrorMessage = "El nombre solo puede contener letras, números, espacios, puntos, comas y dos puntos.")]
    public override string Nombre { get; init; } = null!;
}
