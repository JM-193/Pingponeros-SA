using System.Diagnostics.CodeAnalysis;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record LoginDto(string CorreoInstitucional, string Contrasena)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el mensaje de error.
    /// </summary>
    public string? Validar() =>
        string.IsNullOrWhiteSpace(CorreoInstitucional) || string.IsNullOrWhiteSpace(Contrasena)
            ? "Correo y contraseña son obligatorios."
            : null;
}
