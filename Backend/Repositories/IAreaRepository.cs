using Backend.Models;

namespace Backend.Repositories;

public interface IAreaRepository
{
    Task<List<Area>> ObtenerTodasAsync();
    Task<bool> ExisteNombreAsync(string nombre);
    Task InsertarAsync(Area area);
}
