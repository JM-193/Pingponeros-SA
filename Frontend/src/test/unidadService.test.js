// unidadService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerUnidades,
  obtenerUnidadPorNombre,
  crearUnidad,
  eliminarUnidad,
  actualizarUnidad,
} from '../services/unidadService'

describe('unidadService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerUnidades', () => {
    it('obtiene todas las unidades', async () => {
      const mockItems = [
        { id: 1, nombre: 'Unidad 1', descripcion: 'Descripción 1' },
        { id: 2, nombre: 'Unidad 2', descripcion: 'Descripción 2' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })

      const result = await obtenerUnidades()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unidades'),
        expect.objectContaining({ method: 'GET' }),
      )
    })
  })

  describe('obtenerUnidadPorNombre', () => {
    it('obtiene unidad por nombre', async () => {
      const mockItem = { id: 1, nombre: 'Unidad Técnica', descripcion: 'Descripción' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      })

      const result = await obtenerUnidadPorNombre('Unidad Técnica')

      expect(result).toEqual(mockItem)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unidades/Unidad%20T%C3%A9cnica'),
        expect.anything(),
      )
    })
  })

  describe('crearUnidad', () => {
    it('crea una nueva unidad', async () => {
      const newItem = { nombre: 'Unidad X', descripcion: 'Descripción', idArea: 1, idDepartamento: 2 }
      const created = { id: 3, ...newItem }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => created,
      })

      const result = await crearUnidad(newItem)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unidades'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        }),
      )
    })

    it('lanza error cuando falla la creación', async () => {
      const newItem = { nombre: 'Unidad X', descripcion: 'Descripción', idArea: 1, idDepartamento: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'El nombre ya existe' }),
      })

      await expect(crearUnidad(newItem)).rejects.toThrow('El nombre ya existe')
    })

    it('usa error detail cuando mensaje no existe', async () => {
      const newItem = { nombre: 'Unidad X', descripcion: 'Descripción', idArea: 1, idDepartamento: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Error de validación' }),
      })

      await expect(crearUnidad(newItem)).rejects.toThrow('Error de validación')
    })

    it('usa error title cuando mensaje y detail no existen', async () => {
      const newItem = { nombre: 'Unidad X', descripcion: 'Descripción', idArea: 1, idDepartamento: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ title: 'Error de solicitud' }),
      })

      await expect(crearUnidad(newItem)).rejects.toThrow('Error de solicitud')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      const newItem = { nombre: 'Unidad X', descripcion: 'Descripción', idArea: 1, idDepartamento: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearUnidad(newItem)).rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('eliminarUnidad', () => {
    it('desactiva una unidad por ID', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await eliminarUnidad(1)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unidades/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('lanza error cuando falla la eliminación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Unidad no encontrada' }),
      })

      await expect(eliminarUnidad(999)).rejects.toThrow('Unidad no encontrada')
    })

    it('usa código de error genérico cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON error')
        },
      })

      await expect(eliminarUnidad(1)).rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('actualizarUnidad', () => {
    it('actualiza una unidad existente', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2, idSeccion: 1 }
      const response = { id: 1, ...updated }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await actualizarUnidad('Original', updated)

      expect(result).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unidades/'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }),
      )
    })

    it('lanza error cuando falla la actualización', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2, idSeccion: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Unidad no encontrada' }),
      })

      await expect(actualizarUnidad('Inexistente', updated)).rejects.toThrow(
        'Unidad no encontrada',
      )
    })

    it('usa código de error genérico cuando json falla en actualización', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2, idSeccion: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error('JSON error')
        },
      })

      await expect(actualizarUnidad('Original', updated)).rejects.toThrow(
        'Error inesperado (400)',
      )
    })
  })
})
