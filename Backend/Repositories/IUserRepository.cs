using Backend.Models;

namespace Backend.Repositories;

internal interface IUserRepository
{
    Task<IEnumerable<Usuario>> ObtenerTodosAsync();
    Task<Usuario?> ObtenerPorCorreoAsync(string correo);
    Task InsertarAsync(Usuario usuario);
    Task InsertarConContrasenaAsync(Usuario usuario, string contrasenaHash);
    Task InsertarContraseñaAsync(string correo, string contrasenaHash);
    Task CambiarContraseñaAsync(string correo, string contrasenaHash);
    Task<Password?> ObtenerContrasenaMasRecienteAsync(string correo);
    Task<string?> ObtenerHashMasRecienteAsync(string correo);
    Task<bool> ActualizarAsync(string correo, Usuario usuario);
    Task<bool> EliminarAsync(string correo);
    Task<bool> DesactivarPorContrasenaTemporalExpiradaAsync(string correo);
}
