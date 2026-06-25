// IPositionAssignmentRepository.cs
using Backend.Models;

namespace Backend.Repositories;

internal interface IPositionAssignmentRepository
{
    /// <summary>Vinculaciones activas (FECHA_FINAL IS NULL) de un usuario, con el nombre del puesto.</summary>
    Task<List<PositionAssignment>> ObtenerActivasPorUsuarioAsync(string correo);

    /// <summary>Plazas que no tienen ninguna vinculación activa (disponibles para asignar).</summary>
    Task<List<Position>> ObtenerPlazasDisponiblesAsync();

    /// <summary>Indica si la plaza ya está vinculada activamente a algún usuario.</summary>
    Task<bool> PlazaTieneAsignacionActivaAsync(ulong numeroPlaza);

    /// <summary>Inserta una nueva vinculación plaza-usuario.</summary>
    Task AsignarAsync(PositionAssignment asignacion);

    /// <summary>Cierra la vinculación activa de la plaza para el usuario (FECHA_FINAL = SYSDATE).</summary>
    Task<bool> DesasignarAsync(ulong numeroPlaza, string correo);
}
