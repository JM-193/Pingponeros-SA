using Backend.Models;

namespace Backend.Repositories;

internal interface IAreaRepository
{
    Task<List<Area>> ObtenerTodasAsync();
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Area area);
}
