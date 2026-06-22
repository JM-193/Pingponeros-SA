// DepartmentEndpoints.cs
using Backend.DTOs;
using Backend.Endpoints.Shared;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Endpoints;

internal static class DepartmentEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Departamentos                                            //
    // ---------------------------------------------------------------- //
    public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app, bool isDev) =>
        app.MapOrgCrudEndpoints(new OrgCrudEndpoints<IDepartmentRepository, Department, CreateDepartmentDto>
        {
            RouteGroup = "/departamentos",
            Messages = new CrudMessages
            {
                Conflicto = nombre => $"Ya existe un departamento con el nombre '{nombre}'.",
                Creado = nombre => $"Departamento '{nombre}' creado correctamente.",
                Actualizado = nombre => $"Departamento '{nombre}' actualizado correctamente.",
                NoEncontradoPorNombre = nombre => $"No se encontró el departamento '{nombre}'.",
                NoEncontradoActivoPorId = id => $"No se encontró el departamento activo con ID '{id}'.",
            },
            Validar = dto => dto.Validar(),
            NombreDto = dto => dto.Nombre,
            NombreEntidad = departamento => departamento.Nombre,
            CrearEntidad = dto => new Department
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            },
            ObtenerTodos = repo => repo.ObtenerTodosAsync(),
            ObtenerPorNombre = (repo, nombre) => repo.ObtenerPorNombreAsync(nombre),
            ExisteNombre = (repo, nombre) => repo.ExisteNombreAsync(nombre),
            Insertar = (repo, departamento) => repo.InsertarAsync(departamento),
            Actualizar = (repo, nombre, departamento) => repo.ActualizarAsync(nombre, departamento),
            Desactivar = (repo, id) => repo.DesactivarAsync(id),
        }, isDev);
}
