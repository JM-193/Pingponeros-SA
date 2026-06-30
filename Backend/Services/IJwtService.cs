// IJwtService
namespace Backend.Services;

/// <summary>
/// Servicio para generar JWT de autenticación.
/// La clave de firma debe provenir de la configuración (appsettings.json o variables de entorno),
/// nunca incrustada directamente en el código.
/// </summary>
internal interface IJwtService
{
    /// <summary>
    /// Genera un JWT firmado con los claims básicos del usuario autenticado.
    /// </summary>
    string GenerarToken(
        string correoInstitucional,
        string primerNombre,
        string? segundoNombre,
        string primerApellido,
        string segundoApellido,
        int rol);
}