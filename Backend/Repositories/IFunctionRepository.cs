using Backend.Models;

namespace Backend.Repositories;

internal interface IFunctionRepository
{
    Task<List<Function>> ObtenerTodasAsync();
    Task<Function?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Function funcion);
    Task<bool> EstaEnActividadesAsync(int id);
    Task<bool> EliminarAsync(int id);
}
