// dashboardService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { obtenerResumenDashboard } from '../services/dashboardService'

describe('dashboardService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  it('llama a GET /dashboard y devuelve el resumen', async () => {
    const payload = {
      indicadores: { totalUsuarios: 5 },
      alertas: { usuariosInactivos: 1 },
    }
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload })

    const result = await obtenerResumenDashboard()

    expect(result).toEqual(payload)
    expect(mockFetch.mock.calls[0][0]).toContain('/dashboard')
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'GET' })
  })

  it('lanza error cuando el backend responde con error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ mensaje: 'Error interno' }),
    })

    await expect(obtenerResumenDashboard()).rejects.toThrow('Error interno')
  })

  it('lanza error de red cuando fetch falla', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('network down'))

    await expect(obtenerResumenDashboard()).rejects.toThrow(/No se pudo conectar/)
  })
})
