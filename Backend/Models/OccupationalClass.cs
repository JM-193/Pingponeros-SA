namespace Backend.Models;

internal sealed class OccupationalClass
{
    public long IdClaseOcupacional { get; set; }
    public int Codigo { get; set; }
    public string Nombre { get; set; } = null!;
}
