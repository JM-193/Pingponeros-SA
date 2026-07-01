using Backend.Models;

namespace Backend.Repositories;

internal interface IDeclaracionRepository
{
    /// <summary>Id del borrador activo (Completa = 0) del usuario, o <c>null</c> si no tiene.</summary>
    Task<int?> ObtenerIdActivaPorUsuarioAsync(string correo);

    /// <summary>Indica si el usuario ya tiene un borrador activo (regla de declaración única activa).</summary>
    Task<bool> ExisteActivaPorUsuarioAsync(string correo);

    /// <summary>Cabecera de una declaración (para validar propiedad/estado), o <c>null</c>.</summary>
    Task<Declaracion?> ObtenerCabeceraAsync(int id);

    /// <summary>Crea un borrador (Completa = 0, fecha del sistema) y devuelve su id.</summary>
    Task<int> CrearAsync(ulong numeroPlaza, string correo);

    /// <summary>Reemplaza, en una transacción, todos los hijos del borrador con el detalle dado.</summary>
    Task GuardarBorradorAsync(int id, DeclaracionDetalle detalle);

    /// <summary>Marca como completa un borrador (Completa 0 → 1). Devuelve <c>true</c> si cambió.</summary>
    Task<bool> CompletarAsync(int id);

    /// <summary>Elimina físicamente un borrador (los hijos se borran por trigger). Devuelve <c>true</c> si existía.</summary>
    Task<bool> CancelarAsync(int id);

    /// <summary>Detalle completo (cabecera + hijos + datos de la plaza), o <c>null</c>.</summary>
    Task<DeclaracionDetalle?> ObtenerDetalleAsync(int id);

    /// <summary>Declaraciones completas del usuario (historial), más recientes primero.</summary>
    Task<List<DeclaracionResumen>> ObtenerCompletasPorUsuarioAsync(string correo);

    /// <summary>
    /// Datos preexistentes (vía función de base de datos <c>FN_DATOS_AUTOCOMPLETADO</c>) para rellenar la
    /// declaración: una entrada por plaza activa del usuario, con cargo, clase ocupacional, lugar y titular.
    /// </summary>
    Task<List<DatosAutocompletado>> ObtenerDatosAutocompletadoAsync(string correo);
}
