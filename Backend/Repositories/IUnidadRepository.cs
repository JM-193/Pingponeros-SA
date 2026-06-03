using Backend.Models;

namespace Backend.Repositories;

internal interface IUnidadRepository
{
    Task<List<Unidad>> ObtenerTodasAsync();
    Task<Unidad?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Unidad unidad);
    Task<bool> ActualizarAsync(string nombreOriginal, Unidad unidad);
    Task<bool> DesactivarAsync(int id);
}
