namespace Backend.DTOs;

#pragma warning disable CA1812 // Instanciado por el enlazador de modelos de ASP.NET Core
/// <summary>
/// DTO para la creación de un nuevo usuario.
/// <para><c>Rol</c>: 0 = Funcionario, 1 = Administrador.</para>
/// </summary>
internal sealed record CrearUsuarioDto(
    string CorreoInstitucional,
    string PrimerNombre,
    string? SegundoNombre,
    string PrimerApellido,
    string? SegundoApellido,
    int Rol);
