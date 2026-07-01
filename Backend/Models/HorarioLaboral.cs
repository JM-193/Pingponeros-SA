namespace Backend.Models;

/// <summary>Horario laboral declarado (HORARIOS_LABORALES). Horas en formato <c>HH:MM</c>.</summary>
internal sealed class HorarioLaboral
{
    public int Id { get; set; }
    public int IdDeclaracion { get; set; }
    public string HoraEntrada { get; set; } = string.Empty;
    public string HoraSalida { get; set; } = string.Empty;
    public string JornadaLaboral { get; set; } = string.Empty;
}
