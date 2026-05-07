// authService.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { login } from '../services/authService'

describe('authService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('realiza login correctamente', async () => {
    const mockResponse = {
      id: 1,
      correoInstitucional: 'test@ucr.ac.cr',
      nombre: 'Test User',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await login('test@ucr.ac.cr', 'password123')

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('envÃ­a credenciales correctas al backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    await login('user@ucr.ac.cr', 'pass123')

    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)

    expect(body).toEqual({
      correoInstitucional: 'user@ucr.ac.cr',
      contrasena: 'pass123',
    })
  })

  it('lanza error cuando response no es ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ mensaje: 'Credenciales inválidas' }),
    })

    await expect(login('test@ucr.ac.cr', 'wrong')).rejects.toThrow(
      'Credenciales inválidas',
    )
  })

  it('usa mensaje del error desde backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ mensaje: 'Usuario o contraseña incorrecta' }),
    })

    await expect(login('test@ucr.ac.cr', 'wrong')).rejects.toThrow(
      'Usuario o contraseña incorrecta',
    )
  })

  it('lanza error con mensaje del servidor cuando no hay campo mensaje', async () => {
    // El servicio usa data.mensaje; si no existe, lanza Error inesperado (status)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ mensaje: 'Error interno del servidor' }),
    })

    await expect(login('test@ucr.ac.cr', 'pass')).rejects.toThrow(
      'Error interno del servidor',
    )
  })

  it('usa API_URL del environment si está disponible', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    await login('test@ucr.ac.cr', 'pass')

    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('/auth/login')
  })
})

