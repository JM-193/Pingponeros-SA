using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateDepartmentDto(
    [property: Required(ErrorMessage = "El nombre del departamento es obligatorio.")]
    string Nombre,
    [property: Required(ErrorMessage = "La descripción es obligatoria.")]
    string Descripcion,
    int? IdArea,
    [property: Range(0, 1, ErrorMessage = "El estado debe ser 0 (Inactivo) o 1 (Activo).")]
    int? Estado)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(Nombre), nameof(Descripcion), nameof(Estado));
}
