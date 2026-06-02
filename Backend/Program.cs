// Program.cs
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.RegularExpressions;
using DotNetEnv;
using Oracle.ManagedDataAccess.Client;
using Scalar.AspNetCore;
using Backend.DTOs;
using Backend.Repositories;
using Backend.Services;
using Backend.Helpers;

namespace Backend;

internal static class Program
{
    public static void Main(string[] args)
    {
        Env.Load();

        var builder = WebApplication.CreateBuilder(args);

        ConfigureOracle(builder);
        ConfigureServices(builder);

        var app = builder.Build();
        var isDev = app.Environment.IsDevelopment();

        ConfigureMiddleware(app);
        MapUsuarioRoutes(app, isDev);
        MapAreaRoutes(app, isDev);
        MapDepartamentoRoutes(app, isDev);
        MapSeccionRoutes(app, isDev);
        MapUnidadRoutes(app, isDev);
        MapAuth(app, isDev);

        app.Run();
    }

    private static void ConfigureOracle(WebApplicationBuilder builder)
    {
        var walletPath = Path.GetFullPath(
            Path.Combine(builder.Environment.ContentRootPath,
                builder.Configuration["Oracle:WalletPath"] ?? "wallet"));

        try { OracleConfiguration.TnsAdmin = walletPath; }
        catch (InvalidOperationException) { /* ODP.NET solo permite fijar TnsAdmin una vez por proceso; se ignora si ya fue configurado. */ }

        try { OracleConfiguration.WalletLocation = walletPath; }
        catch (InvalidOperationException) { /* Ídem para WalletLocation. */ }
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.AddScoped(_ =>
            new OracleConnection(builder.Configuration.GetConnectionString("OracleDB")));
        builder.Services.AddScoped<IDbExecutor, OracleDbExecutor>();
        builder.Services.AddScoped<IQueryExecutor, OracleQueryExecutor>();
        builder.Services.AddScoped<IUsuarioRepository>(sp =>
            new UsuarioRepository(sp.GetRequiredService<IQueryExecutor>()));
        builder.Services.AddScoped<IAreaRepository>(sp =>
            new AreaRepository(sp.GetRequiredService<IQueryExecutor>()));
        builder.Services.AddScoped<IDepartamentoRepository>(sp =>
            new DepartamentoRepository(sp.GetRequiredService<IQueryExecutor>()));
        builder.Services.AddScoped<ISeccionRepository>(sp =>
            new SeccionRepository(sp.GetRequiredService<IQueryExecutor>()));
        builder.Services.AddScoped<IUnidadRepository>(sp =>
            new UnidadRepository(sp.GetRequiredService<IQueryExecutor>()));
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddOpenApi();
        builder.Services.AddCors(options =>
            options.AddPolicy("FrontendOrigin", policy =>
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyMethod()
                      .AllowAnyHeader()));
    }

    private static void ConfigureMiddleware(WebApplication app)
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
        app.UseCors("FrontendOrigin");
    }

    private static void MapUsuarioRoutes(WebApplication app, bool isDev)
    {
        // ---------------------------------------------------------------- //
        // Rutas de Usuarios                                                 //
        // ---------------------------------------------------------------- //
        var usuarios = app.MapGroup("/usuarios");

        MapUsuariosGetAll(usuarios);
        MapUsuariosGetByCorreo(usuarios);
        MapUsuariosCreate(usuarios, isDev);
        MapUsuariosUpdate(usuarios);
        MapUsuariosDelete(usuarios);
    }

    private static void MapUsuariosGetAll(RouteGroupBuilder usuarios)
    {
        // GET /usuarios — Lista todos los usuarios
        usuarios.MapGet("/", async (IUsuarioRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodosAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapUsuariosGetByCorreo(RouteGroupBuilder usuarios)
    {
        // GET /usuarios/{correo} — Busca por clave primaria
        usuarios.MapGet("/{correo}", async (string correo, IUsuarioRepository repo) =>
        {
            try
            {
                var usuario = await repo.ObtenerPorCorreoAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
                return usuario is null
                    ? Results.NotFound(new { error = $"No se encontró el usuario '{correo}'." })
                    : Results.Ok(usuario);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapUsuariosCreate(RouteGroupBuilder usuarios, bool isDev)
    {
        // POST /usuarios — Crea un nuevo usuario con contraseña temporal
        usuarios.MapPost("/", async (CrearUsuarioDto dto, IUsuarioRepository repo, IEmailService emailService) =>
        {
            var validationResult = ValidarCrearUsuario(dto);
            if (validationResult is not null)
                return validationResult;

            var usuario = CrearUsuarioDesdeDto(dto);

            var contrasenaTemp = EmailTemplateHelper.GenerarContrasenaTemporal();
            var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemp);

            return await CrearUsuarioAsync(repo, emailService, usuario, contrasenaTemp, hash, isDev)
                .ConfigureAwait(false);
        });
    }

    private static readonly Regex NombreRegex =
        new(@"^[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+$",
            RegexOptions.Compiled, TimeSpan.FromMilliseconds(100));

    private static readonly Regex CorreoUcrRegex =
        new(@"^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$",
            RegexOptions.Compiled, TimeSpan.FromMilliseconds(100));

    private static IResult? ValidarCrearUsuario(CrearUsuarioDto dto)
    {
        if (dto.Rol is not (0 or 1))
            return Results.BadRequest(new { mensaje = "Rol inválido. Use 0 (Funcionario) o 1 (Administrador)." });

        if (string.IsNullOrWhiteSpace(dto.CorreoInstitucional))
            return Results.BadRequest(new { mensaje = "El correo institucional es obligatorio." });

        if (!CorreoUcrRegex.IsMatch(dto.CorreoInstitucional.Trim()))
            return Results.BadRequest(new { mensaje = "El correo debe ser válido. Formato: nombre.apellido@ucr.ac.cr (solo letras antes de @)." });

        if (string.IsNullOrWhiteSpace(dto.PrimerNombre))
            return Results.BadRequest(new { mensaje = "El primer nombre es obligatorio." });

        if (!NombreRegex.IsMatch(dto.PrimerNombre.Trim()))
            return Results.BadRequest(new { mensaje = "El primer nombre solo debe contener letras." });

        if (dto.SegundoNombre is not null && !string.IsNullOrWhiteSpace(dto.SegundoNombre)
            && !NombreRegex.IsMatch(dto.SegundoNombre.Trim()))
            return Results.BadRequest(new { mensaje = "El segundo nombre solo debe contener letras." });

        if (string.IsNullOrWhiteSpace(dto.PrimerApellido))
            return Results.BadRequest(new { mensaje = "El primer apellido es obligatorio." });

        if (!NombreRegex.IsMatch(dto.PrimerApellido.Trim()))
            return Results.BadRequest(new { mensaje = "El primer apellido solo debe contener letras." });

        if (string.IsNullOrWhiteSpace(dto.SegundoApellido))
            return Results.BadRequest(new { mensaje = "El segundo apellido es obligatorio." });

        if (!NombreRegex.IsMatch(dto.SegundoApellido.Trim()))
            return Results.BadRequest(new { mensaje = "El segundo apellido solo debe contener letras." });

        return null;
    }

    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los correos y nombres se normalizan a minúsculas por requisito de negocio.")]
    private static Backend.Models.Usuario CrearUsuarioDesdeDto(CrearUsuarioDto dto)
    {
        // Función auxiliar para capitalizar (primera letra mayúscula, resto minúscula)
        static string Capitalizar(string? texto) =>
            string.IsNullOrWhiteSpace(texto) ? texto?.Trim() ?? "" :
            char.ToUpper(texto.Trim()[0], CultureInfo.InvariantCulture) + texto.Trim()[1..].ToLower(CultureInfo.InvariantCulture);

        return new Backend.Models.Usuario
        {
            CorreoInstitucional = dto.CorreoInstitucional.Trim().ToLowerInvariant(),
            PrimerNombre = Capitalizar(dto.PrimerNombre),
            SegundoNombre = string.IsNullOrWhiteSpace(dto.SegundoNombre) ? null : Capitalizar(dto.SegundoNombre),
            PrimerApellido = Capitalizar(dto.PrimerApellido),
            SegundoApellido = Capitalizar(dto.SegundoApellido),
            Rol = dto.Rol,
            Estado = 1,
        };
    }

    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los nombres de entidades organizacionales se normalizan a minúsculas por requisito de negocio.")]
    private static string NormalizarNombre(string nombre) => nombre.Trim().ToLowerInvariant();

    private static async Task<IResult> CrearUsuarioAsync(
        IUsuarioRepository repo,
        IEmailService emailService,
        Backend.Models.Usuario usuario,
        string contrasenaTemp,
        string hash,
        bool isDev)
    {
        try
        {
            await repo.InsertarConContrasenaAsync(usuario, hash).ConfigureAwait(false);

            // Enviar correo con contraseña temporal (en background, sin esperar)
            var asunto = "Bienvenido a Pingponeros - Contraseña Temporal";
            var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
            var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoBienvenida(usuario.PrimerNombre, apellidos, usuario.CorreoInstitucional, contrasenaTemp);
            _ = emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);

            var respuestaMensaje = $"Usuario '{usuario.PrimerNombre} {usuario.PrimerApellido}' creado correctamente.";

            return Results.Created(
                $"/usuarios/{Uri.EscapeDataString(usuario.CorreoInstitucional)}",
                new
                {
                    mensaje = respuestaMensaje,
                    contrasenaTemporal = contrasenaTemp,
                });
        }
        catch (OracleException ex) when (ex.Number == 1)
        {
            return Results.Conflict(new { mensaje = $"El correo '{usuario.CorreoInstitucional}' ya está registrado en el sistema." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void MapUsuariosUpdate(RouteGroupBuilder usuarios)
    {
        // PUT /usuarios/{correo} — Actualiza un usuario existente
        usuarios.MapPut("/{correo}", async (string correo, Backend.Models.Usuario usuario, IUsuarioRepository repo) =>
        {
            try
            {
                var actualizado = await repo.ActualizarAsync(Uri.UnescapeDataString(correo), usuario).ConfigureAwait(false);
                return actualizado
                    ? Results.Ok(usuario)
                    : Results.NotFound(new { mensaje = $"No se encontró el usuario '{correo}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    private static void MapUsuariosDelete(RouteGroupBuilder usuarios)
    {
        // DELETE /usuarios/{correo} — Elimina un usuario
        usuarios.MapDelete("/{correo}", async (string correo, IUsuarioRepository repo) =>
        {
            try
            {
                var eliminado = await repo.EliminarAsync(Uri.UnescapeDataString(correo)).ConfigureAwait(false);
                return eliminado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró el usuario '{correo}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    // ---------------------------------------------------------------- //
    // Rutas de Áreas                                                    //
    // ---------------------------------------------------------------- //
    private static void MapAreaRoutes(WebApplication app, bool isDev)
    {
        var areas = app.MapGroup("/areas");

        MapAreasGetAll(areas);
        MapAreasCreate(areas, isDev);
        MapAreasGetByNombre(areas);
        MapAreasUpdate(areas, isDev);
        MapAreasDelete(areas);
    }

    private static void MapAreasGetAll(RouteGroupBuilder areas)
    {
        // GET /areas — Lista todas las áreas
        areas.MapGet("/", async (IAreaRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodasAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapAreasCreate(RouteGroupBuilder areas, bool isDev)
    {
        // POST /areas — Crea una nueva área
        areas.MapPost("/", async (CrearAreaDto dto, IAreaRepository repo) =>
        {
            var validationResult = ValidarCrearArea(dto);
            if (validationResult is not null)
                return validationResult;

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe un área con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }

            var area = new Backend.Models.Area
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = dto.Estado ?? 1,
            };

            return await InsertarAreaAsync(repo, area, isDev).ConfigureAwait(false);
        });
    }

    private static async Task<IResult> InsertarAreaAsync(IAreaRepository repo, Backend.Models.Area area, bool isDev)
    {
        try
        {
            var id = await repo.InsertarAsync(area).ConfigureAwait(false);
            return Results.Created($"/areas/{id}", new { mensaje = $"Área '{area.Nombre}' creada correctamente." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void MapAreasGetByNombre(RouteGroupBuilder areas)
    {
        // GET /areas/{nombre} — Obtiene un área por nombre
        areas.MapGet("/{nombre}", async (string nombre, IAreaRepository repo) =>
        {
            try
            {
                var area = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return area is null
                    ? Results.NotFound(new { mensaje = $"No se encontró el área '{nombre}'." })
                    : Results.Ok(area);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapAreasUpdate(RouteGroupBuilder areas, bool isDev)
    {
        // PUT /areas/{nombre} — Actualiza un área
        areas.MapPut("/{nombre}", async (string nombre, CrearAreaDto dto, IAreaRepository repo) =>
        {
            var validationResult = ValidarCrearArea(dto);
            if (validationResult is not null)
                return validationResult;

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe un área con el nombre '{dto.Nombre}'.").ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var area = new Backend.Models.Area
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, area),
                $"Área '{area.Nombre}' actualizada correctamente.",
                $"No se encontró el área '{nombre}'.",
                isDev).ConfigureAwait(false);
        });
    }

    private static void MapAreasDelete(RouteGroupBuilder areas)
    {
        // DELETE /areas/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        areas.MapDelete("/{id:int}", async (int id, IAreaRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró el área activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    private static IResult? ValidarCrearArea(CrearAreaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            return Results.BadRequest(new { mensaje = "El nombre del área es obligatorio." });

        if (string.IsNullOrWhiteSpace(dto.Descripcion))
            return Results.BadRequest(new { mensaje = "La descripción es obligatoria." });

        if (dto.Estado is not null && dto.Estado is not (0 or 1))
            return Results.BadRequest(new { mensaje = "El estado debe ser 0 (Inactivo) o 1 (Activo)." });

        return null;
    }

    // ---------------------------------------------------------------- //
    // Helpers de actualización compartidos                              //
    // ---------------------------------------------------------------- //

    /// <summary>
    /// Verifica si ya existe otra entidad con el mismo nombre cuando éste cambia.
    /// Devuelve un IResult de conflicto o error, o null si no hay problema.
    /// </summary>
    private static async Task<IResult?> VerificarConflictoNombreAsync(
        Func<Task<bool>> existeAsync,
        string nombreNuevo,
        string nombreDescodificado,
        string mensajeConflicto)
    {
        if (nombreNuevo.Trim().Equals(nombreDescodificado, StringComparison.OrdinalIgnoreCase))
            return null;

        try
        {
            var existe = await existeAsync().ConfigureAwait(false);
            if (existe)
                return Results.Conflict(new { mensaje = mensajeConflicto });
        }
        catch (OracleException ex)
        {
            return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
        }

        return null;
    }

    /// <summary>
    /// Ejecuta la actualización delegada y devuelve Ok, NotFound o 500 según el resultado.
    /// </summary>
    private static async Task<IResult> EjecutarActualizacionAsync(
        Func<Task<bool>> actualizarAsync,
        string mensajeOk,
        string mensajeNoEncontrado,
        bool isDev)
    {
        try
        {
            var actualizado = await actualizarAsync().ConfigureAwait(false);
            return actualizado
                ? Results.Ok(new { mensaje = mensajeOk })
                : Results.NotFound(new { mensaje = mensajeNoEncontrado });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    // ---------------------------------------------------------------- //
    // Helpers de validación compartidos                                 //
    // ---------------------------------------------------------------- //
    private static IResult? ValidarEntidadBase(string? nombre, string? descripcion, int? estado, string articulo, string entidad)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return Results.BadRequest(new { mensaje = $"El nombre {articulo} {entidad} es obligatorio." });

        if (string.IsNullOrWhiteSpace(descripcion))
            return Results.BadRequest(new { mensaje = "La descripción es obligatoria." });

        if (estado is not null && estado is not (0 or 1))
            return Results.BadRequest(new { mensaje = "El estado debe ser 0 (Inactivo) o 1 (Activo)." });

        return null;
    }

    // ---------------------------------------------------------------- //
    // Rutas de Departamentos                                            //
    // ---------------------------------------------------------------- //
    private static void MapDepartamentoRoutes(WebApplication app, bool isDev)
    {
        var departamentos = app.MapGroup("/departamentos");

        MapDepartamentosGetAll(departamentos);
        MapDepartamentosCreate(departamentos, isDev);
        MapDepartamentosGetByNombre(departamentos);
        MapDepartamentosUpdate(departamentos, isDev);
        MapDepartamentosDelete(departamentos);
    }

    private static void MapDepartamentosGetAll(RouteGroupBuilder departamentos)
    {
        // GET /departamentos — Lista todos los departamentos
        departamentos.MapGet("/", async (IDepartamentoRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodosAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapDepartamentosCreate(RouteGroupBuilder departamentos, bool isDev)
    {
        // POST /departamentos — Crea un nuevo departamento
        departamentos.MapPost("/", async (CrearDepartamentoDto dto, IDepartamentoRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "del", "departamento");
            if (validationResult is not null)
                return validationResult;

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe un departamento con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }

            var departamento = new Backend.Models.Departamento
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            return await InsertarDepartamentoAsync(repo, departamento, isDev).ConfigureAwait(false);
        });
    }

    private static async Task<IResult> InsertarDepartamentoAsync(IDepartamentoRepository repo, Backend.Models.Departamento departamento, bool isDev)
    {
        try
        {
            var id = await repo.InsertarAsync(departamento).ConfigureAwait(false);
            return Results.Created($"/departamentos/{id}", new { mensaje = $"Departamento '{departamento.Nombre}' creado correctamente." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void MapDepartamentosGetByNombre(RouteGroupBuilder departamentos)
    {
        // GET /departamentos/{nombre} — Obtiene un departamento por nombre
        departamentos.MapGet("/{nombre}", async (string nombre, IDepartamentoRepository repo) =>
        {
            try
            {
                var departamento = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return departamento is null
                    ? Results.NotFound(new { mensaje = $"No se encontró el departamento '{nombre}'." })
                    : Results.Ok(departamento);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapDepartamentosUpdate(RouteGroupBuilder departamentos, bool isDev)
    {
        // PUT /departamentos/{nombre} — Actualiza un departamento
        departamentos.MapPut("/{nombre}", async (string nombre, CrearDepartamentoDto dto, IDepartamentoRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "del", "departamento");
            if (validationResult is not null)
                return validationResult;

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe un departamento con el nombre '{dto.Nombre}'.").ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var departamento = new Backend.Models.Departamento
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, departamento),
                $"Departamento '{departamento.Nombre}' actualizado correctamente.",
                $"No se encontró el departamento '{nombre}'.",
                isDev).ConfigureAwait(false);
        });
    }

    private static void MapDepartamentosDelete(RouteGroupBuilder departamentos)
    {
        // DELETE /departamentos/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        departamentos.MapDelete("/{id:int}", async (int id, IDepartamentoRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró el departamento activo con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    // ---------------------------------------------------------------- //
    // Rutas de Secciones                                                //
    // ---------------------------------------------------------------- //
    private static void MapSeccionRoutes(WebApplication app, bool isDev)
    {
        var secciones = app.MapGroup("/secciones");

        MapSeccionesGetAll(secciones);
        MapSeccionesCreate(secciones, isDev);
        MapSeccionesGetByNombre(secciones);
        MapSeccionesUpdate(secciones, isDev);
        MapSeccionesDelete(secciones);
    }

    private static void MapSeccionesGetAll(RouteGroupBuilder secciones)
    {
        // GET /secciones — Lista todas las secciones
        secciones.MapGet("/", async (ISeccionRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodasAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapSeccionesCreate(RouteGroupBuilder secciones, bool isDev)
    {
        // POST /secciones — Crea una nueva sección
        secciones.MapPost("/", async (CrearSeccionDto dto, ISeccionRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "de la", "sección");
            if (validationResult is not null)
                return validationResult;

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe una sección con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }

            var seccion = new Backend.Models.Seccion
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            return await InsertarSeccionAsync(repo, seccion, isDev).ConfigureAwait(false);
        });
    }

    private static async Task<IResult> InsertarSeccionAsync(ISeccionRepository repo, Backend.Models.Seccion seccion, bool isDev)
    {
        try
        {
            var id = await repo.InsertarAsync(seccion).ConfigureAwait(false);
            return Results.Created($"/secciones/{id}", new { mensaje = $"Sección '{seccion.Nombre}' creada correctamente." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void MapSeccionesGetByNombre(RouteGroupBuilder secciones)
    {
        // GET /secciones/{nombre} — Obtiene una sección por nombre
        secciones.MapGet("/{nombre}", async (string nombre, ISeccionRepository repo) =>
        {
            try
            {
                var seccion = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return seccion is null
                    ? Results.NotFound(new { mensaje = $"No se encontró la sección '{nombre}'." })
                    : Results.Ok(seccion);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapSeccionesUpdate(RouteGroupBuilder secciones, bool isDev)
    {
        // PUT /secciones/{nombre} — Actualiza una sección
        secciones.MapPut("/{nombre}", async (string nombre, CrearSeccionDto dto, ISeccionRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "de la", "sección");
            if (validationResult is not null)
                return validationResult;

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe una sección con el nombre '{dto.Nombre}'.").ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var seccion = new Backend.Models.Seccion
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, seccion),
                $"Sección '{seccion.Nombre}' actualizada correctamente.",
                $"No se encontró la sección '{nombre}'.",
                isDev).ConfigureAwait(false);
        });
    }

    private static void MapSeccionesDelete(RouteGroupBuilder secciones)
    {
        // DELETE /secciones/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        secciones.MapDelete("/{id:int}", async (int id, ISeccionRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró la sección activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    // ---------------------------------------------------------------- //
    // Rutas de Unidades                                                 //
    // ---------------------------------------------------------------- //
    private static void MapUnidadRoutes(WebApplication app, bool isDev)
    {
        var unidades = app.MapGroup("/unidades");

        MapUnidadesGetAll(unidades);
        MapUnidadesCreate(unidades, isDev);
        MapUnidadesGetByNombre(unidades);
        MapUnidadesUpdate(unidades, isDev);
        MapUnidadesDelete(unidades);
    }

    private static void MapUnidadesGetAll(RouteGroupBuilder unidades)
    {
        // GET /unidades — Lista todas las unidades
        unidades.MapGet("/", async (IUnidadRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodasAsync().ConfigureAwait(false);
                return Results.Ok(lista);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapUnidadesCreate(RouteGroupBuilder unidades, bool isDev)
    {
        // POST /unidades — Crea una nueva unidad
        unidades.MapPost("/", async (CrearUnidadDto dto, IUnidadRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "de la", "unidad");
            if (validationResult is not null)
                return validationResult;

            if (dto.IdDepartamento is not null && dto.IdSeccion is not null)
                return Results.BadRequest(new { mensaje = "Una unidad no puede pertenecer a un departamento y a una sección al mismo tiempo." });

            try
            {
                var existe = await repo.ExisteNombreAsync(dto.Nombre).ConfigureAwait(false);
                if (existe)
                    return Results.Conflict(new { mensaje = $"Ya existe una unidad con el nombre '{dto.Nombre}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }

            var unidad = new Backend.Models.Unidad
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                Estado = dto.Estado ?? 1,
            };

            return await InsertarUnidadAsync(repo, unidad, isDev).ConfigureAwait(false);
        });
    }

    private static async Task<IResult> InsertarUnidadAsync(IUnidadRepository repo, Backend.Models.Unidad unidad, bool isDev)
    {
        try
        {
            var id = await repo.InsertarAsync(unidad).ConfigureAwait(false);
            return Results.Created($"/unidades/{id}", new { mensaje = $"Unidad '{unidad.Nombre}' creada correctamente." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void MapUnidadesGetByNombre(RouteGroupBuilder unidades)
    {
        // GET /unidades/{nombre} — Obtiene una unidad por nombre
        unidades.MapGet("/{nombre}", async (string nombre, IUnidadRepository repo) =>
        {
            try
            {
                var unidad = await repo.ObtenerPorNombreAsync(Uri.UnescapeDataString(nombre)).ConfigureAwait(false);
                return unidad is null
                    ? Results.NotFound(new { mensaje = $"No se encontró la unidad '{nombre}'." })
                    : Results.Ok(unidad);
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
    }

    private static void MapUnidadesUpdate(RouteGroupBuilder unidades, bool isDev)
    {
        // PUT /unidades/{nombre} — Actualiza una unidad
        unidades.MapPut("/{nombre}", async (string nombre, CrearUnidadDto dto, IUnidadRepository repo) =>
        {
            var validationResult = ValidarEntidadBase(dto.Nombre, dto.Descripcion, dto.Estado, "de la", "unidad");
            if (validationResult is not null)
                return validationResult;

            if (dto.IdDepartamento is not null && dto.IdSeccion is not null)
                return Results.BadRequest(new { mensaje = "Una unidad no puede pertenecer a un departamento y a una sección al mismo tiempo." });

            var nombreDescodificado = Uri.UnescapeDataString(nombre);

            var conflicto = await VerificarConflictoNombreAsync(
                () => repo.ExisteNombreAsync(dto.Nombre),
                dto.Nombre,
                nombreDescodificado,
                $"Ya existe una unidad con el nombre '{dto.Nombre}'.").ConfigureAwait(false);
            if (conflicto is not null)
                return conflicto;

            var unidad = new Backend.Models.Unidad
            {
                Nombre = NormalizarNombre(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                IdArea = dto.IdArea,
                IdDepartamento = dto.IdDepartamento,
                IdSeccion = dto.IdSeccion,
                Estado = dto.Estado ?? 1,
            };

            return await EjecutarActualizacionAsync(
                () => repo.ActualizarAsync(nombreDescodificado, unidad),
                $"Unidad '{unidad.Nombre}' actualizada correctamente.",
                $"No se encontró la unidad '{nombre}'.",
                isDev).ConfigureAwait(false);
        });
    }

    private static void MapUnidadesDelete(RouteGroupBuilder unidades)
    {
        // DELETE /unidades/{id} — Borrado lógico: pasa ESTADO de 1 a 0
        unidades.MapDelete("/{id:int}", async (int id, IUnidadRepository repo) =>
        {
            try
            {
                var desactivado = await repo.DesactivarAsync(id).ConfigureAwait(false);
                return desactivado
                    ? Results.NoContent()
                    : Results.NotFound(new { mensaje = $"No se encontró la unidad activa con ID '{id}'." });
            }
            catch (OracleException ex)
            {
                return Results.Json(new { mensaje = TraducirErrorOracle(ex.Number) }, statusCode: 500);
            }
        });
    }

    // ---------------------------------------------------------------- //
    // Auth                                                              //
    // ---------------------------------------------------------------- //
    private static void MapAuth(WebApplication app, bool isDev)
    {
        app.MapPost("/auth/login", async (LoginDto dto, IUsuarioRepository repo) =>
            await HandleAuthLogin(dto, repo, isDev).ConfigureAwait(false));

        app.MapPost("/auth/recuperar-contrasena", async (RecuperarContraseñaDto dto, IUsuarioRepository repo, IEmailService emailService) =>
            await HandleRecuperarContrasena(dto.CorreoInstitucional, repo, emailService, isDev).ConfigureAwait(false));

        app.MapPost("/auth/cambiar-contrasena", async (CambiarContraseñaDto dto, IUsuarioRepository repo, IEmailService emailService) =>
            await HandleCambiarContrasena(dto, repo, emailService, isDev).ConfigureAwait(false));
    }

    private static async Task<IResult> HandleAuthLogin(LoginDto dto, IUsuarioRepository repo, bool isDev)
    {
        if (string.IsNullOrWhiteSpace(dto.CorreoInstitucional) ||
            string.IsNullOrWhiteSpace(dto.Contrasena))
            return Results.BadRequest(new { mensaje = "Correo y contraseña son obligatorios." });

        try
        {
            var hash = await repo.ObtenerHashMasRecienteAsync(dto.CorreoInstitucional.Trim())
                                 .ConfigureAwait(false);

            if (hash is null || !BCrypt.Net.BCrypt.Verify(dto.Contrasena, hash))
                return Results.Json(new { mensaje = "Correo o contraseña incorrectos." }, statusCode: 401);

            var usuario = await repo.ObtenerPorCorreoAsync(dto.CorreoInstitucional.Trim())
                                    .ConfigureAwait(false);

            return Results.Ok(new
            {
                correoInstitucional = usuario!.CorreoInstitucional,
                primerNombre = usuario.PrimerNombre,
                segundoNombre = usuario.SegundoNombre,
                primerApellido = usuario.PrimerApellido,
                segundoApellido = usuario.SegundoApellido,
                rol = usuario.Rol,
                estado = usuario.Estado,
            });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static async Task<IResult> HandleRecuperarContrasena(
        string correoInstitucional,
        IUsuarioRepository repo,
        IEmailService emailService,
        bool isDev)
    {
        if (string.IsNullOrWhiteSpace(correoInstitucional))
            return Results.BadRequest(new { mensaje = "El correo institucional es obligatorio." });

        try
        {
            var usuario = await repo.ObtenerPorCorreoAsync(correoInstitucional.Trim())
                                    .ConfigureAwait(false);

            if (usuario is null)
                // No revelar si el correo existe o no por seguridad
                return Results.Ok(new { mensaje = "Si el correo existe en nuestro sistema, recibirás una nueva contraseña temporal." });

            var contrasenaTemporal = EmailTemplateHelper.GenerarContrasenaTemporal();
            var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemporal);

            await repo.InsertarContrase\u00f1aAsync(usuario.CorreoInstitucional, hash).ConfigureAwait(false);

            // Enviar correo con contraseña temporal (en background, sin esperar)
            EnviarCorreoRecuperacion(emailService, usuario, contrasenaTemporal);

            return Results.Ok(new { mensaje = "Si el correo existe en nuestro sistema, recibirás una nueva contraseña temporal." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void EnviarCorreoRecuperacion(IEmailService emailService, Backend.Models.Usuario usuario, string contrasenaTemporal)
    {
        var asunto = "Recuperación de Contraseña - Pingponeros";
        var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
        var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoRecuperacion(usuario.PrimerNombre, apellidos, contrasenaTemporal);
        _ = emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);
    }

    private static string? ValidarComplejidadContrasena(string contrasena)
    {
        var requisitos = new List<string>();

        if (contrasena.Length < 12)
            requisitos.Add("mínimo 12 caracteres");

        if (!contrasena.Any(char.IsUpper))
            requisitos.Add("una mayúscula");

        if (!contrasena.Any(char.IsLower))
            requisitos.Add("una minúscula");

        if (!contrasena.Any(char.IsDigit))
            requisitos.Add("un número");

        if (!contrasena.Any(c => "!@#$%&*".Contains(c, StringComparison.Ordinal)))
            requisitos.Add("un carácter especial (!@#$%&*)");

        return requisitos.Count > 0 ? $"La contraseña debe contener: {string.Join(", ", requisitos)}" : null;
    }

    private static IResult? ValidarComplejidadContraseñaResult(string contrasena)
    {
        var error = ValidarComplejidadContrasena(contrasena);
        return error is not null ? Results.BadRequest(new { mensaje = error }) : null;
    }

    private static async Task<IResult> HandleCambiarContrasena(
        CambiarContraseñaDto dto,
        IUsuarioRepository repo,
        IEmailService emailService,
        bool isDev)
    {
        if (string.IsNullOrWhiteSpace(dto.CorreoInstitucional))
            return Results.BadRequest(new { mensaje = "El correo institucional es obligatorio." });

        if (string.IsNullOrWhiteSpace(dto.ContraseñaActual))
            return Results.BadRequest(new { mensaje = "La contraseña actual es obligatoria." });

        if (string.IsNullOrWhiteSpace(dto.ContraseñaNueva))
            return Results.BadRequest(new { mensaje = "La nueva contraseña es obligatoria." });

        if (dto.ContraseñaNueva.Equals(dto.ContraseñaActual, StringComparison.Ordinal))
            return Results.BadRequest(new { mensaje = "La nueva contraseña debe ser diferente a la actual." });

        var validacionContrasena = ValidarComplejidadContraseñaResult(dto.ContraseñaNueva);
        if (validacionContrasena is not null)
            return validacionContrasena;

        try
        {
            var usuario = await repo.ObtenerPorCorreoAsync(dto.CorreoInstitucional.Trim())
                                    .ConfigureAwait(false);

            if (usuario is null)
                return Results.NotFound(new { mensaje = "El usuario no fue encontrado." });

            var hashActual = await repo.ObtenerHashMasRecienteAsync(dto.CorreoInstitucional.Trim())
                                       .ConfigureAwait(false);

            if (hashActual is null || !BCrypt.Net.BCrypt.Verify(dto.ContraseñaActual, hashActual))
                return Results.Json(new { mensaje = "La contraseña actual es incorrecta." }, statusCode: 401);

            var hashNueva = BCrypt.Net.BCrypt.HashPassword(dto.ContraseñaNueva);
            await repo.CambiarContraseñaAsync(usuario.CorreoInstitucional, hashNueva).ConfigureAwait(false);

            // Enviar correo de confirmación (sin contraseña)
            EnviarCorreoCambioContrasena(emailService, usuario);

            return Results.Ok(new { mensaje = "La contraseña ha sido cambiada exitosamente." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
    }

    private static void EnviarCorreoCambioContrasena(IEmailService emailService, Backend.Models.Usuario usuario)
    {
        var asunto = "Contraseña Actualizada - Pingponeros";
        var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
        var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoCambioContrasena(usuario.PrimerNombre, apellidos);
        _ = emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);
    }

    private static string TraducirErrorOracle(int numero) => numero switch
    {
        1 => "El registro ya existe en el sistema.",
        2289 => "Error de configuración interna: objeto de base de datos no encontrado.",
        2291 => "Operación rechazada: referencia a un registro que no existe.",
        2292 => "No se puede eliminar: el registro tiene datos relacionados.",
        1400 => "Hay campos obligatorios sin valor.",
        1438 => "El valor ingresado es demasiado grande para el campo.",
        12541 => "No se pudo conectar a la base de datos. Intente más tarde.",
        12170 => "La conexión a la base de datos expiró. Intente más tarde.",
        1017 => "Error de autenticación con la base de datos.",
        _ => "No se pudo completar la operación. Intente nuevamente.",
    };


}


