// departamentoService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerDepartamentos,
  obtenerDepartamentoPorNombre,
  crearDepartamento,
  eliminarDepartamento,
  actualizarDepartamento,
} from '../services/departamentoService'

describe('departamentoService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerDepartamentos', () => {
    it('obtiene todos los departamentos', async () => {
      const mockItems = [
        { id: 1, nombre: 'Departamento 1', descripcion: 'Descripción 1' },
        { id: 2, nombre: 'Departamento 2', descripcion: 'Descripción 2' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      })

      const result = await obtenerDepartamentos()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/departamentos'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando obtenerDepartamentos falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerDepartamentos()).rejects.toThrow('Error del servidor')
    })
  })

  describe('obtenerDepartamentoPorNombre', () => {
    it('obtiene departamento por nombre', async () => {
      const mockItem = { id: 1, nombre: 'Compras', descripcion: 'Departamento de compras' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      })

      const result = await obtenerDepartamentoPorNombre('Compras')

      expect(result).toEqual(mockItem)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/departamentos/Compras'),
        expect.anything(),
      )
    })
  })

  describe('crearDepartamento', () => {
    it('crea un nuevo departamento', async () => {
      const newItem = { nombre: 'Nómina', descripcion: 'Descripción', idArea: 1 }
      const created = { id: 3, ...newItem }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => created,
      })

      const result = await crearDepartamento(newItem)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/departamentos'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        }),
      )
    })
  })

  describe('eliminarDepartamento', () => {
    it('desactiva un departamento por ID', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await eliminarDepartamento(1)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/departamentos/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('actualizarDepartamento', () => {
    it('actualiza un departamento existente', async () => {
      const updated = { nombre: 'Nuevo', descripcion: 'Desc', idArea: 2 }
      const response = { id: 1, ...updated }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })

      const result = await actualizarDepartamento('Original', updated)

      expect(result).toEqual(response)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/departamentos/'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }),
      )
    })
  })
})
