namespace Backend.Models;

/// <summary>
/// Representa una fila de PLAZAS_USUARIOS: la vinculación de una plaza a un usuario con un
/// puesto y clase ocupacional. Una vinculación está activa mientras <see cref="FechaFinal"/>
/// es <c>null</c> o una fecha futura; al desvincular se cierra fijando la fecha del sistema.
/// </summary>
internal sealed class PositionAssignment
{
    public ulong NumeroPlaza { get; set; }
    public string CorreoInstitucional { get; set; } = string.Empty;
    public int IdPuesto { get; set; }
    /// <summary>Nombre del puesto (unido desde PUESTOS_TRABAJO) para mostrar; no se persiste.</summary>
    public string? PuestoNombre { get; set; }
    public string ClaseOcupacional { get; set; } = string.Empty;
    /// <summary>Lugar de trabajo asignado a la plaza (PLAZAS_USUARIOS.LUGAR_TRABAJO).</summary>
    public string LugarTrabajo { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFinal { get; set; }
}