namespace Backend.Models;

/// <summary>
/// Fila del reporte administrativo de horas / carga laboral: agrega, por declaración completa,
/// las horas semanales registradas (suma de sus actividades) y la cantidad de funciones declaradas.
/// El cálculo semanal se realiza en <see cref="Backend.Helpers.WorkloadCalculator"/>.
/// </summary>
internal sealed class ReporteHorasFila
{
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public ulong NumeroPlaza { get; set; }
    public string? Cargo { get; set; }
    public DateTime FechaDeclaracion { get; set; }
    public string? JornadaLaboral { get; set; }
    public double TotalMinutosSemanales { get; set; }
    public int CantidadFunciones { get; set; }
}
