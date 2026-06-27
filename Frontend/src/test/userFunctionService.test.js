// userFunctionService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerTodasFuncionesUsuario,
  obtenerFuncionesUsuarioPorCorreo,
  crearFuncionUsuario,
  eliminarFuncionUsuario,
} from '../services/userFunctionService'

describe('userFunctionService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerTodasFuncionesUsuario', () => {
    it('obtiene todas las funciones de todos los usuarios', async () => {
      const mockItems = [
        { id: 1, correoInstitucional: 'a@ucr.ac.cr', nombre: 'Función A', descripcion: 'Desc A' },
        { id: 2, correoInstitucional: 'b@ucr.ac.cr', nombre: 'Función B', descripcion: 'Desc B' },
      ]

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockItems })

      const result = await obtenerTodasFuncionesUsuario()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones-usuarios'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerTodasFuncionesUsuario()).rejects.toThrow('Error del servidor')
    })
  })

  describe('obtenerFuncionesUsuarioPorCorreo', () => {
    it('obtiene funciones del usuario por correo', async () => {
      const mockItems = [
        { id: 1, correoInstitucional: 'carlos@ucr.ac.cr', nombre: 'Mi función', descripcion: 'Desc' },
      ]

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockItems })

      const result = await obtenerFuncionesUsuarioPorCorreo('carlos@ucr.ac.cr')

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones-usuarios/'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('codifica el correo con caracteres especiales', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })

      await obtenerFuncionesUsuarioPorCorreo('carlos@ucr.ac.cr')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('carlos%40ucr.ac.cr'),
        expect.anything(),
      )
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerFuncionesUsuarioPorCorreo('carlos@ucr.ac.cr')).rejects.toThrow('Error del servidor')
    })
  })

  describe('crearFuncionUsuario', () => {
    it('crea una nueva función de usuario', async () => {
      const datos = {
        correoInstitucional: 'carlos@ucr.ac.cr',
        nombre: 'Mi función',
        descripcion: 'Descripción de mi función',
      }
      const created = { id: 1, mensaje: 'Función de usuario creada correctamente.' }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => created })

      const result = await crearFuncionUsuario(datos)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones-usuarios'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        }),
      )
    })

    it('lanza error de validación cuando datos son inválidos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'El nombre de la función es obligatorio.' }),
      })

      await expect(crearFuncionUsuario({ correoInstitucional: 'a@ucr.ac.cr', nombre: '', descripcion: '' }))
        .rejects.toThrow('El nombre de la función es obligatorio.')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearFuncionUsuario({ correoInstitucional: 'a@ucr.ac.cr', nombre: 'x', descripcion: 'y' }))
        .rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('eliminarFuncionUsuario', () => {
    it('elimina una función de usuario por id', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarFuncionUsuario(5)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones-usuarios/5'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('lanza error cuando la función está en actividades', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'La función está asociada a una o más actividades y no puede eliminarse.' }),
      })

      await expect(eliminarFuncionUsuario(1))
        .rejects.toThrow('La función está asociada a una o más actividades y no puede eliminarse.')
    })

    it('lanza error cuando la función no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró la función de usuario.' }),
      })

      await expect(eliminarFuncionUsuario(99))
        .rejects.toThrow('No se encontró la función de usuario.')
    })

    it('usa código de error genérico cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON error') },
      })

      await expect(eliminarFuncionUsuario(1))
        .rejects.toThrow('Error inesperado (500)')
    })
  })
})
