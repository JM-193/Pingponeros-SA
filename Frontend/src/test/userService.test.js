// userService.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  obtenerPlazasUsuario,
  asignarPlazaUsuario,
  desasignarPlazaUsuario,
} from '../services/userService'

describe('userService — vinculaciones plaza-usuario', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
    mockFetch.mockClear()
  })

  describe('obtenerPlazasUsuario', () => {
    it('obtiene las plazas vinculadas de un usuario', async () => {
      const plazas = [{ numeroPlaza: 1001, puestoNombre: 'Analista' }]
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => plazas })

      const result = await obtenerPlazasUsuario('ana@ucr.ac.cr')

      expect(result).toEqual(plazas)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/usuarios/ana%40ucr.ac.cr/plazas'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('devuelve un arreglo vacío cuando el usuario no tiene plazas (404)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })

      const result = await obtenerPlazasUsuario('sinplazas@ucr.ac.cr')

      expect(result).toEqual([])
    })

    it('lanza error cuando el servidor falla', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ mensaje: 'Error del servidor' }),
      })

      await expect(obtenerPlazasUsuario('ana@ucr.ac.cr')).rejects.toThrow('Error del servidor')
    })
  })

  describe('asignarPlazaUsuario', () => {
    it('vincula una plaza a un usuario', async () => {
      const datos = {
        numeroPlaza: 1001,
        idPuesto: 5,
        idClaseOcupacional: 10,
        lugarTrabajo: 'Oficina Central',
        fechaInicio: '2026-01-01',
        fechaFinal: null,
      }
      mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ mensaje: 'ok' }) })

      await asignarPlazaUsuario('ana@ucr.ac.cr', datos)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/usuarios/ana%40ucr.ac.cr/plazas'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify(datos) }),
      )
    })

    it('lanza error cuando la plaza ya está asignada', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ mensaje: 'La plaza ya tiene una asignación activa.' }),
      })

      await expect(asignarPlazaUsuario('ana@ucr.ac.cr', {}))
        .rejects.toThrow('La plaza ya tiene una asignación activa.')
    })
  })

  describe('desasignarPlazaUsuario', () => {
    it('desvincula una plaza de un usuario', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ mensaje: 'ok' }) })

      await desasignarPlazaUsuario('ana@ucr.ac.cr', 1001)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/usuarios/ana%40ucr.ac.cr/plazas/1001'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('lanza error cuando la plaza no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ mensaje: 'No se encontró la asignación.' }),
      })

      await expect(desasignarPlazaUsuario('ana@ucr.ac.cr', 9999))
        .rejects.toThrow('No se encontró la asignación.')
    })
  })
})
