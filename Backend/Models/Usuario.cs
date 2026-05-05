namespace Backend.Models;

internal class Usuario
{
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Rol { get; set; } = string.Empty;
    /// <summary>0 = Inactivo, 1 = Activo</summary>
    public int Estado { get; set; }
}
