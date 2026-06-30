namespace Backend.Models;

/// <summary>
/// Fila del reporte administrativo de declaraciones juradas: una declaración con su titular,
/// plaza, cargo, fecha y estado (borrador/completa).
/// </summary>
internal sealed class ReporteDeclaracionFila
{
    public int Id { get; set; }
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public ulong NumeroPlaza { get; set; }
    public string? Cargo { get; set; }
    public DateTime FechaDeclaracion { get; set; }
    /// <summary>0 = Borrador, 1 = Completa.</summary>
    public int Completa { get; set; }
}
