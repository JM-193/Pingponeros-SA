// reportService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerReporteAdmin,
  obtenerReporteHorasDeclaracion,
  REPORTE_TIPOS,
  FORMATOS,
} from '../services/reportService'

describe('reportService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  it('obtenerReporteAdmin pide el tipo y formato PDF y devuelve un Blob', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob })

    const result = await obtenerReporteAdmin(REPORTE_TIPOS.FUNCIONARIOS, FORMATOS.PDF)

    expect(result).toBe(blob)
    expect(mockFetch.mock.calls[0][0]).toContain('/reportes/funcionarios?formato=pdf')
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'GET' })
  })

  it('obtenerReporteAdmin solicita el formato Excel', async () => {
    const blob = new Blob(['xlsx'])
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob })

    await obtenerReporteAdmin(REPORTE_TIPOS.HORAS, FORMATOS.EXCEL)

    expect(mockFetch.mock.calls[0][0]).toContain('/reportes/horas?formato=excel')
  })

  it('obtenerReporteHorasDeclaracion llama al endpoint de la declaración', async () => {
    const blob = new Blob(['pdf'])
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob })

    const result = await obtenerReporteHorasDeclaracion(7)

    expect(result).toBe(blob)
    expect(mockFetch.mock.calls[0][0]).toContain('/reportes/declaraciones/7/horas')
  })

  it('propaga el mensaje "sin datos" del backend (404)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ mensaje: 'No se encontraron datos para el reporte seleccionado.' }),
    })

    await expect(
      obtenerReporteAdmin(REPORTE_TIPOS.DECLARACIONES, FORMATOS.PDF),
    ).rejects.toThrow('No se encontraron datos para el reporte seleccionado.')
  })
})
