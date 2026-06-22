// IUserService.cs
using Backend.DTOs;

namespace Backend.Services;

/// <summary>
/// Orquestación de aplicación para usuarios: encapsula los pasos de negocio que no
/// pertenecen ni al transporte HTTP ni al acceso a datos (generar contraseña temporal,
/// hashear, persistir y notificar por correo).
/// </summary>
internal interface IUserService
{
    /// <summary>
    /// Crea el usuario a partir del DTO ya validado y devuelve la respuesta HTTP
    /// correspondiente (201 con la contraseña temporal, 409 si el correo ya existe).
    /// </summary>
    Task<IResult> CrearAsync(CreateUserDto dto, bool isDev);
}
