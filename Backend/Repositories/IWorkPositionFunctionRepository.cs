using Backend.Models;

namespace Backend.Repositories;

internal interface IWorkPositionFunctionRepository
{
    Task<List<Function>> ObtenerFuncionesDePuestoAsync(int idPuesto);
    Task<bool> EstaAsociadaAsync(int idPuesto, int idFuncion);
    Task AgregarAsync(int idPuesto, int idFuncion);
    Task<bool> QuitarAsync(int idPuesto, int idFuncion);
}