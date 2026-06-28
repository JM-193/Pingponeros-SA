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
                Conflicto = _ => "Ya existe un departamento con ese nombre.",
                Creado = _ => "Departamento creado correctamente.",
                Actualizado = _ => "Departamento actualizado correctamente.",
                NoEncontradoPorNombre = _ => "No se encontró el departamento.",
                NoEncontradoActivoPorId = _ => "No se encontró el departamento activo.",
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
