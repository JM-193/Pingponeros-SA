namespace Backend.Models;

/// <summary>Descanso declarado (DESCANSOS). <c>Tiempo</c> en minutos (suma de almuerzo y café).</summary>
internal sealed class Descanso
{
    public int Id { get; set; }
    public int IdDeclaracion { get; set; }
    public decimal Tiempo { get; set; }
}
