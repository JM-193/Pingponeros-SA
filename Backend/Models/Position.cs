// Plaza.cs
namespace Backend.Models;

internal sealed class Position
{
    public ulong NumeroPlaza { get; set; }
    public int? IdUnidad { get; set; }
    public int? IdDepartamento { get; set; }
    public int? IdSeccion { get; set; }
    public int? IdArea { get; set; }
}
