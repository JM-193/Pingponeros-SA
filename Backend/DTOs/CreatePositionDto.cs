// CreatePositionDto.cs
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreatePositionDto(
    // Entero positivo sin signo: rango [1, ulong.MaxValue]. Se usa el constructor por tipo de
    // Range con operando 'ulong' (coincide con el tipo de la propiedad) para cubrir todo el rango
    // de NUMBER(20) sin signo.
    [property: Range(typeof(ulong), "1", "18446744073709551615",
        ErrorMessage = "El número de plaza debe ser un entero positivo.")]
    ulong NumeroPlaza,
    int? IdUnidad,
    int? IdDepartamento,
    int? IdSeccion,
    int? IdArea)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el mensaje de error.
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(NumeroPlaza));
}
