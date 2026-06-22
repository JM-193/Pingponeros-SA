// TextNormalizer.cs
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Backend.Helpers;

/// <summary>
/// Normalización de texto compartida por las rutas: minúsculas para correos y
/// nombres de entidades, y capitalización de nombres propios. Centraliza la única
/// supresión de CA1308 (paso a minúsculas exigido por requisito de negocio).
/// </summary>
internal static class TextNormalizer
{
    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los nombres de entidades organizacionales se normalizan a minúsculas por requisito de negocio.")]
    public static string Nombre(string nombre) => nombre.Trim().ToLowerInvariant();

    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los correos se normalizan a minúsculas por requisito de negocio.")]
    public static string Correo(string correo) => correo.Trim().ToLowerInvariant();

    /// <summary>
    /// Capitaliza un texto: primera letra en mayúscula y el resto en minúscula.
    /// Devuelve el texto recortado (o cadena vacía) cuando está vacío o en blanco.
    /// </summary>
    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los nombres se capitalizan (resto en minúsculas) por requisito de negocio.")]
    public static string Capitalizar(string? texto) =>
        string.IsNullOrWhiteSpace(texto) ? texto?.Trim() ?? "" :
        char.ToUpper(texto.Trim()[0], CultureInfo.InvariantCulture) + texto.Trim()[1..].ToLower(CultureInfo.InvariantCulture);
}
