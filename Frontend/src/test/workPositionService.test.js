// workPositionService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerPuestos,
  obtenerPuestoPorNombre,
  crearPuesto,
  eliminarPuesto,
} from '../services/workPositionService'

describe('workPositionService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerPuestos', () => {
    it('obtiene todos los puestos de trabajo', async () => {
      const mockItems = [
        { id: 1, nombre: 'chofer', descripcion: 'Puesto de conductor' },
        { id: 2, nombre: 'digitador', descripcion: 'Puesto de digitación' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })

      const result = await obtenerPuestos()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/puestos-trabajo'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerPuestos()).rejects.toThrow('Error del servidor')
    })
  })

  describe('obtenerPuestoPorNombre', () => {
    it('obtiene puesto por nombre', async () => {
      const mockItem = { id: 1, nombre: 'chofer', descripcion: 'Puesto de conductor' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      })

      const result = await obtenerPuestoPorNombre('chofer')

      expect(result).toEqual(mockItem)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/puestos-trabajo/chofer'),
        expect.anything(),
      )
    })

    it('codifica caracteres especiales en el nombre', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, nombre: 'técnico', descripcion: 'Desc' }),
      })

      await obtenerPuestoPorNombre('técnico')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('t%C3%A9cnico'),
        expect.anything(),
      )
    })

    it('lanza error cuando el puesto no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró el puesto' }),
      })

      await expect(obtenerPuestoPorNombre('noexiste')).rejects.toThrow('No se encontró el puesto')
    })
  })

  describe('crearPuesto', () => {
    it('crea un nuevo puesto de trabajo', async () => {
      const datos = { nombre: 'chofer', descripcion: 'Puesto de conductor' }
      const created = { id: 1, ...datos }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => created,
      })

      const result = await crearPuesto(datos)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/puestos-trabajo'),
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
        json: async () => ({ mensaje: 'Ya existe un puesto con ese nombre' }),
      })

      await expect(crearPuesto({ nombre: 'chofer', descripcion: 'Desc' }))
        .rejects.toThrow('Ya existe un puesto con ese nombre')
    })

    it('lanza error con detail cuando mensaje no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Error de validación' }),
      })

      await expect(crearPuesto({ nombre: '', descripcion: '' }))
        .rejects.toThrow('Error de validación')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearPuesto({ nombre: 'x', descripcion: 'y' }))
        .rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('eliminarPuesto', () => {
    it('elimina un puesto por nombre', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarPuesto('chofer')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/puestos-trabajo/chofer'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('codifica caracteres especiales en el nombre al eliminar', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarPuesto('técnico')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('t%C3%A9cnico'),
        expect.anything(),
      )
    })

    it('lanza error cuando el puesto está asociado a una plaza', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'El puesto está asociado a una o más plazas' }),
      })

      await expect(eliminarPuesto('chofer'))
        .rejects.toThrow('El puesto está asociado a una o más plazas')
    })

    it('lanza error cuando el puesto no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró el puesto' }),
      })

      await expect(eliminarPuesto('noexiste'))
        .rejects.toThrow('No se encontró el puesto')
    })

    it('usa código de error genérico cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON error') },
      })

      await expect(eliminarPuesto('chofer'))
        .rejects.toThrow('Error inesperado (500)')
    })
  })
})
