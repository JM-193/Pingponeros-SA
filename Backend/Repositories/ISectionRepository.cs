using Backend.Models;

namespace Backend.Repositories;

internal interface ISectionRepository
{
    Task<List<Section>> ObtenerTodasAsync();
    Task<Section?> ObtenerPorNombreAsync(string nombre);
    Task<bool> ExisteNombreAsync(string nombre);
    Task<int> InsertarAsync(Section seccion);
    Task<bool> ActualizarAsync(string nombreOriginal, Section seccion);
    Task<bool> DesactivarAsync(int id);
}
