using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

/// <summary>DTO para abrir un borrador de declaración para una de las plazas del usuario.</summary>
[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateDeclaracionDto(
    [property: Range(typeof(ulong), "1", "18446744073709551615",
        ErrorMessage = "El número de plaza debe ser un entero positivo.")]
    ulong NumeroPlaza)
{
    public string? Validar() => DtoValidator.PrimerError(this, nameof(NumeroPlaza));
}
