namespace Backend.Models;

/// <summary>Permiso o licencia autorizada (PERMISOS_AUSENCIA). <c>Dias</c> en días.</summary>
internal sealed class PermisoAusencia
{
    public int Id { get; set; }
    public int IdDeclaracion { get; set; }
    public decimal Dias { get; set; }
    public string Justificacion { get; set; } = string.Empty;
    /// <summary>0 = la jefatura no tiene conocimiento, 1 = sí.</summary>
    public int ConocimientoJefatura { get; set; }
}
