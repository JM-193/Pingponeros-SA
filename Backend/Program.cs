using DotNetEnv;
using Oracle.ManagedDataAccess.Client;
using Scalar.AspNetCore;
using Backend.Repositories;

namespace Backend;

public static class Program
{
    public static void Main(string[] args)
    {
        Env.Load();

        var builder = WebApplication.CreateBuilder(args);

        // Oracle wallet
        var walletPath = Path.GetFullPath(
            Path.Combine(builder.Environment.ContentRootPath,
                builder.Configuration["Oracle:WalletPath"] ?? "wallet"));

        OracleConfiguration.TnsAdmin      = walletPath;
        OracleConfiguration.WalletLocation = walletPath;

        // Servicios
        builder.Services.AddScoped(_ =>
            new OracleConnection(builder.Configuration.GetConnectionString("OracleDB")));
        builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        builder.Services.AddOpenApi();

        var app = builder.Build();

        app.MapOpenApi();
        app.MapScalarApiReference();

        // ---------------------------------------------------------------- //
        // Rutas de Usuarios                                                 //
        // ---------------------------------------------------------------- //
        var usuarios = app.MapGroup("/usuarios");

        // GET /usuarios — Lista todos los usuarios
        usuarios.MapGet("/", async (IUsuarioRepository repo) =>
        {
            try
            {
                var lista = await repo.ObtenerTodosAsync();
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
                var usuario = await repo.ObtenerPorCorreoAsync(Uri.UnescapeDataString(correo));
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
        usuarios.MapPost("/", async (Backend.Models.Usuario usuario, IUsuarioRepository repo) =>
        {
            try
            {
                await repo.InsertarAsync(usuario);
                return Results.Created(
                    $"/usuarios/{Uri.EscapeDataString(usuario.CorreoInstitucional)}",
                    usuario);
            }
            catch (OracleException ex) when (ex.Number == 1)
            {
                return Results.Conflict(new { error = "Ya existe un usuario con ese correo institucional." });
            }
            catch (OracleException ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        // PUT /usuarios/{correo} — Actualiza un usuario existente
        usuarios.MapPut("/{correo}", async (string correo, Backend.Models.Usuario usuario, IUsuarioRepository repo) =>
        {
            try
            {
                var actualizado = await repo.ActualizarAsync(Uri.UnescapeDataString(correo), usuario);
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
                var eliminado = await repo.EliminarAsync(Uri.UnescapeDataString(correo));
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

