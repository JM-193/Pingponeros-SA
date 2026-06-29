namespace Backend.Models;

/// <summary>
/// Actividad/función incluida en una declaración (ACTIVIDADES). Referencia exactamente una de
/// <see cref="IdFuncion"/> (función oficial) o <see cref="IdFuncionPropia"/> (definida por el usuario),
/// según <see cref="TipoFuncion"/>. <c>Duracion</c> en minutos.
/// </summary>
internal sealed class Actividad
{
    public int Id { get; set; }
    public int IdDeclaracion { get; set; }
    public int? IdFuncion { get; set; }
    public int? IdFuncionPropia { get; set; }
    public string TipoFuncion { get; set; } = string.Empty;
    public string Periodicidad { get; set; } = string.Empty;
    public int VecesRealizadas { get; set; }
    public int Duracion { get; set; }

    /// <summary>Nombre de la función (unido desde FUNCIONES / FUNCIONES_USUARIOS) para mostrar; no se persiste.</summary>
    public string? Nombre { get; set; }
    /// <summary>Descripción de la función para mostrar; no se persiste.</summary>
    public string? Descripcion { get; set; }
}
