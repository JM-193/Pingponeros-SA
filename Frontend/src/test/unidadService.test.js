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
  })
})
