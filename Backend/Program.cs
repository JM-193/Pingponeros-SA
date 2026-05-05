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

        // POST /usuarios — Crea un nuevo usuario
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
                Rol                 = dto.Rol,   // 0 = Funcionario, 1 = Administrador (NUMBER en Oracle)
                Estado              = 1,
            };

            try
            {
                await repo.InsertarAsync(usuario).ConfigureAwait(false);
                return Results.Created(
                    $"/usuarios/{Uri.EscapeDataString(usuario.CorreoInstitucional)}",
                    new { mensaje = $"Usuario '{usuario.PrimerNombre} {usuario.PrimerApellido}' creado correctamente." });
            }
            catch (OracleException ex) when (ex.Number == 1)
            {
                return Results.Conflict(new { mensaje = $"El correo '{dto.CorreoInstitucional}' ya está registrado en el sistema." });
            }
            catch (OracleException ex)
            {
                var detalle = isDev
                    ? $"[ORA-{ex.Number}] {ex.Message}"
                    : "No se pudo completar la operación. Verifique los datos e intente nuevamente.";
                return Results.Problem(
                    title: "Error de base de datos",
                    detail: detalle,
                    statusCode: 500);
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
                    : Results.NotFound(new { error = $"No se encontró el usuario '{correo}'." });
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
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
                    : Results.NotFound(new { error = $"No se encontró el usuario '{correo}'." });
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        app.Run();
    }
}

