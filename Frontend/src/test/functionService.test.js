// functionService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { obtenerFunciones, crearFuncion, eliminarFuncion } from '../services/functionService'

describe('functionService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerFunciones', () => {
    it('obtiene todas las funciones oficiales', async () => {
      const mockItems = [
        { id: 1, nombre: 'Elaborar informes', descripcion: 'Redactar informes mensuales' },
        { id: 2, nombre: 'Atención al cliente', descripcion: 'Brindar atención al público' },
      ]

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockItems })

      const result = await obtenerFunciones()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerFunciones()).rejects.toThrow('Error del servidor')
    })
  })

  describe('crearFuncion', () => {
    it('crea una nueva función oficial', async () => {
      const datos = { nombre: 'Elaborar informes', descripcion: 'Redactar informes mensuales' }
      const created = { id: 1, ...datos }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => created })

      const result = await crearFuncion(datos)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        }),
      )
    })

    it('lanza error cuando el nombre ya existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'Ya existe una función oficial con ese nombre.' }),
      })

      await expect(crearFuncion({ nombre: 'Elaborar informes', descripcion: 'Desc' }))
        .rejects.toThrow('Ya existe una función oficial con ese nombre.')
    })

    it('lanza error con detail cuando mensaje no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Error de validación' }),
      })

      await expect(crearFuncion({ nombre: '', descripcion: '' }))
        .rejects.toThrow('Error de validación')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearFuncion({ nombre: 'x', descripcion: 'y' }))
        .rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('eliminarFuncion', () => {
    it('elimina una función por nombre', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarFuncion('Elaborar informes')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/funciones/'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('codifica caracteres especiales en el nombre al eliminar', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarFuncion('Función de prueba')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Funci%C3%B3n'),
        expect.anything(),
      )
    })

    it('lanza error cuando la función está en actividades', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'La función oficial está asociada a una o más actividades y no puede eliminarse.' }),
      })

      await expect(eliminarFuncion('Elaborar informes'))
        .rejects.toThrow('La función oficial está asociada a una o más actividades y no puede eliminarse.')
    })

    it('lanza error cuando la función no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró la función oficial.' }),
      })

      await expect(eliminarFuncion('noexiste'))
        .rejects.toThrow('No se encontró la función oficial.')
    })

    it('usa código de error genérico cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON error') },
      })

      await expect(eliminarFuncion('Elaborar informes'))
        .rejects.toThrow('Error inesperado (500)')
    })
  })
})
