// ResetPasswordDto.cs
namespace Backend.DTOs;

/// <summary>
/// DTO para solicitar recuperación de contraseña.
/// </summary>
internal class ResetPasswordDto
{
    /// <summary>
    /// Correo institucional del usuario.
    /// </summary>
    public required string CorreoInstitucional { get; set; }
}
