namespace Backend.Models;

/// <summary>Proyección ligera de una declaración para el historial (tarjetas en la página principal).</summary>
internal sealed class DeclaracionResumen
{
    public int Id { get; set; }
    public ulong NumeroPlaza { get; set; }
    public string? Cargo { get; set; }
    public DateTime FechaDeclaracion { get; set; }
    public int Completa { get; set; }
}
