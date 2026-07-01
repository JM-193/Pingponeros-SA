namespace Backend.Models;

/// <summary>
/// Agregado de lectura/escritura de una declaración: la cabecera más sus registros hijos y los
/// datos de la plaza (cargo, clase ocupacional y lugar de trabajo) tomados de PLAZAS_USUARIOS
/// para mostrar. Los campos hijos pueden ser <c>null</c> mientras la declaración es un borrador.
/// </summary>
internal sealed class DeclaracionDetalle
{
    public Declaracion Declaracion { get; set; } = new();
    public HorarioLaboral? Horario { get; set; }
    public Descanso? Descanso { get; set; }
    public HoraExtra? HoraExtra { get; set; }
    public PermisoAusencia? PermisoAusencia { get; set; }
    public List<Actividad> Actividades { get; set; } = [];

    // Datos de la plaza (no se persisten en la declaración; se toman de PLAZAS_USUARIOS).
    public string? Cargo { get; set; }
    public string? ClaseOcupacional { get; set; }
    public string? LugarTrabajo { get; set; }
}
