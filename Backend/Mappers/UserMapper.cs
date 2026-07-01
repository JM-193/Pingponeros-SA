// UserMapper.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;

namespace Backend.Mappers;

/// <summary>
/// Mapea un <see cref="CreateUserDto"/> a la entidad <see cref="User"/>, aplicando la
/// normalización de negocio: correo a minúsculas, nombres y apellidos capitalizados, y
/// segundo nombre opcional convertido a <c>null</c> cuando viene en blanco. El usuario
/// resultante se crea siempre activo (Estado = 1).
/// </summary>
internal static class UserMapper
{
    public static User ToModel(this CreateUserDto dto) => new()
    {
        CorreoInstitucional = TextNormalizer.Correo(dto.CorreoInstitucional),
        PrimerNombre = TextNormalizer.Capitalizar(dto.PrimerNombre),
        SegundoNombre = string.IsNullOrWhiteSpace(dto.SegundoNombre) ? null : TextNormalizer.Capitalizar(dto.SegundoNombre),
        PrimerApellido = TextNormalizer.Capitalizar(dto.PrimerApellido),
        SegundoApellido = TextNormalizer.Capitalizar(dto.SegundoApellido),
        Rol = dto.Rol,
        Estado = 1,
    };
}
