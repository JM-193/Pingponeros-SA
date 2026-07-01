namespace Backend.Models;

/// <summary>
/// Fila del reporte administrativo de funcionarios: datos del usuario (USUARIOS) y, si la tiene,
/// su plaza/puesto vigente (PLAZAS_USUARIOS + PUESTOS_TRABAJO). Un usuario sin plaza activa
/// aparece igualmente con los campos de plaza en <c>null</c>.
/// </summary>
internal sealed class ReporteFuncionarioFila
{
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    /// <summary>0 = Funcionario, 1 = Administrador.</summary>
    public int Rol { get; set; }
    /// <summary>0 = Inactivo, 1 = Activo.</summary>
    public int Estado { get; set; }
    public ulong? NumeroPlaza { get; set; }
    public string? Cargo { get; set; }
    public string? ClaseOcupacional { get; set; }
    public string? LugarTrabajo { get; set; }
}
