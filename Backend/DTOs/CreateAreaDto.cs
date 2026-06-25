using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateAreaDto(
    [property: Required(ErrorMessage = "El nombre del área es obligatorio.")]
    [property: MaxLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres.")]
    string Nombre,
    [property: Required(ErrorMessage = "La descripción es obligatoria.")]
    [property: MaxLength(2048, ErrorMessage = "La descripción no puede superar los 2048 caracteres.")]
    string Descripcion,
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
