// seccionService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerSecciones,
  obtenerSeccionPorNombre,
  crearSeccion,
  eliminarSeccion,
  actualizarSeccion,
} from '../services/seccionService'

describe('seccionService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerSecciones', () => {
    it('obtiene todas las secciones', async () => {
      const mockItems = [
        { id: 1, nombre: 'Sección 1', descripcion: 'Descripción 1' },
        { id: 2, nombre: 'Sección 2', descripcion: 'Descripción 2' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })

      const result = await obtenerSecciones()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/secciones'),
        expect.objectContaining({ method: 'GET' }),
      )
    })
  })

  describe('obtenerSeccionPorNombre', () => {
    it('obtiene sección por nombre', async () => {
      const mockItem = { id: 1, nombre: 'Sección Técnica', descripcion: 'Descripción' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      })

      const result = await obtenerSeccionPorNombre('Sección Técnica')

      expect(result).toEqual(mockItem)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/secciones/Secci%C3%B3n%20T%C3%A9cnica'),
        expect.anything(),
      )
    })
  })

  describe('crearSeccion', () => {
    it('crea una nueva sección', async () => {
      const newItem = { nombre: 'Sección X', descripcion: 'Descripción', idArea: 1 }
      const created = { id: 3, ...newItem }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => created,
      })

      const result = await crearSeccion(newItem)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/secciones'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        }),
      )
    })
  })

  describe('eliminarSeccion', () => {
    it('desactiva una sección por ID', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await eliminarSeccion(1)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/secciones/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('actualizarSeccion', () => {
    it('actualiza una sección existente', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2 }
      const response = { id: 1, ...updated }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await actualizarSeccion('Original', updated)

      expect(result).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/secciones/'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }),
      )
    })
  })
})
