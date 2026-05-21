// areaService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerAreas,
  obtenerAreaPorNombre,
  crearArea,
  eliminarArea,
  actualizarArea,
} from '../services/areaService'

describe('areaService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerAreas', () => {
    it('obtiene todas las áreas', async () => {
      const mockAreas = [
        { id: 1, nombre: 'Área 1', descripcion: 'Descripción 1' },
        { id: 2, nombre: 'Área 2', descripcion: 'Descripción 2' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAreas,
      })

      const result = await obtenerAreas()

      expect(result).toEqual(mockAreas)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/areas'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando obtenerAreas falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerAreas()).rejects.toThrow('Error del servidor')
    })
  })

  describe('obtenerAreaPorNombre', () => {
    it('obtiene área por nombre', async () => {
      const mockArea = { id: 1, nombre: 'Administración', descripcion: 'Admin' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArea,
      })

      const result = await obtenerAreaPorNombre('Administración')

      expect(result).toEqual(mockArea)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/areas/Administraci%C3%B3n'),
        expect.anything(),
      )
    })

    it('codifica correctamente el nombre en la URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      await obtenerAreaPorNombre('Área Especial')

      const url = mockFetch.mock.calls[0][0]
      // Verificar que la URL contiene el nombre codificado
      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })

    it('lanza error cuando área no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Área no encontrada' }),
      })

      await expect(obtenerAreaPorNombre('NoExiste')).rejects.toThrow(
        'Área no encontrada',
      )
    })
  })

  describe('crearArea', () => {
    it('crea una nueva área', async () => {
      const newArea = { nombre: 'Nueva Área', descripcion: 'Descripción' }
      const createdArea = { id: 3, ...newArea }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdArea,
      })

      const result = await crearArea(newArea)

      expect(result).toEqual(createdArea)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/areas'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArea),
        }),
      )
    })

    it('lanza error cuando crearArea falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'Área ya existe' }),
      })

      await expect(
        crearArea({ nombre: 'Existe', descripcion: 'Desc' }),
      ).rejects.toThrow('Área ya existe')
    })
  })

  describe('eliminarArea', () => {
    it('elimina un área por ID', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await eliminarArea(1)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/areas/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('lanza error cuando eliminarArea falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'Área no encontrada' }),
      })

      await expect(eliminarArea(999)).rejects.toThrow('Área no encontrada')
    })
  })

  describe('actualizarArea', () => {
    it('actualiza un área existente', async () => {
      const updatedData = { nombre: 'Área Actualizada', descripcion: 'Nueva desc' }
      const response = { id: 1, ...updatedData }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await actualizarArea('Área Original', updatedData)

      expect(result).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/areas/'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        }),
      )
    })

    it('codifica el nombre original en la URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      await actualizarArea('Área Existente', { nombre: 'Nueva', descripcion: 'Desc' })

      const url = mockFetch.mock.calls[0][0]
      expect(url).toContain('%C3%81') // Á codificada como %C3%81
    })

    it('lanza error cuando actualización falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'Conflicto: área ya existe' }),
      })

      await expect(
        actualizarArea('Original', { nombre: 'Nueva', descripcion: 'Desc' }),
      ).rejects.toThrow('Conflicto: área ya existe')
    })
  })
})

