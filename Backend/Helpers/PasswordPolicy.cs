// PasswordPolicy.cs
namespace Backend.Helpers;

/// <summary>
/// Política de complejidad de contraseñas. Es una regla de seguridad reutilizable,
/// no una validación de forma de un DTO concreto, por lo que vive como helper de
/// dominio independiente del transporte HTTP.
/// </summary>
internal static class PasswordPolicy
{
    /// <summary>
    /// Devuelve <c>null</c> si la contraseña cumple todos los requisitos; en caso
    /// contrario, un mensaje en español enumerando los requisitos faltantes.
    /// </summary>
    public static string? Validar(string contrasena)
    {
        var requisitos = new List<string>();

        if (contrasena.Length < 12)
            requisitos.Add("mínimo 12 caracteres");

        if (!contrasena.Any(char.IsUpper))
            requisitos.Add("una mayúscula");

        if (!contrasena.Any(char.IsLower))
            requisitos.Add("una minúscula");

        if (!contrasena.Any(char.IsDigit))
            requisitos.Add("un número");

        if (!contrasena.Any(c => "!@#$%&*".Contains(c, StringComparison.Ordinal)))
            requisitos.Add("un carácter especial (!@#$%&*)");

        return requisitos.Count > 0 ? $"La contraseña debe contener: {string.Join(", ", requisitos)}" : null;
    }
}
