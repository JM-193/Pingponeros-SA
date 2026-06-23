// AuthEndpoints.cs
using Backend.DTOs;
using Backend.Services;

namespace Backend.Endpoints;

internal static class AuthEndpoints
{
    // ---------------------------------------------------------------- //
    // Auth                                                              //
    // ---------------------------------------------------------------- //
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app, bool isDev)
    {
        app.MapPost("/auth/login", async (LoginDto dto, IAuthService authService) =>
            await authService.LoginAsync(dto, isDev).ConfigureAwait(false));

        app.MapPost("/auth/recuperar-contrasena", async (ResetPasswordDto dto, IAuthService authService) =>
            await authService.RecuperarContrasenaAsync(dto, isDev).ConfigureAwait(false));

        app.MapPost("/auth/cambiar-contrasena", async (ChangePasswordDto dto, IAuthService authService) =>
            await authService.CambiarContrasenaAsync(dto, isDev).ConfigureAwait(false));
    }
}
