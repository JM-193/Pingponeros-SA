using ClosedXML.Excel;

namespace Backend.Reports;

/// <summary>
/// Genera los reportes administrativos en Excel (.xlsx) con ClosedXML a partir de la misma
/// proyección tabular (<see cref="ReporteTabular"/>) que usa el PDF.
/// </summary>
internal static class ReporteExcelBuilder
{
    public static byte[] BuildHoja(ReporteTabular datos)
    {
        ArgumentNullException.ThrowIfNull(datos);

        using var workbook = new XLWorkbook();
        var hoja = workbook.Worksheets.Add(LimpiarNombreHoja(datos.NombreHoja));

        var columnas = datos.Encabezados.Count;

        // Fila 1: encabezados.
        for (var c = 0; c < columnas; c++)
            hoja.Cell(1, c + 1).Value = datos.Encabezados[c];

        var rangoEncabezado = hoja.Range(1, 1, 1, columnas);
        rangoEncabezado.Style.Font.Bold = true;
        rangoEncabezado.Style.Fill.BackgroundColor = XLColor.LightGray;

        // Filas de datos a partir de la fila 2.
        for (var r = 0; r < datos.Filas.Count; r++)
        {
            var fila = datos.Filas[r];
            for (var c = 0; c < columnas; c++)
                hoja.Cell(r + 2, c + 1).Value = fila[c];
        }

        var ultimaFila = datos.Filas.Count + 1;
        hoja.Range(1, 1, ultimaFila, columnas).SetAutoFilter();
        hoja.SheetView.FreezeRows(1);
        hoja.Columns().AdjustToContents();

        using var memoria = new MemoryStream();
        workbook.SaveAs(memoria);
        return memoria.ToArray();
    }

    // Excel limita el nombre de hoja a 31 caracteres y prohíbe algunos símbolos.
    private static string LimpiarNombreHoja(string nombre)
    {
        var limpio = new string(nombre.Where(c => c is not (':' or '\\' or '/' or '?' or '*' or '[' or ']')).ToArray());
        return limpio.Length > 31 ? limpio[..31] : limpio;
    }
}
