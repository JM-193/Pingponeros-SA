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

        // Oracle wallet
        var walletPath = Path.GetFullPath(
            Path.Combine(builder.Environment.ContentRootPath,
                builder.Configuration["Oracle:WalletPath"] ?? "wallet"));

        OracleConfiguration.TnsAdmin = walletPath;
        OracleConfiguration.WalletLocation = walletPath;

        // Servicios
        builder.Services.AddScoped(_ =>
            new OracleConnection(builder.Configuration.GetConnectionString("OracleDB")));
        builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        builder.Services.AddOpenApi();
        builder.Services.AddCors(options =>
            options.AddPolicy("FrontendOrigin", policy =>
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyMethod()
                      .AllowAnyHeader()));

        var app = builder.Build();
        var isDev = app.Environment.IsDevelopment();

        app.MapOpenApi();
        app.MapScalarApiReference();
        app.UseCors("FrontendOrigin");

        // ---------------------------------------------------------------- //
        // Rutas de Usuarios                                                 //
        // ---------------------------------------------------------------- //
        var usuarios = app.MapGroup("/usuarios");

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

        // POST /usuarios — Crea un nuevo usuario con contraseña temporal
        usuarios.MapPost("/", async (CrearUsuarioDto dto, IUsuarioRepository repo) =>
        {
            if (dto.Rol is not (0 or 1))
                return Results.BadRequest(new { mensaje = "Rol inválido. Use 0 (Funcionario) o 1 (Administrador)." });

            if (string.IsNullOrWhiteSpace(dto.CorreoInstitucional))
                return Results.BadRequest(new { mensaje = "El correo institucional es obligatorio." });

            if (string.IsNullOrWhiteSpace(dto.PrimerNombre))
                return Results.BadRequest(new { mensaje = "El primer nombre es obligatorio." });

            if (string.IsNullOrWhiteSpace(dto.PrimerApellido))
                return Results.BadRequest(new { mensaje = "El primer apellido es obligatorio." });

            var usuario = new Backend.Models.Usuario
            {
                CorreoInstitucional = dto.CorreoInstitucional.Trim(),
                PrimerNombre        = dto.PrimerNombre.Trim(),
                SegundoNombre       = string.IsNullOrWhiteSpace(dto.SegundoNombre) ? null : dto.SegundoNombre.Trim(),
                PrimerApellido      = dto.PrimerApellido.Trim(),
                SegundoApellido     = string.IsNullOrWhiteSpace(dto.SegundoApellido) ? null : dto.SegundoApellido.Trim(),
                Rol                 = dto.Rol,
                Estado              = 1,
            };

            var contrasenaTemp = GenerarContrasenaTemporal();
            var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemp);

            try
            {
                await repo.InsertarConContrasenaAsync(usuario, hash).ConfigureAwait(false);
                return Results.Created(
                    $"/usuarios/{Uri.EscapeDataString(usuario.CorreoInstitucional)}",
                    new
                    {
                        mensaje           = $"Usuario '{usuario.PrimerNombre} {usuario.PrimerApellido}' creado correctamente.",
                        contrasenaTemporal = contrasenaTemp,
                    });
            }
            catch (OracleException ex) when (ex.Number == 1)
            {
                return Results.Conflict(new { mensaje = $"El correo '{dto.CorreoInstitucional}' ya está registrado en el sistema." });
            }
            catch (OracleException ex)
            {
                var msg = isDev
                    ? $"[ORA-{ex.Number}] {ex.Message.Split('\n')[0]}"
                    : TraducirErrorOracle(ex.Number);
                return Results.Json(new { mensaje = msg }, statusCode: 500);
            }
        });

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

        app.Run();
    }

    private static string TraducirErrorOracle(int numero) => numero switch
    {
        1     => "El registro ya existe en el sistema.",
        2289  => "Error de configuración interna: objeto de base de datos no encontrado.",
        2291  => "Operación rechazada: referencia a un registro que no existe.",
        2292  => "No se puede eliminar: el registro tiene datos relacionados.",
        1400  => "Hay campos obligatorios sin valor.",
        1438  => "El valor ingresado es demasiado grande para el campo.",
        12541 => "No se pudo conectar a la base de datos. Intente más tarde.",
        12170 => "La conexión a la base de datos expiró. Intente más tarde.",
        1017  => "Error de autenticación con la base de datos.",
        _     => "No se pudo completar la operación. Intente nuevamente.",
    };

    private static string GenerarContrasenaTemporal()
    {
        const string upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lower   = "abcdefghijklmnopqrstuvwxyz";
        const string digits  = "0123456789";
        const string special = "!@#$%&*";
        const string all     = upper + lower + digits + special;

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

