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
                Conflicto = nombre => $"Ya existe un área con el nombre '{nombre}'.",
                Creado = nombre => $"Área '{nombre}' creada correctamente.",
                Actualizado = nombre => $"Área '{nombre}' actualizada correctamente.",
                NoEncontradoPorNombre = nombre => $"No se encontró el área '{nombre}'.",
                NoEncontradoActivoPorId = id => $"No se encontró el área activa con ID '{id}'.",
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
