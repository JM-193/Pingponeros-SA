// SectionEndpoints.cs
using Backend.DTOs;
using Backend.Endpoints.Shared;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Endpoints;

internal static class SectionEndpoints
{
    // ---------------------------------------------------------------- //
    // Rutas de Secciones                                                //
    // La fábrica MapOrgCrudEndpoints registra estas rutas:             //
    //   GET    /secciones          — Lista todas las secciones          //
    //   POST   /secciones          — Crea una sección (vinculada a un Área) //
    //   GET    /secciones/{nombre} — Busca una sección por nombre       //
    //   PUT    /secciones/{nombre} — Edita una sección existente        //
    //   DELETE /secciones/{id}     — Desactiva una sección              //
    // ---------------------------------------------------------------- //
    public static void MapSectionEndpoints(this IEndpointRouteBuilder app, bool isDev) =>
        app.MapOrgCrudEndpoints(new OrgCrudEndpoints<ISectionRepository, Section, CreateSectionDto>
        {
            RouteGroup = "/secciones",
            Messages = new CrudMessages
            {
                Conflicto = _ => "Ya existe una sección con ese nombre.",
                Creado = _ => "Sección creada correctamente.",
                Actualizado = _ => "Sección actualizada correctamente.",
                NoEncontradoPorNombre = _ => "No se encontró la sección.",
                NoEncontradoActivoPorId = _ => "No se encontró la sección activa.",
            },
            Validar = dto => dto.Validar(),
            NombreDto = dto => dto.Nombre,
            NombreEntidad = seccion => seccion.Nombre,
            CrearEntidad = dto => new Section
            {
                Nombre = TextNormalizer.Nombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            },
            ObtenerTodos = repo => repo.ObtenerTodasAsync(),
            ObtenerPorNombre = (repo, nombre) => repo.ObtenerPorNombreAsync(nombre),
            ExisteNombre = (repo, nombre) => repo.ExisteNombreAsync(nombre),
            Insertar = (repo, seccion) => repo.InsertarAsync(seccion),
            Actualizar = (repo, nombre, seccion) => repo.ActualizarAsync(nombre, seccion),
            Desactivar = (repo, id) => repo.DesactivarAsync(id),
        }, isDev);
}
