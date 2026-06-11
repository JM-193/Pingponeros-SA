using Backend.Models;

namespace Backend.Repositories;

internal interface IDepartmentRepository
{
    Task<List<Department>> ObtenerTodosAsync();
    Task<Department?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Department departamento);
    Task<bool> ActualizarAsync(string nombreOriginal, Department departamento);
    Task<bool> DesactivarAsync(int id);
}
