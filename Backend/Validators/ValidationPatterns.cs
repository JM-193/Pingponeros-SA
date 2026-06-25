// ValidationPatterns.cs
namespace Backend.Validators;

/// <summary>
/// Patrones de expresión regular compartidos por las <c>DataAnnotations</c> de los DTOs.
/// Centralizarlos evita duplicar las expresiones en cada atributo y permite referenciarlos
/// como constantes en tiempo de compilación.
/// </summary>
internal static class ValidationPatterns
{
    /// <summary>
    /// Solo letras (con acentos). Admite espacios envolventes —equivalente al <c>.Trim()</c>
    /// del código original— y un núcleo opcional para tolerar campos opcionales en blanco
    /// (p. ej. el segundo nombre); los campos obligatorios delegan el "vacío" en <c>[Required]</c>.
    /// </summary>
    public const string SoloLetras = @"^\s*([A-Za-záéíóúÁÉÍÓÚñÑüÜ]+)?\s*$";

    /// <summary>
    /// Correo institucional UCR: <c>nombre.apellido@ucr.ac.cr</c> (solo letras antes de @),
    /// con espacios envolventes tolerados.
    /// </summary>
    public const string CorreoUcr = @"^\s*[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]\s*$";
}
