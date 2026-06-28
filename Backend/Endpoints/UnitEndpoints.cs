// UnitEndpoints.cs
using Backend.DTOs;
using Backend.Endpoints.Shared;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Endpoints;

internal static class UnitEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Unidades                                                 //
    // ---------------------------------------------------------------- //
    public static void MapUnitEndpoints(this IEndpointRouteBuilder app, bool isDev) =>
        app.MapOrgCrudEndpoints(new OrgCrudEndpoints<IUnitRepository, Unit, CreateUnitDto>
        {
            RouteGroup = "/unidades",
            Messages = new CrudMessages
            {
                Conflicto = _ => "Ya existe una unidad con ese nombre.",
                Creado = _ => "Unidad creada correctamente.",
                Actualizado = _ => "Unidad actualizada correctamente.",
                NoEncontradoPorNombre = _ => "No se encontró la unidad.",
                NoEncontradoActivoPorId = _ => "No se encontró la unidad activa.",
            },
            Validar = dto => dto.Validar(),
            NombreDto = dto => dto.Nombre,
            NombreEntidad = unidad => unidad.Nombre,
            CrearEntidad = dto => new Unit
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                Estado = dto.Estado ?? 1,
            },
            ObtenerTodos = repo => repo.ObtenerTodasAsync(),
            ObtenerPorNombre = (repo, nombre) => repo.ObtenerPorNombreAsync(nombre),
            ExisteNombre = (repo, nombre) => repo.ExisteNombreAsync(nombre),
            Insertar = (repo, unidad) => repo.InsertarAsync(unidad),
            Actualizar = (repo, nombre, unidad) => repo.ActualizarAsync(nombre, unidad),
            Desactivar = (repo, id) => repo.DesactivarAsync(id),
        }, isDev);
}
