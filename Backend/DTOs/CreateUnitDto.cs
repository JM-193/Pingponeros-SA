using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record CreateUnitDto(
    string Nombre,
    string Descripcion,
    int? IdArea,
    int? IdDepartamento,
    int? IdSeccion,
    int? Estado)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje
    /// de error encontrado (se preserva el orden de evaluación original).
    /// </summary>
    public string? Validar()
    {
        var baseError = EntidadBaseValidator.Validar(Nombre, Descripcion, Estado, "de la", "unidad");
        if (baseError is not null)
            return baseError;

        if (IdDepartamento is not null && IdSeccion is not null)
            return "Una unidad no puede pertenecer a un departamento y a una sección al mismo tiempo.";

        return null;
    }
}
