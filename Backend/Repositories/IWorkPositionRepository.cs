using Backend.Models;

namespace Backend.Repositories;

internal interface IWorkPositionRepository
{
    Task<List<WorkPosition>> ObtenerTodasAsync();
    Task<WorkPosition?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(WorkPosition puesto);
    Task<bool> EstaAsociadoAsync(int id);
    Task<bool> EliminarAsync(int id);
}
