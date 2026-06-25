// AuthService.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Services;

/// <summary>
/// Implementa la lógica de autenticación y gestión de contraseñas. Conserva exactamente
/// el flujo, los códigos de estado y los mensajes que tenían los manejadores de ruta
/// originales; solo se trasladó desde Program.cs para separar transporte de aplicación.
/// </summary>
internal sealed class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository repo, IEmailService emailService, IJwtService jwtService)
    {
        _repo = repo;
        _emailService = emailService;
        _jwtService = jwtService;
    }

    public async Task<IResult> LoginAsync(LoginDto dto, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var correo = TextNormalizer.Correo(dto.CorreoInstitucional);

        try
        {
            var contrasena = await _repo.ObtenerContrasenaMasRecienteAsync(correo)
                                        .ConfigureAwait(false);

            if (contrasena is null || !BCrypt.Net.BCrypt.Verify(dto.Contrasena, contrasena.Hash))
                return Results.Json(new { mensaje = "Correo o contraseña incorrectos." }, statusCode: 401);

            var usuario = await _repo.ObtenerPorCorreoAsync(correo).ConfigureAwait(false);

            if (usuario is null)
                return Results.Json(new { mensaje = "Correo o contraseña incorrectos." }, statusCode: 401);

            if (usuario.Estado != 1)
                return Results.Json(new { mensaje = "La cuenta del usuario se encuentra inactiva. Contacte al equipo de soporte." }, statusCode: 403);

            // If the password is temporary, the frontend needs to know this to
            // force the change, so that data goes outside the token, next to
            // the token, not inside the claims.
            var token = _jwtService.GenerarToken(
                usuario.CorreoInstitucional,
                usuario.PrimerNombre,
                usuario.SegundoNombre,
                usuario.PrimerApellido,
                usuario.SegundoApellido,
                usuario.Rol);

            return Results.Ok(new
            {
                token,
                estado = usuario.Estado,
                contrasenaTemporal = contrasena.EsTemporal,
                fechaExpiracionContrasena = contrasena.FechaExpiracion,
            });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> RecuperarContrasenaAsync(ResetPasswordDto dto, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        var correo = TextNormalizer.Correo(dto.CorreoInstitucional);

        try
        {
            var usuario = await _repo.ObtenerPorCorreoAsync(correo).ConfigureAwait(false);

            if (usuario is not null)
            {
                if (usuario.Estado != 1)
                    return Results.Json(new { mensaje = "La cuenta del usuario se encuentra inactiva. Contacte al equipo de soporte." }, statusCode: 403);

                var contrasenaTemporal = EmailTemplateHelper.GenerarContrasenaTemporal();
                var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemporal);

                await _repo.InsertarContraseñaAsync(usuario.CorreoInstitucional, hash).ConfigureAwait(false);

                // Enviar correo con contraseña temporal (en background, sin esperar)
                EnviarCorreoRecuperacion(usuario, contrasenaTemporal);
            }

            // No revelar si el correo existe o no por seguridad
            return Results.Ok(new { mensaje = "Si el correo existe en nuestro sistema, recibirás una nueva contraseña temporal." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> CambiarContrasenaAsync(ChangePasswordDto dto, bool isDev)
    {
        if (dto.Validar() is { } error)
            return Results.BadRequest(new { mensaje = error });

        if (PasswordPolicy.Validar(dto.ContrasenaNueva) is { } errorComplejidad)
            return Results.BadRequest(new { mensaje = errorComplejidad });

        var correo = TextNormalizer.Correo(dto.CorreoInstitucional);

        try
        {
            var usuario = await _repo.ObtenerPorCorreoAsync(correo).ConfigureAwait(false);

            if (usuario is null)
                return Results.NotFound(new { mensaje = "El usuario no fue encontrado." });

            var contrasenaActual = await _repo.ObtenerContrasenaMasRecienteAsync(correo)
                                              .ConfigureAwait(false);

            if (contrasenaActual is null || !BCrypt.Net.BCrypt.Verify(dto.ContrasenaActual, contrasenaActual.Hash))
                return Results.Json(new { mensaje = "La contraseña actual es incorrecta." }, statusCode: 401);

            if (usuario.Estado != 1)
                return Results.Json(new { mensaje = "La cuenta del usuario se encuentra inactiva. Contacte al equipo de soporte." }, statusCode: 403);

            var hashNueva = BCrypt.Net.BCrypt.HashPassword(dto.ContrasenaNueva);
            await _repo.ChangePasswordAsync(usuario.CorreoInstitucional, hashNueva).ConfigureAwait(false);

            // Enviar correo de confirmación (sin contraseña)
            EnviarCorreoCambioContrasena(usuario);

            return Results.Ok(new { mensaje = "La contraseña ha sido cambiada exitosamente." });
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    private void EnviarCorreoRecuperacion(User usuario, string contrasenaTemporal)
    {
        var asunto = "Recuperación de Contraseña - Pingponeros";
        var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
        var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoRecuperacion(usuario.PrimerNombre, apellidos, contrasenaTemporal);
        _ = _emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);
    }

    private void EnviarCorreoCambioContrasena(User usuario)
    {
        var asunto = "Contraseña Actualizada - Pingponeros";
        var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
        var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoCambioContrasena(usuario.PrimerNombre, apellidos);
        _ = _emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);
    }
}
