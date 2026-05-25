// EmailTemplateHelper.cs
namespace Backend.Helpers;

/// <summary>
/// Utilidades para generar plantillas de correo y contraseñas temporales.
/// </summary>
internal static class EmailTemplateHelper
{
    public static string GenerarContrasenaTemporal()
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

    public static string GenerarCuerpoCorreoBienvenida(string nombre, string apellidos, string correo, string contrasena)
    {
        var nombreCompleto = $"{nombre} {apellidos}";
        return $@"<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }}
                .header {{ background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                .credentials {{ background-color: #f0f0f0; padding: 15px; border-left: 4px solid #003366; margin: 20px 0; }}
                .credentials p {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #003366; }}
                .warning {{ color: #d9534f; font-weight: bold; margin-top: 15px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Bienvenido a Pingponeros</h2>
                    <p>Sistema de Gestión De Cargas De Trabajo</p>
                </div>
                <div class='content'>
                    <p>Estimado/a <strong>{nombreCompleto}</strong>,</p>
                    <p>Te damos la bienvenida al sistema Pingponeros. Aquí te 
                    proporcionamos tus credenciales de acceso:</p>
                    
                    <div class='credentials'>
                        <p><span class='label'>Correo:</span> {correo}</p>
                        <p><span class='label'>Contraseña temporal:</span> 
                        <strong style='font-size: 14px;'>{contrasena}</strong></p>
                    </div>
                    
                    <p class='warning'>⚠️ IMPORTANTE: Por tu seguridad, debes 
                    cambiar esta contraseña en tu primer acceso al sistema.</p>
                    
                    <p>Si tienes problemas para acceder o necesitas ayuda, 
                    contacta con el administrador del sistema o soporte.</p>
                    
                    <p>Saludos cordiales,<br>
                    <strong>Vicerrectoría de Administración</strong><br>
                    Universidad de Costa Rica</p>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático. Por favor, no responder a 
                    este mensaje.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    public static string GenerarCuerpoCorreoRecuperacion(string nombre, string apellidos, string contrasena)
    {
        var nombreCompleto = $"{nombre} {apellidos}";
        return $@"<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }}
                .header {{ background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                .credentials {{ background-color: #f0f0f0; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0; }}
                .credentials p {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #003366; }}
                .warning {{ color: #d9534f; font-weight: bold; margin-top: 15px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Recuperación de Contraseña</h2>
                    <p>Pingponeros - Sistema de Gestión De Cargas De Trabajo</p>
                </div>
                <div class='content'>
                    <p>Estimado/a <strong>{nombreCompleto}</strong>,</p>
                    <p>Hemos recibido una solicitud para recuperar tu contraseña. 
                    Aquí te proporcionamos la contraseña temporal:</p>
                    
                    <div class='credentials'>
                        <p><span class='label'>Contraseña temporal:</span> 
                        <strong style='font-size: 14px;'>{contrasena}</strong></p>
                    </div>
                    
                    <p class='warning'>⚠️ IMPORTANTE: Por tu seguridad, debes 
                    cambiar esta contraseña inmediatamente después de acceder al sistema.</p>
                    
                    <p>Si no solicitaste esta recuperación de contraseña, por 
                    favor cambiar la contraseña y notificar al administrador del sistema o soporte que alguien intento acceder a tu cuenta sin autorización e hizo la petición de recuperación.</p>
                    
                    <p>Si tienes problemas o necesitas ayuda, contacta con el 
                    administrador del sistema o soporte.</p>
                    
                    <p>Saludos cordiales,<br>
                    <strong>Vicerrectoría de Administración</strong><br>
                    Universidad de Costa Rica</p>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático. Por favor, no responder a 
                    este mensaje.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}
