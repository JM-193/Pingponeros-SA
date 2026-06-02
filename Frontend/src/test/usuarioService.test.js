// usuarioService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { crearUsuario, obtenerUsuarios, eliminarUsuario } from '../services/usuarioService'

describe('usuarioService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('crearUsuario', () => {
    it('crea un nuevo usuario', async () => {
      const userData = {
        correoInstitucional: 'juan.perez@ucr.ac.cr',
        primerNombre: 'Juan',
        primerApellido: 'Pérez',
        rol: 1,
      }

      const response = {
        ...userData,
        id: 1,
        contrasenaTemporal: 'TempPass123!',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await crearUsuario(userData)

      expect(result).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/usuarios'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }),
      )
    })

    it('envÃ­a todos los campos del usuario', async () => {
      const userData = {
        correoInstitucional: 'test@ucr.ac.cr',
        primerNombre: 'Test',
        segundoNombre: 'Middle',
        primerApellido: 'User',
        segundoApellido: 'Secondary',
        rol: 2,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...userData }),
      })

      await crearUsuario(userData)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body).toEqual(userData)
    })

    it('devuelve contrasenaTemporal en la respuesta', async () => {
      const userData = {
        correoInstitucional: 'user@ucr.ac.cr',
        primerNombre: 'User',
        primerApellido: 'Test',
        rol: 1,
      }

      const response = {
        ...userData,
        id: 1,
        contrasenaTemporal: 'ABC123!xyz',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await crearUsuario(userData)

      expect(result.contrasenaTemporal).toBe('ABC123!xyz')
    })

    it('lanza error con mensaje del backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'El correo ya existe' }),
      })

      await expect(
        crearUsuario({
          correoInstitucional: 'existing@ucr.ac.cr',
          primerNombre: 'Test',
          primerApellido: 'User',
          rol: 1,
        }),
      ).rejects.toThrow('El correo ya existe')
    })

    it('usa detail si mensaje no existe en error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Validación fallida' }),
      })

      await expect(
        crearUsuario({
          correoInstitucional: 'test@ucr.ac.cr',
          primerNombre: 'Test',
          primerApellido: 'User',
          rol: 1,
        }),
      ).rejects.toThrow('Validación fallida')
    })

    it('usa title si detail y mensaje no existen', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ title: 'Error del servidor' }),
      })

      await expect(
        crearUsuario({
          correoInstitucional: 'test@ucr.ac.cr',
          primerNombre: 'Test',
          primerApellido: 'User',
          rol: 1,
        }),
      ).rejects.toThrow('Error del servidor')
    })

    it('genera error genérico cuando JSON falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(
        crearUsuario({
          correoInstitucional: 'test@ucr.ac.cr',
          primerNombre: 'Test',
          primerApellido: 'User',
          rol: 1,
        }),
      ).rejects.toThrow('Error inesperado (500)')
    })

    it('maneja usuarios con nombres opcionales', async () => {
      const userData = {
        correoInstitucional: 'john@ucr.ac.cr',
        primerNombre: 'John',
        primerApellido: 'Doe',
        rol: 2,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...userData }),
      })

      const result = await crearUsuario(userData)

      expect(result).toBeDefined()
      expect(result.primerNombre).toBe('John')
      expect(result.primerApellido).toBe('Doe')
    })
  })

  describe('obtenerUsuarios', () => {
    it('obtiene la lista de todos los usuarios', async () => {
      const resp = [
        { correoInstitucional: 'juan.perez@ucr.ac.cr', primerNombre: 'Juan', primerApellido: 'Pérez', rol: 1 },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => resp,
      })

      const result = await obtenerUsuarios()
      expect(result).toEqual(resp)
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/usuarios'))
    })

    it('lanza error cuando la respuesta no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error al obtener usuarios' }),
      })

      await expect(obtenerUsuarios()).rejects.toThrow('Error al obtener usuarios')
    })
  })

  describe('eliminarUsuario', () => {
    it('elimina un usuario por su correo', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      await eliminarUsuario('juan.perez@ucr.ac.cr')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/usuarios/juan.perez%40ucr.ac.cr'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('lanza error cuando la respuesta no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró el usuario' }),
      })

      await expect(eliminarUsuario('inexistente@ucr.ac.cr')).rejects.toThrow('No se encontró el usuario')
    })
  })
})

