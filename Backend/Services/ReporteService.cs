using System.Globalization;
using Backend.Helpers;
using Backend.Models;
using Backend.Reports;
using Backend.Repositories;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Services;

/// <summary>
/// Orquesta la generación de reportes: consulta los datos, aplica la regla "sin datos"
/// (Criterio 1 de ambas historias) y construye el archivo en el formato pedido (PDF o Excel)
/// reutilizando <see cref="ReportePdfBuilder"/> / <see cref="ReporteExcelBuilder"/>.
/// </summary>
internal sealed class ReporteService : IReporteService
{
    private const string MensajeSinDatos = "No se encontraron datos para el reporte seleccionado.";
    private const string MimePdf = "application/pdf";
    private const string MimeExcel = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly IReporteRepository _reportes;
    private readonly IDeclaracionRepository _declaraciones;
    private readonly IUserRepository _usuarios;

    public ReporteService(
        IReporteRepository reportes,
        IDeclaracionRepository declaraciones,
        IUserRepository usuarios)
    {
        _reportes = reportes;
        _declaraciones = declaraciones;
        _usuarios = usuarios;
    }

    // ---------------------------------------------------------------- //
    // Reportes administrativos (tabulares: PDF o Excel)                 //
    // ---------------------------------------------------------------- //
    public async Task<IResult> GenerarFuncionariosAsync(string? formato, bool isDev)
    {
        try
        {
            var filas = await _reportes.ObtenerFuncionariosAsync().ConfigureAwait(false);
            if (filas.Count == 0)
                return SinDatos();

            var datos = new ReporteTabular(
                Titulo: "Reporte de Funcionarios",
                Subtitulo: string.Empty,
                NombreArchivo: NombreArchivo("funcionarios"),
                NombreHoja: "Funcionarios",
                Encabezados: ["Correo", "Nombre", "Rol", "Estado", "N.º Plaza", "Cargo", "Clase Ocupacional", "Lugar de Trabajo"],
                Filas: filas.Select(f => (IReadOnlyList<string>)
                [
                    f.CorreoInstitucional,
                    f.NombreCompleto,
                    TextoRol(f.Rol),
                    TextoEstado(f.Estado),
                    f.NumeroPlaza?.ToString(CultureInfo.InvariantCulture) ?? "—",
                    f.Cargo ?? "—",
                    f.ClaseOcupacional ?? "—",
                    f.LugarTrabajo ?? "—",
                ]).ToList());

            return ConstruirArchivo(datos, formato);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> GenerarDeclaracionesAsync(string? formato, bool isDev)
    {
        try
        {
            var filas = await _reportes.ObtenerDeclaracionesAsync().ConfigureAwait(false);
            if (filas.Count == 0)
                return SinDatos();

            var datos = new ReporteTabular(
                Titulo: "Reporte de Declaraciones Juradas",
                Subtitulo: string.Empty,
                NombreArchivo: NombreArchivo("declaraciones"),
                NombreHoja: "Declaraciones",
                Encabezados: ["N.º", "Funcionario", "Correo", "N.º Plaza", "Cargo", "Fecha", "Estado"],
                Filas: filas.Select(f => (IReadOnlyList<string>)
                [
                    f.Id.ToString(CultureInfo.InvariantCulture),
                    f.NombreCompleto,
                    f.CorreoInstitucional,
                    f.NumeroPlaza.ToString(CultureInfo.InvariantCulture),
                    f.Cargo ?? "—",
                    f.FechaDeclaracion.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    TextoCompleta(f.Completa),
                ]).ToList());

            return ConstruirArchivo(datos, formato);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    public async Task<IResult> GenerarHorasAsync(string? formato, bool isDev)
    {
        try
        {
            var filas = await _reportes.ObtenerHorasAsync().ConfigureAwait(false);
            if (filas.Count == 0)
                return SinDatos();

            var datos = new ReporteTabular(
                Titulo: "Reporte de Horas / Carga Laboral",
                Subtitulo: string.Empty,
                NombreArchivo: NombreArchivo("horas"),
                NombreHoja: "Horas",
                Encabezados: ["Funcionario", "Correo", "N.º Plaza", "Cargo", "Fecha", "Jornada", "Funciones", "Horas/semana"],
                Filas: filas.Select(f => (IReadOnlyList<string>)
                [
                    f.NombreCompleto,
                    f.CorreoInstitucional,
                    f.NumeroPlaza.ToString(CultureInfo.InvariantCulture),
                    f.Cargo ?? "—",
                    f.FechaDeclaracion.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    f.JornadaLaboral ?? "—",
                    f.CantidadFunciones.ToString(CultureInfo.InvariantCulture),
                    WorkloadCalculator.FormatearMinutos(f.TotalMinutosSemanales),
                ]).ToList());

            return ConstruirArchivo(datos, formato);
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // ---------------------------------------------------------------- //
    // Reporte personal de horas (PDF) de una declaración                //
    // ---------------------------------------------------------------- //
    public async Task<IResult> GenerarHorasDeclaracionAsync(int idDeclaracion, bool isDev)
    {
        try
        {
            var detalle = await _declaraciones.ObtenerDetalleAsync(idDeclaracion).ConfigureAwait(false);
            if (detalle is null || detalle.Actividades.Count == 0)
                return SinDatos();

            var usuario = await _usuarios.ObtenerPorCorreoAsync(detalle.Declaracion.CorreoInstitucional)
                                         .ConfigureAwait(false);
            var titular = ConstruirTitular(usuario);

            var pdf = ReportePdfBuilder.BuildReporteHorasDeclaracion(detalle, titular);
            return Results.File(pdf, MimePdf, $"reporte-horas-declaracion-{idDeclaracion}.pdf");
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // ---------------------------------------------------------------- //
    // Documento oficial (PDF) de una declaración                        //
    // ---------------------------------------------------------------- //
    public async Task<IResult> GenerarDeclaracionDocumentoAsync(int idDeclaracion, bool isDev)
    {
        try
        {
            // A diferencia del reporte de horas, el documento se emite aunque no haya actividades:
            // basta con que la declaración exista para imprimirla y firmarla.
            var detalle = await _declaraciones.ObtenerDetalleAsync(idDeclaracion).ConfigureAwait(false);
            if (detalle is null)
                return SinDatos();

            var usuario = await _usuarios.ObtenerPorCorreoAsync(detalle.Declaracion.CorreoInstitucional)
                                         .ConfigureAwait(false);
            var titular = ConstruirTitular(usuario);

            var pdf = ReportePdfBuilder.BuildDeclaracionJurada(detalle, titular);
            return Results.File(pdf, MimePdf, $"declaracion-jurada-{idDeclaracion}.pdf");
        }
        catch (OracleException ex)
        {
            return OracleErrorMapper.ToResult(ex, isDev);
        }
    }

    // ---------------------------------------------------------------- //
    // Helpers                                                           //
    // ---------------------------------------------------------------- //
    private static IResult ConstruirArchivo(ReporteTabular datos, string? formato) => ParseFormato(formato) switch
    {
        Formato.Pdf => Results.File(ReportePdfBuilder.BuildTabla(datos), MimePdf, $"{datos.NombreArchivo}.pdf"),
        Formato.Excel => Results.File(ReporteExcelBuilder.BuildHoja(datos), MimeExcel, $"{datos.NombreArchivo}.xlsx"),
        _ => Results.BadRequest(new { mensaje = "Formato de reporte no válido. Use 'pdf' o 'excel'." }),
    };

    private static IResult SinDatos() => Results.NotFound(new { mensaje = MensajeSinDatos });

    private static string NombreArchivo(string tipo) =>
        $"reporte-{tipo}-{DateTime.Now.ToString("yyyyMMdd", CultureInfo.InvariantCulture)}";

    private static string ConstruirTitular(User? usuario)
    {
        if (usuario is null) return string.Empty;
        var partes = new[]
        {
            usuario.PrimerNombre,
            usuario.SegundoNombre,
            usuario.PrimerApellido,
            usuario.SegundoApellido,
        };
        return string.Join(' ', partes.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    private static string TextoRol(int rol) => rol == 1 ? "Administrador" : "Funcionario";
    private static string TextoEstado(int estado) => estado == 1 ? "Activo" : "Inactivo";
    private static string TextoCompleta(int completa) => completa == 1 ? "Completa" : "Borrador";

    private static Formato ParseFormato(string? formato) => (formato?.Trim().ToLowerInvariant()) switch
    {
        null or "" or "pdf" => Formato.Pdf,
        "excel" or "xlsx" => Formato.Excel,
        _ => Formato.Invalido,
    };

    private enum Formato
    {
        Pdf,
        Excel,
        Invalido,
    }
}
