using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateSectionDto : CreateOrganizationalUnitDto
{
    [Required(ErrorMessage = "El nombre de la sección es obligatorio.")]
    public override string Nombre { get; init; } = null!;
}
