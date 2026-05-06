using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using DotNetEnv;
using Oracle.ManagedDataAccess.Client;
using Scalar.AspNetCore;
using Backend.DTOs;
using Backend.Repositories;

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
        usuarios.MapPost("/", async (CrearUsuarioDto dto, IUsuarioRepository repo) =>
        {
            var validationResult = ValidarCrearUsuario(dto);
            if (validationResult is not null)
                return validationResult;

            var usuario = CrearUsuarioDesdeDto(dto);

            var contrasenaTemp = GenerarContrasenaTemporal();
            var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemp);

            return await CrearUsuarioAsync(repo, usuario, contrasenaTemp, hash, isDev)
                .ConfigureAwait(false);
        });
    }

    private static IResult? ValidarCrearUsuario(CrearUsuarioDto dto)
    {
        if (dto.Rol is not (0 or 1))
            return Results.BadRequest(new { mensaje = "Rol inválido. Use 0 (Funcionario) o 1 (Administrador)." });

        if (string.IsNullOrWhiteSpace(dto.CorreoInstitucional))
            return Results.BadRequest(new { mensaje = "El correo institucional es obligatorio." });

        if (string.IsNullOrWhiteSpace(dto.PrimerNombre))
            return Results.BadRequest(new { mensaje = "El primer nombre es obligatorio." });

        if (string.IsNullOrWhiteSpace(dto.PrimerApellido))
            return Results.BadRequest(new { mensaje = "El primer apellido es obligatorio." });

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
            SegundoApellido = string.IsNullOrWhiteSpace(dto.SegundoApellido) ? null : Capitalizar(dto.SegundoApellido),
            Rol = dto.Rol,
            Estado = 1,
        };
    }

    [SuppressMessage("Globalization", "CA1308:NormalizeStringsToUppercase",
        Justification = "Los nombres de área se normalizan a minúsculas por requisito de negocio.")]
    private static string NormalizarNombreArea(string nombre) => nombre.Trim().ToLowerInvariant();

    private static async Task<IResult> CrearUsuarioAsync(
        IUsuarioRepository repo,
        Backend.Models.Usuario usuario,
        string contrasenaTemp,
        string hash,
        bool isDev)
    {
        try
        {
            await repo.InsertarConContrasenaAsync(usuario, hash).ConfigureAwait(false);
            return Results.Created(
                $"/usuarios/{Uri.EscapeDataString(usuario.CorreoInstitucional)}",
                new
                {
                    mensaje = $"Usuario '{usuario.PrimerNombre} {usuario.PrimerApellido}' creado correctamente.",
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
                Nombre = NormalizarNombreArea(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = 1,
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

            if (!dto.Nombre.Trim().Equals(nombreDescodificado, StringComparison.OrdinalIgnoreCase))
            {
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
            }

            var area = new Backend.Models.Area
            {
                Nombre = NormalizarNombreArea(dto.Nombre),
                Descripcion = dto.Descripcion.Trim(),
                Estado = 1,
            };

            return await ActualizarAreaAsync(repo, nombreDescodificado, nombre, area, isDev).ConfigureAwait(false);
        });
    }

    private static async Task<IResult> ActualizarAreaAsync(
        IAreaRepository repo,
        string nombreDescodificado,
        string nombreOriginal,
        Backend.Models.Area area,
        bool isDev)
    {
        try
        {
            var actualizado = await repo.ActualizarAsync(nombreDescodificado, area).ConfigureAwait(false);
            return actualizado
                ? Results.Ok(new { mensaje = $"Área '{area.Nombre}' actualizada correctamente." })
                : Results.NotFound(new { mensaje = $"No se encontró el área '{nombreOriginal}'." });
        }
        catch (OracleException ex)
        {
            var msg = isDev
                ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                : TraducirErrorOracle(ex.Number);
            return Results.Json(new { mensaje = msg }, statusCode: 500);
        }
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

        return null;
    }

    // ---------------------------------------------------------------- //
    // Auth                                                              //
    // ---------------------------------------------------------------- //
    private static void MapAuth(WebApplication app, bool isDev)
    {
        app.MapPost("/auth/login", async (LoginDto dto, IUsuarioRepository repo) =>
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
        });
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

    private static string GenerarContrasenaTemporal()
    {
        const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lower = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string special = "!@#$%&*";
        const string all = upper + lower + digits + special;

        var chars = new char[12];
        chars[0] = upper[System.Security.Cryptography.RandomNumberGenerator.GetInt32(upper.Length)];
        chars[1] = lower[System.Security.Cryptography.RandomNumberGenerator.GetInt32(lower.Length)];
        chars[2] = digits[System.Security.Cryptography.RandomNumberGenerator.GetInt32(digits.Length)];
        chars[3] = special[System.Security.Cryptography.RandomNumberGenerator.GetInt32(special.Length)];

        for (var i = 4; i < chars.Length; i++)
            chars[i] = all[System.Security.Cryptography.RandomNumberGenerator.GetInt32(all.Length)];

        // Fisher-Yates shuffle usando RNG criptográfico
        for (var i = chars.Length - 1; i > 0; i--)
        {
            var j = System.Security.Cryptography.RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars);
    }
}

