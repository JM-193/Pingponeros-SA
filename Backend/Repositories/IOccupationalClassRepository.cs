using Backend.Models;

namespace Backend.Repositories;

internal interface IOccupationalClassRepository
{
    Task<List<OccupationalClass>> ObtenerTodasAsync();
    Task<bool> ExisteNombreAsync(string nombre);
    Task<bool> ExisteCodigoAsync(int codigo);
    Task<long> InsertarAsync(OccupationalClass clase);
    Task<OccupationalClass?> ObtenerPorIdAsync(long id);
    Task<bool> EliminarAsync(long id);
    Task<bool> EstaAsociadoAsync(long id);
}
