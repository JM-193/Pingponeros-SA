// AreaEndpoints.cs
using Backend.DTOs;
using Backend.Endpoints.Shared;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Endpoints;

internal static class AreaEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Áreas                                                    //
    // ---------------------------------------------------------------- //
    public static void MapAreaEndpoints(this IEndpointRouteBuilder app, bool isDev) =>
        app.MapOrgCrudEndpoints(new OrgCrudEndpoints<IAreaRepository, Area, CreateAreaDto>
        {
            RouteGroup = "/areas",
            Messages = new CrudMessages
            {
                Conflicto = _ => "Ya existe un área con ese nombre.",
                Creado = _ => "Área creada correctamente.",
                Actualizado = _ => "Área actualizada correctamente.",
                NoEncontradoPorNombre = _ => "No se encontró el área.",
                NoEncontradoActivoPorId = _ => "No se encontró el área activa.",
            },
            Validar = dto => dto.Validar(),
            NombreDto = dto => dto.Nombre,
            NombreEntidad = area => area.Nombre,
            CrearEntidad = dto => new Area
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = dto.Estado ?? 1,
            },
            ObtenerTodos = repo => repo.ObtenerTodasAsync(),
            ObtenerPorNombre = (repo, nombre) => repo.ObtenerPorNombreAsync(nombre),
            ExisteNombre = (repo, nombre) => repo.ExisteNombreAsync(nombre),
            Insertar = (repo, area) => repo.InsertarAsync(area),
            Actualizar = (repo, nombre, area) => repo.ActualizarAsync(nombre, area),
            Desactivar = (repo, id) => repo.DesactivarAsync(id),
        }, isDev);
}
