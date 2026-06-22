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
                Conflicto = nombre => $"Ya existe una unidad con el nombre '{nombre}'.",
                Creado = nombre => $"Unidad '{nombre}' creada correctamente.",
                Actualizado = nombre => $"Unidad '{nombre}' actualizada correctamente.",
                NoEncontradoPorNombre = nombre => $"No se encontró la unidad '{nombre}'.",
                NoEncontradoActivoPorId = id => $"No se encontró la unidad activa con ID '{id}'.",
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
