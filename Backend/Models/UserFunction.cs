namespace Backend.Models;

internal sealed class UserFunction
{
    public int Id { get; set; }
    public string CorreoInstitucional { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
}
