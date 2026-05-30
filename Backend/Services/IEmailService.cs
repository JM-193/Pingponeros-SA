// IEmailService.cs
namespace Backend.Services;

/// <summary>
/// Servicio para enviar correos electrónicos.
/// </summary>
internal interface IEmailService
{
    /// <summary>
    /// Envía un correo electrónico de forma asíncrona.
    /// </summary>
    /// <param name="destinatario">Correo electrónico del destinatario.</param>
    /// <param name="asunto">Asunto del correo.</param>
    /// <param name="cuerpo">Cuerpo del correo en HTML.</param>
    /// <returns>True si el envío fue exitoso; False en caso contrario.</returns>
    Task<bool> EnviarAsync(string destinatario, string asunto, string cuerpo);
}
