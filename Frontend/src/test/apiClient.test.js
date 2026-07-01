// apiClient.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { apiFetch, apiFetchBlob, ApiError } from '../services/apiClient'

describe('apiClient', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  it('llama a fetch con un solo argumento cuando no se pasan opciones', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: 1 }) })

    await apiFetch('/usuarios')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0]).toHaveLength(1)
    expect(mockFetch.mock.calls[0][0]).toContain('/usuarios')
  })

  it('devuelve el cuerpo JSON parseado en respuestas correctas', async () => {
    const payload = [{ id: 1 }]
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload })

    const result = await apiFetch('/areas', { method: 'GET' })

    expect(result).toEqual(payload)
  })

  it('devuelve null en respuestas 204 sin cuerpo', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })

    const result = await apiFetch('/areas/1', { method: 'DELETE' })

    expect(result).toBeNull()
  })

  it('lanza ApiError con status 0 cuando fetch falla (backend caído)', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(apiFetch('/areas', { method: 'GET' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'No se pudo conectar con el servidor. Verifique su conexión.',
    })
  })

  it('parsea el mensaje del backend y conserva status y codigo', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        codigo: 'CUENTA_INACTIVA',
        mensaje: 'La cuenta del usuario se encuentra inactiva. Contacte al equipo de soporte.',
      }),
    })

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      message: 'La cuenta del usuario se encuentra inactiva. Contacte al equipo de soporte.',
      status: 403,
      codigo: 'CUENTA_INACTIVA',
    })
  })

  it('usa mensaje genérico cuando el cuerpo no trae campos conocidos', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })

    await expect(apiFetch('/usuarios')).rejects.toThrow('Error inesperado (500)')
  })

  it('usa mensaje genérico cuando el JSON de error falla', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => { throw new Error('Invalid JSON') },
    })

    await expect(apiFetch('/usuarios')).rejects.toThrow('Error inesperado (400)')
  })

  it('devuelve [] en 404 cuando emptyArrayOn404 está activo', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })

    const result = await apiFetch('/unidades', { method: 'GET' }, { emptyArrayOn404: true })

    expect(result).toEqual([])
  })

  it('ApiError es una instancia de Error', () => {
    const error = new ApiError('boom', 500, 'X')
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(500)
    expect(error.codigo).toBe('X')
  })

  describe('apiFetchBlob', () => {
    it('devuelve el cuerpo como Blob en respuestas correctas', async () => {
      const blob = new Blob(['contenido'], { type: 'application/pdf' })
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob })

      const result = await apiFetchBlob('/reportes/funcionarios?formato=pdf', { method: 'GET' })

      expect(result).toBe(blob)
    })

    it('lanza ApiError con status 0 cuando fetch falla', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(apiFetchBlob('/reportes/horas', { method: 'GET' })).rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
      })
    })

    it('parsea el mensaje del backend cuando responde con error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontraron datos para el reporte seleccionado.' }),
      })

      await expect(
        apiFetchBlob('/reportes/declaraciones?formato=pdf', { method: 'GET' }),
      ).rejects.toThrow('No se encontraron datos para el reporte seleccionado.')
    })
  })
})
