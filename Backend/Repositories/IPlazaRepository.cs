// IPlazaRepository.cs
using Backend.Models;

namespace Backend.Repositories;

internal interface IPlazaRepository
{
    Task<List<Plaza>> ObtenerTodasAsync();
    Task<bool> ExisteNumeroPlazaAsync(long numeroPlaza);
    Task InsertarAsync(Plaza plaza);
}
