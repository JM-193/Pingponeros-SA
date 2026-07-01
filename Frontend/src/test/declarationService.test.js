// declarationService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerAutocompletado,
  obtenerDeclaracionActiva,
  obtenerHistorialDeclaraciones,
  obtenerDeclaracion,
  crearDeclaracion,
  guardarDeclaracion,
  completarDeclaracion,
  cancelarDeclaracion,
} from '../services/declarationService'

describe('declarationService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerAutocompletado', () => {
    it('llama al endpoint correcto y devuelve los datos', async () => {
      const payload = [{ numeroPlaza: 100, cargo: 'Analista' }]
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload })

      const result = await obtenerAutocompletado('juan@ucr.ac.cr')

      expect(result).toEqual(payload)
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/declaraciones/usuario/juan%40ucr.ac.cr/autocompletado',
      )
    })

    it('devuelve array vacío cuando el servidor responde 404', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })

      const result = await obtenerAutocompletado('nadie@ucr.ac.cr')

      expect(result).toEqual([])
    })
  })

  describe('obtenerDeclaracionActiva', () => {
    it('devuelve el detalle del borrador activo', async () => {
      const detalle = { declaracion: { id: 5 }, horario: null }
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => detalle })

      const result = await obtenerDeclaracionActiva('juan@ucr.ac.cr')

      expect(result).toEqual(detalle)
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/declaraciones/usuario/juan%40ucr.ac.cr/activa',
      )
    })

    it('devuelve null cuando no hay borrador (204)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })

      const result = await obtenerDeclaracionActiva('juan@ucr.ac.cr')

      expect(result).toBeNull()
    })
  })

  describe('obtenerHistorialDeclaraciones', () => {
    it('devuelve lista de declaraciones completadas', async () => {
      const historial = [{ id: 1, completa: 1 }, { id: 2, completa: 1 }]
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => historial })

      const result = await obtenerHistorialDeclaraciones('juan@ucr.ac.cr')

      expect(result).toEqual(historial)
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/declaraciones/usuario/juan%40ucr.ac.cr',
      )
    })

    it('devuelve array vacío cuando el servidor responde 404', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })

      const result = await obtenerHistorialDeclaraciones('nadie@ucr.ac.cr')

      expect(result).toEqual([])
    })
  })

  describe('obtenerDeclaracion', () => {
    it('devuelve el detalle de la declaración por id', async () => {
      const detalle = { declaracion: { id: 3 }, actividades: [] }
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => detalle })

      const result = await obtenerDeclaracion(3)

      expect(result).toEqual(detalle)
      expect(mockFetch.mock.calls[0][0]).toContain('/declaraciones/3')
    })

    it('lanza error cuando la declaración no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'No encontrada' }),
      })

      await expect(obtenerDeclaracion(999)).rejects.toThrow()
    })
  })

  describe('crearDeclaracion', () => {
    it('envía POST con numeroPlaza y devuelve la declaración creada', async () => {
      const creada = { id: 10 }
      mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => creada })

      const result = await crearDeclaracion('juan@ucr.ac.cr', 100)

      expect(result).toEqual(creada)
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/declaraciones/usuario/juan%40ucr.ac.cr',
      )
      expect(mockFetch.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify({ numeroPlaza: 100 }),
      })
    })

    it('lanza error cuando ya existe una declaración activa', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'Ya existe una declaración activa' }),
      })

      await expect(crearDeclaracion('juan@ucr.ac.cr', 100)).rejects.toThrow(
        'Ya existe una declaración activa',
      )
    })
  })

  describe('guardarDeclaracion', () => {
    it('envía PUT con el payload y devuelve null en 200', async () => {
      const payload = { horario: { horaEntrada: '08:00' } }
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => null })

      await guardarDeclaracion(5, payload)

      expect(mockFetch.mock.calls[0][0]).toContain('/declaraciones/5')
      expect(mockFetch.mock.calls[0][1]).toMatchObject({
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    })

    it('lanza error cuando el horario es inválido (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'Horario inválido' }),
      })

      await expect(guardarDeclaracion(5, {})).rejects.toThrow()
    })
  })

  describe('completarDeclaracion', () => {
    it('envía PUT al endpoint de completar', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => null })

      await completarDeclaracion(7)

      expect(mockFetch.mock.calls[0][0]).toContain('/declaraciones/7/completar')
      expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'PUT' })
    })

    it('lanza error cuando la declaración no cumple requisitos (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'Sin actividades' }),
      })

      await expect(completarDeclaracion(7)).rejects.toThrow('Sin actividades')
    })
  })

  describe('cancelarDeclaracion', () => {
    it('envía DELETE al endpoint de la declaración', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })

      await cancelarDeclaracion(3)

      expect(mockFetch.mock.calls[0][0]).toContain('/declaraciones/3')
      expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE' })
    })

    it('lanza error cuando la declaración no existe (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'No encontrada' }),
      })

      await expect(cancelarDeclaracion(999)).rejects.toThrow()
    })
  })
})
