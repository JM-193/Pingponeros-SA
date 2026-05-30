using Backend.Models;

namespace Backend.Repositories;

internal interface IUsuarioRepository
{
    Task<IEnumerable<Usuario>> ObtenerTodosAsync();
    Task<Usuario?> ObtenerPorCorreoAsync(string correo);
    Task InsertarAsync(Usuario usuario);
    Task InsertarConContrasenaAsync(Usuario usuario, string contrasenaHash);
    Task InsertarContraseñaAsync(string correo, string contrasenaHash);
    Task CambiarContraseñaAsync(string correo, string contrasenaHash);
    Task<string?> ObtenerHashMasRecienteAsync(string correo);
    Task<bool> ActualizarAsync(string correo, Usuario usuario);
    Task<bool> EliminarAsync(string correo);
}
