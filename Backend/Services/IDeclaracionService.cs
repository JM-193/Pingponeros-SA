using Backend.DTOs;

namespace Backend.Services;

internal interface IDeclaracionService
{
    Task<IResult> CrearAsync(string correo, CreateDeclaracionDto dto, bool isDev);
    Task<IResult> GuardarAsync(int id, GuardarDeclaracionDto dto, bool isDev);
    Task<IResult> CompletarAsync(int id, bool isDev);
    Task<IResult> CancelarAsync(int id, bool isDev);
    Task<IResult> ObtenerActivaAsync(string correo, bool isDev);
    Task<IResult> ObtenerDetalleAsync(int id, bool isDev);
    Task<IResult> ObtenerHistorialAsync(string correo, bool isDev);
    Task<IResult> ObtenerAutocompletadoAsync(string correo, bool isDev);
}
