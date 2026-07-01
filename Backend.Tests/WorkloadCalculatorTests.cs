// WorkloadCalculatorTests.cs
using Backend.Helpers;
using Backend.Models;
using Xunit;

namespace Backend.Tests;

public sealed class WorkloadCalculatorTests
{
    [Theory]
    [InlineData("Semanal", 2, 30, 60)]    // 30 × 2 × 1
    [InlineData("Diario", 1, 10, 60)]     // 10 × 1 × 6
    [InlineData("Desconocido", 5, 30, 0)] // periodicidad sin factor → 0
    public void MinutosSemanales_CalculaSegunPeriodicidad(string periodicidad, int veces, int duracion, double esperado)
    {
        var result = WorkloadCalculator.MinutosSemanales(periodicidad, veces, duracion);

        Assert.Equal(esperado, result, 3);
    }

    [Fact]
    public void TotalMinutosSemanales_SumaActividades()
    {
        var actividades = new List<Actividad>
        {
            new() { Periodicidad = "Semanal", VecesRealizadas = 1, Duracion = 60 }, // 60
            new() { Periodicidad = "Diario", VecesRealizadas = 1, Duracion = 10 },  // 60
        };

        Assert.Equal(120, WorkloadCalculator.TotalMinutosSemanales(actividades), 3);
    }

    [Theory]
    [InlineData("Tiempo Completo", 48)]
    [InlineData("Medio Tiempo", 24)]
    public void HorasJornada_ReconoceJornadas(string jornada, int esperado)
        => Assert.Equal(esperado, WorkloadCalculator.HorasJornada(jornada));

    [Fact]
    public void HorasJornada_Desconocida_RetornaNull()
        => Assert.Null(WorkloadCalculator.HorasJornada("Jornada Inexistente"));

    [Theory]
    [InlineData(0, "0 min")]
    [InlineData(45, "45 min")]
    [InlineData(60, "1 h")]
    [InlineData(90, "1 h 30 min")]
    public void FormatearMinutos_DaFormatoLegible(double minutos, string esperado)
        => Assert.Equal(esperado, WorkloadCalculator.FormatearMinutos(minutos));
}
