// IPositionRepository.cs
using Backend.Models;

namespace Backend.Repositories;

internal interface IPositionRepository
{
    Task<List<Position>> ObtenerTodasAsync();
    Task<Position?> ObtenerPorNumeroAsync(ulong numeroPlaza);
    Task<bool> ExisteNumeroPlazaAsync(ulong numeroPlaza);
    Task InsertarAsync(Position plaza);
    Task<bool> ActualizarAsync(ulong numeroPlaza, Position plaza);
}
