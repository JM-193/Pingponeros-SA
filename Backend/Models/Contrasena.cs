namespace Backend.Models;

internal sealed class Contrasena
{
    public string Hash { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
    public bool EsTemporal { get; set; }
}
