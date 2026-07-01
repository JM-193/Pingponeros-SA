namespace Backend.Models;

/// <summary>Tiempo adicional fuera de jornada (HORAS_EXTRAS). <c>TiempoAdicional</c> en minutos.</summary>
internal sealed class HoraExtra
{
    public int Id { get; set; }
    public int IdDeclaracion { get; set; }
    public decimal TiempoAdicional { get; set; }
    public string Justificacion { get; set; } = string.Empty;
    /// <summary>0 = la jefatura no tiene conocimiento, 1 = sí.</summary>
    public int ConocimientoJefatura { get; set; }
}
