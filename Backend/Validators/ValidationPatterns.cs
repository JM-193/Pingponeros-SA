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
    public const string SoloLetras = @"^(?:\s+|\s*[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s*)$";

    /// <summary>
    /// Texto descriptivo: letras (con acentos), dígitos, espacios y la puntuación básica de
    /// redacción —punto, coma y dos puntos—. No admite otros símbolos. Pensado
    /// para campos multi-palabra (p. ej. clase ocupacional, lugar de trabajo).
    /// </summary>
    public const string SoloLetrasYPuntuacion = @"^[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ.,:\s]+$";

    /// <summary>
    /// Texto libre "seguro": letras (con acentos), dígitos, espacios y puntuación de redacción
    /// (<c>. , : ( ) /  -</c>). Es una lista blanca que excluye los caracteres usados
    /// para romper cadenas en inyecciones SQL (comillas <c>' "</c>, punto y coma, barra invertida,
    /// <c>&lt; &gt; = *</c>). Defensa en profundidad: la protección principal son las consultas
    /// parametrizadas de los repositorios. Pensado para justificaciones de texto libre.
    /// </summary>
    public const string TextoSeguro = @"^[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,:()/\-]*$";

    /// <summary>
    /// Correo institucional UCR: <c>nombre.apellido@ucr.ac.cr</c> (solo letras antes de @),
    /// con espacios envolventes tolerados.
    /// </summary>
    public const string CorreoUcr = @"^\s*[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]\s*$";
}
