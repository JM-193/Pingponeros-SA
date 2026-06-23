// ResetPasswordDto.cs
using System.ComponentModel.DataAnnotations;
using Backend.Validators;

namespace Backend.DTOs;

/// <summary>
/// DTO para solicitar recuperación de contraseña.
/// </summary>
internal sealed class ResetPasswordDto
{
    /// <summary>
    /// Correo institucional del usuario.
    /// </summary>
    [Required(ErrorMessage = "El correo institucional es obligatorio.")]
    public required string CorreoInstitucional { get; set; }

    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el mensaje de error.
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(this, nameof(CorreoInstitucional));
}
