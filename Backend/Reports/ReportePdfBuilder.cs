using System.Globalization;
using Backend.Helpers;
using Backend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Backend.Reports;

/// <summary>
/// Genera los reportes en PDF con QuestPDF. Mantiene un encabezado y pie comunes (título,
/// "Vicerrectoría de Administración", fecha de generación y numeración de página) para que todos
/// los documentos se vean homogéneos. La licencia Community se fija en <c>Program.cs</c> al arrancar.
/// </summary>
internal static class ReportePdfBuilder
{
    private const string Subtitulo = "Vicerrectoría de Administración";

    // Tipos de función en el orden en que se muestran en la vista de la declaración (DeclarationView.jsx).
    private static readonly (string Tipo, string Titulo)[] CategoriasFuncion =
    [
        ("Propia de mi puesto", "Propias de mi puesto"),
        ("De otro puesto", "De otro puesto"),
        ("De apoyo ocasional", "De apoyo ocasional"),
        ("Definida por mí", "Definida por mí"),
    ];

    /// <summary>Reporte tabular genérico (funcionarios, declaraciones, horas) en orientación horizontal.</summary>
    public static byte[] BuildTabla(ReporteTabular datos)
    {
        ArgumentNullException.ThrowIfNull(datos);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Element(c => ComposeEncabezado(c, datos.Titulo));
                page.Content().PaddingTop(8).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var _ in datos.Encabezados)
                            columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        foreach (var encabezado in datos.Encabezados)
                            header.Cell().Element(CeldaEncabezado).Text(encabezado).SemiBold();
                    });

                    if (datos.Filas.Count == 0)
                    {
                        table.Cell().ColumnSpan((uint)datos.Encabezados.Count)
                            .Element(CeldaCuerpo).Text("Sin datos.");
                    }

                    foreach (var fila in datos.Filas)
                        foreach (var celda in fila)
                            table.Cell().Element(CeldaCuerpo).Text(celda);
                });

                ComposePie(page);
            });
        }).GeneratePdf();
    }

    /// <summary>Reporte personal de horas de una declaración: info general + tablas por tipo de función + total.</summary>
    public static byte[] BuildReporteHorasDeclaracion(DeclaracionDetalle detalle, string titular)
    {
        ArgumentNullException.ThrowIfNull(detalle);

        var totalMinutos = WorkloadCalculator.TotalMinutosSemanales(detalle.Actividades);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeEncabezado(c, "Reporte de Horas del Puesto de Trabajo"));
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Spacing(6);

                    TituloSeccion(col, "Información General");
                    Campo(col, "Titular del puesto", titular);
                    Campo(col, "Número de plaza", detalle.Declaracion.NumeroPlaza.ToString(CultureInfo.InvariantCulture));
                    Campo(col, "Cargo del puesto", detalle.Cargo);
                    Campo(col, "Clase ocupacional", detalle.ClaseOcupacional);
                    Campo(col, "Lugar de trabajo", detalle.LugarTrabajo);
                    Campo(col, "Jornada laboral", detalle.Horario?.JornadaLaboral);
                    Campo(col, "Horario laboral",
                        detalle.Horario is { } h ? $"{h.HoraEntrada} a {h.HoraSalida}" : null);
                    Campo(col, "Fecha de la declaración",
                        detalle.Declaracion.FechaDeclaracion.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));

                    TituloSeccion(col, "Horas Registradas por Función");
                    foreach (var (tipo, tituloCategoria) in CategoriasFuncion)
                    {
                        var actividades = detalle.Actividades.Where(a => a.TipoFuncion == tipo).ToList();
                        if (actividades.Count == 0) continue;
                        col.Item().PaddingTop(4).Text(tituloCategoria).SemiBold().FontSize(11);
                        col.Item().Element(c => ComposeTablaActividades(c, actividades));
                    }

                    if (detalle.Actividades.Count == 0)
                        col.Item().Text("Sin funciones declaradas.").Italic();

                    col.Item().PaddingTop(10).AlignRight()
                        .Text($"Total de horas semanales: {WorkloadCalculator.FormatearMinutos(totalMinutos)}")
                        .SemiBold().FontSize(11);
                });

                ComposePie(page);
            });
        }).GeneratePdf();
    }

    // ---------------------------------------------------------------- //
    // Composición compartida                                            //
    // ---------------------------------------------------------------- //
    private static void ComposeEncabezado(IContainer container, string titulo)
    {
        container.Column(col =>
        {
            col.Item().Text(titulo).Bold().FontSize(16).FontColor(Colors.Black);
            col.Item().Text(Subtitulo).FontSize(11).FontColor(Colors.Grey.Darken1);
            col.Item().PaddingTop(2).Text(
                $"Generado el {DateTime.Now.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture)}")
                .FontSize(8).FontColor(Colors.Grey.Medium);
            col.Item().PaddingTop(6).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
        });
    }

    private static void ComposePie(PageDescriptor page)
    {
        page.Footer().AlignCenter().Text(text =>
        {
            text.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Medium));
            text.Span("Página ");
            text.CurrentPageNumber();
            text.Span(" de ");
            text.TotalPages();
        });
    }

    private static void ComposeTablaActividades(IContainer container, IReadOnlyList<Actividad> actividades)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3); // Nombre
                columns.RelativeColumn(4); // Descripción
                columns.RelativeColumn(2); // Periodicidad
                columns.RelativeColumn(2); // Veces
                columns.RelativeColumn(2); // Duración
                columns.RelativeColumn(2); // Horas/semana
            });

            table.Header(header =>
            {
                header.Cell().Element(CeldaEncabezado).Text("Nombre").SemiBold();
                header.Cell().Element(CeldaEncabezado).Text("Descripción").SemiBold();
                header.Cell().Element(CeldaEncabezado).Text("Periodicidad").SemiBold();
                header.Cell().Element(CeldaEncabezado).Text("Cantidad de veces").SemiBold();
                header.Cell().Element(CeldaEncabezado).Text("Duración (min.)").SemiBold();
                header.Cell().Element(CeldaEncabezado).Text("Horas/semana").SemiBold();
            });

            foreach (var a in actividades)
            {
                var minutos = WorkloadCalculator.MinutosSemanales(a.Periodicidad, a.VecesRealizadas, a.Duracion);
                table.Cell().Element(CeldaCuerpo).Text(a.Nombre ?? "—");
                table.Cell().Element(CeldaCuerpo).Text(a.Descripcion ?? "—");
                table.Cell().Element(CeldaCuerpo).Text(a.Periodicidad);
                table.Cell().Element(CeldaCuerpo).Text(WorkloadCalculator.Numero(a.VecesRealizadas));
                table.Cell().Element(CeldaCuerpo).Text(WorkloadCalculator.Numero(a.Duracion));
                table.Cell().Element(CeldaCuerpo).Text(WorkloadCalculator.FormatearMinutos(minutos));
            }
        });
    }

    private static void TituloSeccion(ColumnDescriptor col, string texto)
    {
        col.Item().PaddingTop(8).Text(texto).Bold().FontSize(12).FontColor(Colors.Black);
        col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
    }

    private static void Campo(ColumnDescriptor col, string etiqueta, string? valor)
    {
        col.Item().Text(text =>
        {
            text.Span($"{etiqueta}: ").SemiBold();
            text.Span(string.IsNullOrWhiteSpace(valor) ? "—" : valor);
        });
    }

    private static IContainer CeldaEncabezado(IContainer container) =>
        container.Border(0.5f).BorderColor(Colors.Grey.Lighten1)
            .Background(Colors.Grey.Lighten3).Padding(4);

    private static IContainer CeldaCuerpo(IContainer container) =>
        container.Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4);
}
