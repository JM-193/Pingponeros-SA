using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
/// <summary>
/// DTO para la creación de un nuevo usuario.
/// <para><c>Rol</c>: 0 = Funcionario, 1 = Administrador.</para>
/// </summary>
internal sealed record CreateUserDto(
    string CorreoInstitucional,
    string PrimerNombre,
    string? SegundoNombre,
    string PrimerApellido,
    string SegundoApellido,
    int Rol)
{
    private static readonly Regex NombreRegex =
        new(@"^[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+$",
            RegexOptions.Compiled, TimeSpan.FromMilliseconds(100));

    private static readonly Regex CorreoUcrRegex =
        new(@"^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$",
            RegexOptions.Compiled, TimeSpan.FromMilliseconds(100));

    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public string? Validar()
    {
        if (Rol is not (0 or 1))
            return "Rol inválido. Use 0 (Funcionario) o 1 (Administrador).";

        if (string.IsNullOrWhiteSpace(CorreoInstitucional))
            return "El correo institucional es obligatorio.";

        if (!CorreoUcrRegex.IsMatch(CorreoInstitucional.Trim()))
            return "El correo debe ser válido. Formato: nombre.apellido@ucr.ac.cr (solo letras antes de @).";

        if (string.IsNullOrWhiteSpace(PrimerNombre))
            return "El primer nombre es obligatorio.";

        if (!NombreRegex.IsMatch(PrimerNombre.Trim()))
            return "El primer nombre solo debe contener letras.";

        if (SegundoNombre is not null && !string.IsNullOrWhiteSpace(SegundoNombre)
            && !NombreRegex.IsMatch(SegundoNombre.Trim()))
            return "El segundo nombre solo debe contener letras.";

        if (string.IsNullOrWhiteSpace(PrimerApellido))
            return "El primer apellido es obligatorio.";

        if (!NombreRegex.IsMatch(PrimerApellido.Trim()))
            return "El primer apellido solo debe contener letras.";

        if (string.IsNullOrWhiteSpace(SegundoApellido))
            return "El segundo apellido es obligatorio.";

        if (!NombreRegex.IsMatch(SegundoApellido.Trim()))
            return "El segundo apellido solo debe contener letras.";

        return null;
    }
}
