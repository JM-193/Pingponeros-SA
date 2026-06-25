// CreatePositionDto.cs
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreatePositionDto(
    // Entero positivo: rango [1, long.MaxValue]. Se usa el constructor por tipo de Range
    // porque no existe una sobrecarga (long, long).
    [property: Range(typeof(ulong), "1", "18446744073709551614",
        ErrorMessage = "El número de plaza debe ser un entero positivo.")]
    long NumeroPlaza,
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
