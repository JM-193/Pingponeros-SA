using Backend.Models;

namespace Backend.Repositories;

internal interface IUnitRepository
{
    Task<List<Unit>> ObtenerTodasAsync();
    Task<Unit?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Unit unidad);
    Task<bool> ActualizarAsync(string nombreOriginal, Unit unidad);
    Task<bool> DesactivarAsync(int id);
}
