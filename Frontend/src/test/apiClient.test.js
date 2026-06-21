// apiClient.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { apiFetch, ApiError } from '../services/apiClient'

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
      json: async () => ({ codigo: 'TEMP_PASSWORD_EXPIRED', mensaje: 'La contraseña temporal ha expirado' }),
    })

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      message: 'La contraseña temporal ha expirado',
      status: 403,
      codigo: 'TEMP_PASSWORD_EXPIRED',
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
})
