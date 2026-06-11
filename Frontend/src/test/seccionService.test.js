// sectionService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerSecciones,
  obtenerSeccionPorNombre,
  crearSeccion,
  eliminarSeccion,
  actualizarSeccion,
} from '../services/sectionService'

describe('sectionService', () => {
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

    it('lanza error cuando falla la creación', async () => {
      const newItem = { nombre: 'Sección X', descripcion: 'Descripción', idArea: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'El nombre ya existe' }),
      })

      await expect(crearSeccion(newItem)).rejects.toThrow('El nombre ya existe')
    })

    it('usa error detail cuando mensaje no existe', async () => {
      const newItem = { nombre: 'Sección X', descripcion: 'Descripción', idArea: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Error de validación' }),
      })

      await expect(crearSeccion(newItem)).rejects.toThrow('Error de validación')
    })

    it('usa error title cuando mensaje y detail no existen', async () => {
      const newItem = { nombre: 'Sección X', descripcion: 'Descripción', idArea: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ title: 'Error de solicitud' }),
      })

      await expect(crearSeccion(newItem)).rejects.toThrow('Error de solicitud')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      const newItem = { nombre: 'Sección X', descripcion: 'Descripción', idArea: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearSeccion(newItem)).rejects.toThrow('Error inesperado (500)')
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

    it('lanza error cuando falla la eliminación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Sección no encontrada' }),
      })

      await expect(eliminarSeccion(999)).rejects.toThrow('Sección no encontrada')
    })

    it('usa código de error genérico cuando json falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON error')
        },
      })

      await expect(eliminarSeccion(1)).rejects.toThrow('Error inesperado (500)')
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

    it('lanza error cuando falla la actualización', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Sección no encontrada' }),
      })

      await expect(actualizarSeccion('Inexistente', updated)).rejects.toThrow(
        'Sección no encontrada',
      )
    })

    it('usa código de error genérico cuando json falla en actualización', async () => {
      const updated = { nombre: 'Nueva', descripcion: 'Desc', idArea: 2 }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error('JSON error')
        },
      })

      await expect(actualizarSeccion('Original', updated)).rejects.toThrow(
        'Error inesperado (400)',
      )
    })
  })
})
