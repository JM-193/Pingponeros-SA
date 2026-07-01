using Backend.Models;

namespace Backend.Repositories;

internal interface IUserRepository
{
    Task<IEnumerable<User>> ObtenerTodosAsync();
    Task<User?> ObtenerPorCorreoAsync(string correo);
    Task InsertarAsync(User usuario);
    Task InsertarConContrasenaAsync(User usuario, string contrasenaHash);
    Task InsertarContraseñaAsync(string correo, string contrasenaHash);
    Task ChangePasswordAsync(string correo, string contrasenaHash);
    Task<Password?> ObtenerContrasenaMasRecienteAsync(string correo);
    Task<string?> ObtenerHashMasRecienteAsync(string correo);
    Task<bool> ActualizarAsync(string correo, User usuario);
    Task<bool> EliminarAsync(string correo);
}
