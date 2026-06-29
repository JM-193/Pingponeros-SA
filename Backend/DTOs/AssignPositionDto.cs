// AssignPositionDto.cs
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Backend.Validators;

namespace Backend.DTOs;

/// <summary>
/// DTO para vincular una plaza a un usuario (fila de PLAZAS_USUARIOS).
/// <c>FechaFinal</c> es opcional; al desvincular la fija el sistema.
/// </summary>
[SuppressMessage("Performance", "CA1812:AvoidUninstantiatedInternalClasses",
    Justification = "Instanciado por el enlazador de modelos de ASP.NET Core.")]
internal sealed record AssignPositionDto(
    // Entero positivo sin signo: mismo rango que CreatePositionDto (NUMBER(20) sin signo).
    [property: Range(typeof(ulong), "1", "18446744073709551615",
        ErrorMessage = "El número de plaza debe ser un entero positivo.")]
    ulong NumeroPlaza,

    [property: Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un puesto válido.")]
    int IdPuesto,

    [property: Required(ErrorMessage = "La clase ocupacional es obligatoria.")]
    [property: MaxLength(190, ErrorMessage = "La clase ocupacional no puede superar los 190 caracteres.")]
    [property: RegularExpression(ValidationPatterns.SoloLetras, ErrorMessage = "La clase ocupacional solo puede contener letras.")]
    string ClaseOcupacional,

    [property: Required(ErrorMessage = "El lugar de trabajo es obligatorio.")]
    [property: MaxLength(150, ErrorMessage = "El lugar de trabajo no puede superar los 150 caracteres.")]
    string LugarTrabajo,

    [property: Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    DateTime? FechaInicio,

    // Opcional: sin [Required]. Si es null, la vinculación queda activa.
    DateTime? FechaFinal)
{
    /// <summary>
    /// Devuelve <c>null</c> si el DTO es válido; en caso contrario, el primer mensaje de error.
    /// </summary>
    public string? Validar() =>
        DtoValidator.PrimerError(
            this,
            nameof(NumeroPlaza),
            nameof(IdPuesto),
            nameof(ClaseOcupacional),
            nameof(LugarTrabajo),
            nameof(FechaInicio));
}
