// IJwtService
namespace Backend.Services;

/// <summary>
/// Service for generating authentication JWTs.
/// The signing key must come from configuration (appsettings.json or environment variables),
/// never hardcoded in the code.
internal interface IJwtService
{
    /// <summary>
    /// Generates a signed JWT with the basic claims of the authenticated user.
    /// </summary>
    string GenerarToken(
        string correoInstitucional,
        string primerNombre,
        string? segundoNombre,
        string primerApellido,
        string segundoApellido,
        int rol);
}