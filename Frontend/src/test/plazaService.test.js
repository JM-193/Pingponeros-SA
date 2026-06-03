// plazaService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerPlazas,
  crearPlaza,
  obtenerPlazaPorNumero,
  actualizarPlaza,
} from '../services/plazaService'

describe('plazaService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerPlazas', () => {
    it('obtiene todas las plazas', async () => {
      const mockPlazas = [
        { numeroPlaza: 1, idUnidad: 1, idArea: 1 },
        { numeroPlaza: 2, idDepartamento: 2, idArea: 1 },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlazas,
      })

      const result = await obtenerPlazas()

      expect(result).toEqual(mockPlazas)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/plazas'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('retorna arreglo vacío cuando la respuesta es 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'No existen plazas' }),
      })

      const result = await obtenerPlazas()
      expect(result).toEqual([])
    })

    it('lanza error cuando obtenerPlazas falla con código distinto de 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerPlazas()).rejects.toThrow('Error del servidor')
    })

    it('usa detail si mensaje no existe en el error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Fallo interno' }),
      })

      await expect(obtenerPlazas()).rejects.toThrow('Fallo interno')
    })

    it('usa title si detail y mensaje no existen', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ title: 'Error inesperado' }),
      })

      await expect(obtenerPlazas()).rejects.toThrow('Error inesperado')
    })

    it('genera error genérico cuando JSON falla en error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => { throw new Error('Invalid JSON') },
      })

      await expect(obtenerPlazas()).rejects.toThrow('Error inesperado (503)')
    })
  })

  describe('crearPlaza', () => {
    it('crea una nueva plaza con todos los campos', async () => {
      const nuevaPlaza = {
        numeroPlaza: 10,
        idUnidad: 1,
        idDepartamento: 2,
        idSeccion: null,
        idArea: 3,
      }
      const respuesta = { ...nuevaPlaza }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => respuesta,
      })

      const result = await crearPlaza(nuevaPlaza)

      expect(result).toEqual(respuesta)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/plazas'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaPlaza),
        }),
      )
    })

    it('lanza error con mensaje del backend al crear', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'La plaza ya existe' }),
      })

      await expect(crearPlaza({ numeroPlaza: 1 })).rejects.toThrow('La plaza ya existe')
    })

    it('usa detail si mensaje no existe en el error de crearPlaza', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Datos inválidos' }),
      })

      await expect(crearPlaza({ numeroPlaza: 0 })).rejects.toThrow('Datos inválidos')
    })

    it('genera error genérico cuando JSON falla al crear', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON') },
      })

      await expect(crearPlaza({ numeroPlaza: 5 })).rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('obtenerPlazaPorNumero', () => {
    it('obtiene una plaza por su número', async () => {
      const plaza = { numeroPlaza: 7, idUnidad: 2, idArea: 1 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => plaza,
      })

      const result = await obtenerPlazaPorNumero(7)

      expect(result).toEqual(plaza)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/plazas/7'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('lanza error cuando la plaza no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Plaza no encontrada' }),
      })

      await expect(obtenerPlazaPorNumero(999)).rejects.toThrow('Plaza no encontrada')
    })

    it('genera error genérico cuando JSON falla al obtener por número', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON') },
      })

      await expect(obtenerPlazaPorNumero(1)).rejects.toThrow('Error inesperado (500)')
    })
  })

  describe('actualizarPlaza', () => {
    it('actualiza las asignaciones de una plaza', async () => {
      const datos = { idUnidad: 3, idArea: 2, idDepartamento: null, idSeccion: null }
      const respuesta = { numeroPlaza: 5, ...datos }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => respuesta,
      })

      const result = await actualizarPlaza(5, datos)

      expect(result).toEqual(respuesta)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/plazas/5'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        }),
      )
    })

    it('lanza error cuando la actualización falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'Datos de plaza inválidos' }),
      })

      await expect(actualizarPlaza(5, {})).rejects.toThrow('Datos de plaza inválidos')
    })

    it('usa title si detail y mensaje no existen al actualizar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ title: 'Unprocessable Entity' }),
      })

      await expect(actualizarPlaza(5, {})).rejects.toThrow('Unprocessable Entity')
    })

    it('genera error genérico cuando JSON falla al actualizar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON') },
      })

      await expect(actualizarPlaza(5, {})).rejects.toThrow('Error inesperado (500)')
    })
  })
})
