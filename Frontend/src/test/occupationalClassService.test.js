// occupationalClassService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerClasesOcupacionales,
  crearClaseOcupacional,
  eliminarClaseOcupacional,
} from '../services/occupationalClassService'

describe('occupationalClassService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerClasesOcupacionales', () => {
    it('obtiene todas las clases ocupacionales', async () => {
      const mockItems = [
        { idClaseOcupacional: 1, codigo: 100, nombre: 'Profesional 1' },
        { idClaseOcupacional: 2, codigo: 200, nombre: 'Tecnico' },
      ]

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockItems })

      const result = await obtenerClasesOcupacionales()

      expect(result).toEqual(mockItems)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clases-ocupacionales'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerClasesOcupacionales()).rejects.toThrow('Error del servidor')
    })
  })

  describe('crearClaseOcupacional', () => {
    it('crea una nueva clase ocupacional', async () => {
      const datos = { codigo: 100, nombre: 'Profesional 1' }
      const created = { idClaseOcupacional: 1, ...datos }

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => created })

      const result = await crearClaseOcupacional(datos)

      expect(result).toEqual(created)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clases-ocupacionales'),
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
        json: async () => ({ mensaje: 'Ya existe una clase ocupacional con ese nombre.' }),
      })

      await expect(crearClaseOcupacional({ codigo: 100, nombre: 'Profesional 1' }))
        .rejects.toThrow('Ya existe una clase ocupacional con ese nombre.')
    })

    it('usa código de error genérico cuando ningún campo existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(crearClaseOcupacional({ codigo: 1, nombre: 'x' }))
        .rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('eliminarClaseOcupacional', () => {
    it('elimina una clase ocupacional por id', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

      await eliminarClaseOcupacional(5)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clases-ocupacionales/5'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('lanza error cuando la clase está asociada a plazas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'La clase ocupacional está asociada a una o más plazas y no puede eliminarse.' }),
      })

      await expect(eliminarClaseOcupacional(5))
        .rejects.toThrow('La clase ocupacional está asociada a una o más plazas y no puede eliminarse.')
    })

    it('lanza error cuando la clase no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró la clase ocupacional.' }),
      })

      await expect(eliminarClaseOcupacional(999))
        .rejects.toThrow('No se encontró la clase ocupacional.')
    })
  })
})
