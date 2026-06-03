// authService.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { login, recuperarContrasena, cambiarContrasena } from '../services/authService'

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

  it('conserva status y código del error del backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        codigo: 'TEMP_PASSWORD_EXPIRED',
        mensaje: 'La contraseña temporal ha expirado',
      }),
    })

    await expect(login('test@ucr.ac.cr', 'Temporal123!')).rejects.toMatchObject({
      message: 'La contraseña temporal ha expirado',
      status: 403,
      codigo: 'TEMP_PASSWORD_EXPIRED',
    })
  })

  it('lanza error genérico cuando la respuesta no incluye campo mensaje', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    await expect(login('test@ucr.ac.cr', 'pass')).rejects.toThrow(
      'Error inesperado (500)',
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

  describe('recuperarContrasena', () => {
    it('recupera contraseña correctamente', async () => {
      const mockResponse = { mensaje: 'Correo enviado' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await recuperarContrasena('test@ucr.ac.cr')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/recuperar-contrasena'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    it('envía el correo institucional en el body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await recuperarContrasena('usuario@ucr.ac.cr')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body).toEqual({ correoInstitucional: 'usuario@ucr.ac.cr' })
    })

    it('lanza error con mensaje del backend cuando no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Correo no encontrado' }),
      })

      await expect(recuperarContrasena('no-existe@ucr.ac.cr')).rejects.toThrow(
        'Correo no encontrado',
      )
    })

    it('lanza error genérico cuando la respuesta no incluye campo mensaje', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(recuperarContrasena('test@ucr.ac.cr')).rejects.toThrow(
        'Error inesperado (500)',
      )
    })
  })

  describe('cambiarContrasena', () => {
    it('cambia contraseña correctamente', async () => {
      const mockResponse = { mensaje: 'Contraseña cambiada exitosamente' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await cambiarContrasena('test@ucr.ac.cr', 'oldPass123', 'newPass123')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/cambiar-contrasena'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    it('envía correo, contraseña actual y nueva en el body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await cambiarContrasena('usuario@ucr.ac.cr', 'oldPass', 'newPass')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body).toEqual({
        correoInstitucional: 'usuario@ucr.ac.cr',
        contraseñaActual: 'oldPass',
        contraseñaNueva: 'newPass',
      })
    })

    it('lanza error con mensaje del backend cuando no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ mensaje: 'Contraseña actual incorrecta' }),
      })

      await expect(
        cambiarContrasena('test@ucr.ac.cr', 'wrongPass', 'newPass'),
      ).rejects.toThrow('Contraseña actual incorrecta')
    })

    it('lanza error genérico cuando la respuesta no incluye campo mensaje', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(
        cambiarContrasena('test@ucr.ac.cr', 'oldPass', 'newPass'),
      ).rejects.toThrow('Error inesperado (500)')
    })

    it('maneja error cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error('JSON parse error')
        },
      })

      await expect(
        cambiarContrasena('test@ucr.ac.cr', 'oldPass', 'newPass'),
      ).rejects.toThrow('Error inesperado (400)')
    })
  })
})
