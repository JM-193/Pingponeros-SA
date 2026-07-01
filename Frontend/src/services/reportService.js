import { apiFetchBlob } from './apiClient'

// Tipos de reporte administrativo; el valor coincide con la ruta del backend (/reportes/{tipo}).
export const REPORTE_TIPOS = {
  FUNCIONARIOS: 'funcionarios',
  DECLARACIONES: 'declaraciones',
  HORAS: 'horas',
}

export const REPORTE_TIPO_OPTIONS = [
  { value: REPORTE_TIPOS.FUNCIONARIOS, label: 'Funcionarios' },
  { value: REPORTE_TIPOS.DECLARACIONES, label: 'Declaraciones juradas' },
  { value: REPORTE_TIPOS.HORAS, label: 'Horas / carga laboral' },
]

// Formatos soportados por los reportes administrativos.
export const FORMATOS = { PDF: 'pdf', EXCEL: 'excel' }

export const FORMATO_OPTIONS = [
  { value: FORMATOS.PDF, label: 'PDF' },
  { value: FORMATOS.EXCEL, label: 'Excel (.xlsx)' },
]

// Reporte administrativo en el formato indicado. Devuelve un Blob.
export async function obtenerReporteAdmin(tipo, formato) {
  return apiFetchBlob(`/reportes/${tipo}?formato=${encodeURIComponent(formato)}`, { method: 'GET' })
}

// Reporte personal (PDF) de las horas registradas en una declaración. Devuelve un Blob.
export async function obtenerReporteHorasDeclaracion(id) {
  return apiFetchBlob(`/reportes/declaraciones/${encodeURIComponent(id)}/horas`, { method: 'GET' })
}

// Documento oficial (PDF) de la declaración jurada, listo para imprimir y firmar. Devuelve un Blob.
export async function obtenerDeclaracionDocumento(id) {
  return apiFetchBlob(`/reportes/declaraciones/${encodeURIComponent(id)}/documento`, { method: 'GET' })
}
