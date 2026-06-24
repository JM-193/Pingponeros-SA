using System.ComponentModel.DataAnnotations;
using Backend.Validators;

namespace Backend.DTOs;

internal abstract record CreateOrganizationalUnitDto
{
    // Solo MaxLength aquí; el mensaje de Required varía por entidad y se declara en cada subclase.
    [MaxLength(25, ErrorMessage = "El nombre no puede superar los 25 caracteres.")]
    public virtual string Nombre { get; init; } = null!;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [MaxLength(2048, ErrorMessage = "La descripción no puede superar los 2048 caracteres.")]
    public string Descripcion { get; init; } = null!;

    public int? IdArea { get; init; }

    [Range(0, 1, ErrorMessage = "El estado debe ser 0 (Inactivo) o 1 (Activo).")]
    public int? Estado { get; init; }

    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(Nombre), nameof(Descripcion), nameof(Estado));
}
