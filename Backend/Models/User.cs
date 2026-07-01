namespace Backend.Models;

internal sealed class User
{
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string SegundoApellido { get; set; } = string.Empty;
    /// <summary>0 = Funcionario, 1 = Administrador</summary>
    public int Rol { get; set; }
    /// <summary>0 = Inactivo, 1 = Activo</summary>
    public int Estado { get; set; }
}
