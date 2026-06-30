namespace Backend.Services;

internal interface IReporteService
{
    /// <summary>Reporte de funcionarios en el formato indicado (<c>pdf</c> o <c>excel</c>).</summary>
    Task<IResult> GenerarFuncionariosAsync(string? formato, bool isDev);

    /// <summary>Reporte de declaraciones juradas en el formato indicado.</summary>
    Task<IResult> GenerarDeclaracionesAsync(string? formato, bool isDev);

    /// <summary>Reporte de horas / carga laboral en el formato indicado.</summary>
    Task<IResult> GenerarHorasAsync(string? formato, bool isDev);

    /// <summary>Reporte personal (PDF) de las horas registradas en una declaración específica.</summary>
    Task<IResult> GenerarHorasDeclaracionAsync(int idDeclaracion, bool isDev);
}
