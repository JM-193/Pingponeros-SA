// IPositionRepository.cs
using Backend.Models;

namespace Backend.Repositories;

internal interface IPositionRepository
{
    Task<List<Position>> ObtenerTodasAsync();
    Task<Position?> ObtenerPorNumeroAsync(long numeroPlaza);
    Task<bool> ExisteNumeroPlazaAsync(long numeroPlaza);
    Task InsertarAsync(Position plaza);
    Task<bool> ActualizarAsync(long numeroPlaza, Position plaza);
}
