using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record ChangePasswordDto(
    [property: Required(ErrorMessage = "El correo institucional es obligatorio.")]
    [property: MaxLength(190, ErrorMessage = "El correo no puede superar los 190 caracteres.")]
    string CorreoInstitucional,
    [property: Required(ErrorMessage = "La contraseña actual es obligatoria.")]
    [property: MaxLength(30, ErrorMessage = "La contraseña no puede superar los 30 caracteres.")]
    string ContrasenaActual,
    [property: Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
    [property: MaxLength(30, ErrorMessage = "La contraseña no puede superar los 30 caracteres.")]
    string ContrasenaNueva)
{
    /// <summary>
    /// Valida la forma del DTO (campos obligatorios y que la nueva contraseña difiera
    /// de la actual). La política de complejidad se valida aparte con
    /// <see cref="Backend.Helpers.PasswordPolicy"/>. Devuelve <c>null</c> si es válido;
    /// en caso contrario, el primer mensaje de error (orden de evaluación preservado).
    /// </summary>
    public string? Validar()
    {
        // Campos obligatorios (anotaciones); tienen prioridad sobre la regla cruzada.
        if (DtoValidator.PrimerError(this, nameof(CorreoInstitucional), nameof(ContrasenaActual), nameof(ContrasenaNueva)) is { } error)
            return error;

        // Regla cruzada: la nueva contraseña debe diferir de la actual.
        if (ContrasenaNueva.Equals(ContrasenaActual, StringComparison.Ordinal))
            return "La nueva contraseña debe ser diferente a la actual.";

        return null;
    }
}
