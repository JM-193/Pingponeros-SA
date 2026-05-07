using Backend.Models;

namespace Backend.Repositories;

internal interface IAreaRepository
{
    Task<List<Area>> ObtenerTodasAsync();
    Task<Area?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Area area);
    Task<bool> ActualizarAsync(string nombreOriginal, Area area);
    Task<bool> DesactivarAsync(int id);
}
