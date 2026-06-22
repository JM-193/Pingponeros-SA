// IAuthService.cs
using Backend.DTOs;

namespace Backend.Services;

/// <summary>
/// Orquestación de aplicación para autenticación y gestión de contraseñas. Concentra el
/// flujo de negocio (verificación de credenciales, generación/persistencia de contraseñas
/// y notificación por correo) fuera de la capa de transporte HTTP.
/// </summary>
internal interface IAuthService
{
    /// <summary>Autentica al usuario y, si procede, devuelve el token y los metadatos de su contraseña.</summary>
    Task<IResult> LoginAsync(LoginDto dto, bool isDev);

    /// <summary>Genera y envía una contraseña temporal sin revelar si el correo existe.</summary>
    Task<IResult> RecuperarContrasenaAsync(string correoInstitucional, bool isDev);

    /// <summary>Cambia la contraseña del usuario tras verificar la actual y la política de complejidad.</summary>
    Task<IResult> CambiarContrasenaAsync(ChangePasswordDto dto, bool isDev);
}
