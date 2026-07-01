namespace Backend.Models;

internal sealed class Department
{
    public int Id { get; set; }
    public int? IdArea { get; set; }
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int Estado { get; set; }
}
