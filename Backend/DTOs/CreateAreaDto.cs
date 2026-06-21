using System.Diagnostics.CodeAnalysis;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateAreaDto(string Nombre, string Descripcion, int? Estado)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public string? Validar()
    {
        if (string.IsNullOrWhiteSpace(Nombre))
            return "El nombre del área es obligatorio.";

        if (string.IsNullOrWhiteSpace(Descripcion))
            return "La descripción es obligatoria.";

        if (Estado is not null && Estado is not (0 or 1))
            return "El estado debe ser 0 (Inactivo) o 1 (Activo).";

        return null;
    }
}
