using Backend.Models;

namespace Backend.Repositories;

internal interface IUsuarioRepository
{
    Task<IEnumerable<Usuario>> ObtenerTodosAsync();
    Task<Usuario?> ObtenerPorCorreoAsync(string correo);
    Task InsertarAsync(Usuario usuario);
    Task<bool> ActualizarAsync(string correo, Usuario usuario);
    Task<bool> EliminarAsync(string correo);
}
