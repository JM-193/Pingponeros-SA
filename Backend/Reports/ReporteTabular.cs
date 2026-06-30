namespace Backend.Reports;

/// <summary>
/// Proyección común a PDF y Excel de un reporte tabular: título, nombre de archivo/hoja, encabezados
/// y filas (ya convertidas a texto). El servicio arma esta estructura una sola vez y la pasa a
/// <see cref="ReportePdfBuilder"/> o <see cref="ReporteExcelBuilder"/> según el formato pedido,
/// evitando duplicar la proyección de datos.
/// </summary>
internal sealed record ReporteTabular(
    string Titulo,
    string Subtitulo,
    string NombreArchivo,
    string NombreHoja,
    IReadOnlyList<string> Encabezados,
    IReadOnlyList<IReadOnlyList<string>> Filas);
