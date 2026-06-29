namespace Backend.Models;

/// <summary>
/// Cabecera de una declaración jurada del puesto de trabajo (DECLARACIONES_JURADAS).
/// <c>Completa = 0</c> es un borrador activo; <c>Completa = 1</c> es una declaración finalizada
/// (solo lectura, en el historial). Una cancelación elimina la fila físicamente.
/// </summary>
internal sealed class Declaracion
{
    public int Id { get; set; }
    public ulong NumeroPlaza { get; set; }
    public string CorreoInstitucional { get; set; } = string.Empty;
    public DateTime FechaDeclaracion { get; set; }
    /// <summary>0 = Borrador, 1 = Completa.</summary>
    public int Completa { get; set; }
}
