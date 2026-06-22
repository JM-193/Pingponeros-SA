using System.Diagnostics.CodeAnalysis;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record ChangePasswordDto(
    string CorreoInstitucional,
    string ContrasenaActual,
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
        if (string.IsNullOrWhiteSpace(CorreoInstitucional))
            return "El correo institucional es obligatorio.";

        if (string.IsNullOrWhiteSpace(ContrasenaActual))
            return "La contraseña actual es obligatoria.";

        if (string.IsNullOrWhiteSpace(ContrasenaNueva))
            return "La nueva contraseña es obligatoria.";

        if (ContrasenaNueva.Equals(ContrasenaActual, StringComparison.Ordinal))
            return "La nueva contraseña debe ser diferente a la actual.";

        return null;
    }
}
