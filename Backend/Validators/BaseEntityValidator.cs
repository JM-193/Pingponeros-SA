// BaseEntityValidator.cs
namespace Backend.Validators;

/// <summary>
/// Validación de forma compartida por las entidades organizacionales que comparten
/// estructura (Departamento, Sección, Unidad): nombre y descripción obligatorios y
/// estado opcional restringido a 0/1. Cada DTO la invoca con su propio artículo y
/// nombre de entidad para construir el mensaje exacto.
/// </summary>
internal static class BaseEntityValidator
{
    /// <summary>
    /// Devuelve <c>null</c> si los datos son válidos; en caso contrario, el primer
    /// mensaje de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public static string? Validar(string? nombre, string? descripcion, int? estado, string articulo, string entidad)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return $"El nombre {articulo} {entidad} es obligatorio.";

        if (string.IsNullOrWhiteSpace(descripcion))
            return "La descripción es obligatoria.";

        if (estado is not null && estado is not (0 or 1))
            return "El estado debe ser 0 (Inactivo) o 1 (Activo).";

        return null;
    }
}
