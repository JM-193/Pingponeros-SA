// ProgramHelpersTests.cs
using System.Reflection;
using Xunit;

namespace Backend.Tests;

public sealed class ProgramHelpersTests
{
    [Fact]
    public void TraducirErrorOracle_RetornaMensajesParaCodigosConocidos()
    {
        var resultados = new[]
        {
            TraducirErrorOracle(1),
            TraducirErrorOracle(2289),
            TraducirErrorOracle(2291),
            TraducirErrorOracle(2292),
            TraducirErrorOracle(1400),
            TraducirErrorOracle(1438),
            TraducirErrorOracle(12541),
            TraducirErrorOracle(12170),
            TraducirErrorOracle(1017),
        };

        foreach (var resultado in resultados)
            Assert.False(string.IsNullOrWhiteSpace(resultado));
    }

    [Fact]
    public void TraducirErrorOracle_RetornaMensajeGenericoParaCodigoDesconocido()
    {
        var resultado = TraducirErrorOracle(9999);

        Assert.False(string.IsNullOrWhiteSpace(resultado));
    }

    [Fact]
    public void GenerarContrasenaTemporal_CumpleConLongitudYCategorias()
    {
        var password = GenerarContrasenaTemporal();

        Assert.Equal(12, password.Length);
        Assert.Contains(password, char.IsUpper);
        Assert.Contains(password, char.IsLower);
        Assert.Contains(password, char.IsDigit);
        Assert.Contains(password, ch => "!@#$%&*".Contains(ch));
    }

    private static string TraducirErrorOracle(int numero)
    {
        var method = typeof(Backend.Program)
            .GetMethod("TraducirErrorOracle", BindingFlags.NonPublic | BindingFlags.Static);
        return (string)method!.Invoke(null, new object[] { numero })!;
    }

    private static string GenerarContrasenaTemporal()
    {
        var method = typeof(Backend.Program)
            .GetMethod("GenerarContrasenaTemporal", BindingFlags.NonPublic | BindingFlags.Static);
        return (string)method!.Invoke(null, Array.Empty<object>())!;
    }

    [Fact]
    public void GenerarCuerpoCorreoBienvenida_ContieneNombreCorreoYContrasena()
    {
        var resultado = Backend.Helpers.EmailTemplateHelper.GenerarCuerpoCorreoBienvenida(
            "Ana", "Pérez", "ana@ucr.ac.cr", "TempPass1!");

        Assert.Contains("Ana Pérez", resultado);
        Assert.Contains("ana@ucr.ac.cr", resultado);
        Assert.Contains("TempPass1!", resultado);
    }

    [Fact]
    public void GenerarCuerpoCorreoRecuperacion_ContieneNombreYContrasena()
    {
        var resultado = Backend.Helpers.EmailTemplateHelper.GenerarCuerpoCorreoRecuperacion(
            "Carlos", "López", "TempPass2@");

        Assert.Contains("Carlos López", resultado);
        Assert.Contains("TempPass2@", resultado);
    }
}
