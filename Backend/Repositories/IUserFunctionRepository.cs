using Backend.Models;

namespace Backend.Repositories;

internal interface IUserFunctionRepository
{
    Task<List<UserFunction>> ObtenerTodasAsync();
    Task<List<UserFunction>> ObtenerPorCorreoAsync(string correo);
    Task<int> InsertarAsync(UserFunction funcion);
    Task<bool> EstaEnActividadesAsync(int id);
    Task<bool> EliminarAsync(int id);
}
