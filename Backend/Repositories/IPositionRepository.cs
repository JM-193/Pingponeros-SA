// IPositionRepository.cs
using Backend.Models;

namespace Backend.Repositories;

internal interface IPositionRepository
{
    Task<List<Plaza>> ObtenerTodasAsync();
    Task<Plaza?> ObtenerPorNumeroAsync(long numeroPlaza);
    Task<bool> ExisteNumeroPlazaAsync(long numeroPlaza);
    Task InsertarAsync(Plaza plaza);
    Task<bool> ActualizarAsync(long numeroPlaza, Plaza plaza);
}
