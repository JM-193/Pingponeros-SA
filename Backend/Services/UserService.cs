// UserService.cs
using Backend.DTOs;
using Backend.Helpers;
using Backend.Mappers;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Services;

/// <summary>
/// Implementa la orquestación de creación de usuarios. Mantiene el mismo flujo que tenía
/// la ruta original: mapea el DTO a la entidad, genera y hashea una contraseña temporal,
/// la persiste y dispara el correo de bienvenida en segundo plano (sin esperar).
/// </summary>
internal sealed class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IEmailService _emailService;

    public UserService(IUserRepository repo, IEmailService emailService)
    {
        _repo = repo;
        _emailService = emailService;
    }

    public async Task<IResult> CrearAsync(CreateUserDto dto, bool isDev)
    {
        var usuario = dto.ToModel();

        var contrasenaTemp = EmailTemplateHelper.GenerarContrasenaTemporal();
        var hash = BCrypt.Net.BCrypt.HashPassword(contrasenaTemp);

        try
        {
            await _repo.InsertarConContrasenaAsync(usuario, hash).ConfigureAwait(false);

            // Enviar correo con contraseña temporal (en background, sin esperar)
            var asunto = "Bienvenido a Pingponeros - Contraseña Temporal";
            var apellidos = $"{usuario.PrimerApellido} {usuario.SegundoApellido}";
            var cuerpo = EmailTemplateHelper.GenerarCuerpoCorreoBienvenida(usuario.PrimerNombre, apellidos, usuario.CorreoInstitucional, contrasenaTemp);
            _ = _emailService.EnviarAsync(usuario.CorreoInstitucional, asunto, cuerpo);

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
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }
}
