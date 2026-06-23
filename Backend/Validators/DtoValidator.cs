// DtoValidator.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.Validators;

/// <summary>
/// Ejecutor compartido de las <c>DataAnnotations</c> de los DTOs. Valida las propiedades
/// indicadas <b>en el orden dado</b> y devuelve el primer mensaje de error encontrado.
/// <para>
/// Se valida propiedad por propiedad (en lugar de <see cref="Validator.TryValidateObject"/>)
/// a propósito: el contrato HTTP histórico devuelve <em>un solo</em> mensaje con una prioridad
/// de evaluación concreta (p. ej. en <c>CreateUserDto</c> el rol se evalúa antes que el correo),
/// y <c>TryValidateObject</c> no garantiza ese orden. Cada DTO declara su orden con
/// <c>nameof(...)</c>, manteniendo las reglas como anotaciones declarativas sin perder el
/// comportamiento original.
/// </para>
/// </summary>
internal static class DtoValidator
{
    /// <summary>
    /// Valida las anotaciones de <paramref name="propiedadesEnOrden"/> sobre
    /// <paramref name="instancia"/>, en ese orden, y devuelve el primer mensaje de error
    /// (o <c>null</c> si todas son válidas). Para cada propiedad, <see cref="RequiredAttribute"/>
    /// se evalúa primero y corta el resto, replicando el patrón "obligatorio antes que formato".
    /// </summary>
    public static string? PrimerError(object instancia, params string[] propiedadesEnOrden)
    {
        var resultados = new List<ValidationResult>();

        foreach (var propiedad in propiedadesEnOrden)
        {
            var valor = instancia.GetType().GetProperty(propiedad)?.GetValue(instancia);
            var contexto = new ValidationContext(instancia) { MemberName = propiedad };

            resultados.Clear();
            if (!Validator.TryValidateProperty(valor, contexto, resultados))
                return resultados[0].ErrorMessage;
        }

        return null;
    }
}
