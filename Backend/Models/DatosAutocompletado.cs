namespace Backend.Models;

/// <summary>
/// Datos preexistentes que rellenan la declaración para una plaza activa del usuario, obtenidos de la
/// función de base de datos <c>FN_DATOS_AUTOCOMPLETADO</c>: cargo, clase ocupacional, lugar de trabajo
/// y el nombre del titular del puesto.
/// </summary>
internal sealed class DatosAutocompletado
{
    public ulong NumeroPlaza { get; set; }
    public int IdPuesto { get; set; }
    public string? Cargo { get; set; }
    public string ClaseOcupacional { get; set; } = string.Empty;
    public string LugarTrabajo { get; set; } = string.Empty;
    public string Titular { get; set; } = string.Empty;
}
