using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

/// <summary>
/// Generates signed JWTs for authenticated users.
/// The signing key, issuer, and expiration time are read from configuration
/// (appsettings.json / appsettings.Development.json / environment variables),
/// never hardcoded in the code.
/// </summary>
internal class JwtService : IJwtService
{
    private readonly string _clave;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _minutosExpiracion;

    public JwtService(IConfiguration configuration)
    {
        // Jwt:Key must ALWAYS come from configuration/environment variable, never in the code.
        _clave = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "Falta configurar 'Jwt:Key'. Defínela en appsettings.Development.json " +
                "o como variable de entorno Jwt__Key en producción.");

        _issuer = configuration["Jwt:Issuer"] ?? "PingponerosApi";
        _audience = configuration["Jwt:Audience"] ?? "PingponerosApp";
        _minutosExpiracion = int.TryParse(configuration["Jwt:MinutosExpiracion"], out var minutos)
            ? minutos
            : 60;
    }

    /// <summary>
    /// Generates a signed JWT with the basic claims of the authenticated user.
    /// </summary>
    public string GenerarToken(
        string correoInstitucional,
        string primerNombre,
        string? segundoNombre,
        string primerApellido,
        string segundoApellido,
        int rol)
    {
        var claves = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_clave));
        var credenciales = new SigningCredentials(claves, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, correoInstitucional),
            new("correoInstitucional", correoInstitucional),
            new("rol", rol.ToString(CultureInfo.InvariantCulture)),
            new("primerNombre", primerNombre),
            new("primerApellido", primerApellido),
            new("segundoApellido", segundoApellido),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        if (!string.IsNullOrWhiteSpace(segundoNombre))
            claims.Add(new Claim("segundoNombre", segundoNombre));

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_minutosExpiracion),
            signingCredentials: credenciales
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
