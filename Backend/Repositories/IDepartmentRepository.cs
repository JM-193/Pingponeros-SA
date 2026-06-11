using Backend.Models;

namespace Backend.Repositories;

internal interface IDepartmentRepository
{
    Task<List<Departamento>> ObtenerTodosAsync();
    Task<Departamento?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Departamento departamento);
    Task<bool> ActualizarAsync(string nombreOriginal, Departamento departamento);
    Task<bool> DesactivarAsync(int id);
}
