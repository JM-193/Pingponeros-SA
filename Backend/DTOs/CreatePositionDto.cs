// CreatePositionDto.cs
using System.Diagnostics.CodeAnalysis;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreatePositionDto(
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
        NumeroPlaza <= 0 ? "El número de plaza debe ser un entero positivo." : null;
}
