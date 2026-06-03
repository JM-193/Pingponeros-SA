using Backend.Models;

namespace Backend.Repositories;

internal interface ISeccionRepository
{
    Task<List<Seccion>> ObtenerTodasAsync();
    Task<Seccion?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Seccion seccion);
    Task<bool> ActualizarAsync(string nombreOriginal, Seccion seccion);
    Task<bool> DesactivarAsync(int id);
}
