// session.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as SessionService from '../services/session'
import { buildJWT, nowInSeconds } from './helpers/jwtTestHelper'

describe('session service', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('guarda sesión en sessionStorage', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })

    SessionService.guardarSesion(token)

    const stored = sessionStorage.getItem('pingponeros_session')
    expect(stored).not.toBeNull()
    expect(stored).toBe(token)
  })

  it('obtiene sesión válida', () => {
    const payload = { id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 }
    const token = buildJWT(payload)
    SessionService.guardarSesion(token)

    const retrieved = SessionService.obtenerSesion()

    expect(retrieved).toMatchObject({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr' })
  })

  it('devuelve null cuando no hay sesión guardada', () => {
    const result = SessionService.obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null cuando sesión expiró', () => {
    // exp en el pasado (hace 1 segundo)
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() - 1 })
    SessionService.guardarSesion(token)

    const result = SessionService.obtenerSesion()

    expect(result).toBeNull()
  })

  it('elimina sesión expirada del sessionStorage', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() - 1 })
    SessionService.guardarSesion(token)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    SessionService.obtenerSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('cierra sesión eliminándola del sessionStorage', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    SessionService.cerrarSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('devuelve null si el token no es un JWT válido', () => {
    sessionStorage.setItem('pingponeros_session', 'invalid-token')

    const result = SessionService.obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null y limpia sessionStorage si el token es inválido', () => {
    sessionStorage.setItem('pingponeros_session', 'not.a.jwt')

    SessionService.obtenerSesion()

    // El payload decodificado no es JSON válido → se limpia
    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('devuelve null cuando no tiene campo exp y lo trata como válido sin expiración forzada', () => {
    // Sin campo exp: session.js lo acepta (la condición exp es solo si typeof === 'number')
    const token = buildJWT({ id: 1, nombre: 'Test' })
    SessionService.guardarSesion(token)

    const result = SessionService.obtenerSesion()

    // Sin exp el token se considera válido indefinidamente
    expect(result).toMatchObject({ id: 1, nombre: 'Test' })
  })

  it('mantiene sesión válida cuando exp está en el futuro', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token)

    // Avanzar 30 minutos (en ms) — exp sigue siendo futuro
    vi.advanceTimersByTime(30 * 60 * 1000)

    const result = SessionService.obtenerSesion()

    expect(result).toMatchObject({ id: 1, nombre: 'Test' })
  })

  it('ignora guardarSesion si el argumento no es un string', () => {
    SessionService.guardarSesion({ id: 1 })
    SessionService.guardarSesion(null)
    SessionService.guardarSesion(undefined)
    SessionService.guardarSesion('')

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('asigna el item TEMP_PW_KEY = \'1\' si la contraseña es temporal', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token, true)

    const storedTemp = sessionStorage.getItem('pingponeros_temp_password')
    expect(storedTemp).toBe('1')
  })

 it('retorna el token si es válido', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token)

    const result = SessionService.obtenerToken()

    expect(result).toBe(token)
  })

  it('retorna null si el token no es válido', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token)

    // Avanzar 2 horas (en ms) — exp ya pasó
    vi.advanceTimersByTime(2 * 60 * 60 * 1000)

    const result = SessionService.obtenerToken()

    expect(result).toBeNull()
  })

 it('retorna null si no hay sesión guardada', () => {
    const result = SessionService.obtenerToken()

    expect(result).toBeNull()
 })

 it('retorna true si la contraseña es temporal y el token es válido', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token, true)

    const result = SessionService.esContrasenaTemporal()

    expect(result).toBe(true)
 })

  it('retorna false si la contraseña no es temporal y el token es válido', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token, false)

    const result = SessionService.esContrasenaTemporal()

    expect(result).toBe(false)
  })

  it ('retorna false si el token es inválido aunque la contraseña sea temporal', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', correo: 'test"@ucr.ac.cr', exp: nowInSeconds() + 3600 })
    SessionService.guardarSesion(token, true)

    // Avanzar 2 horas (en ms) — exp ya pasó
    vi.advanceTimersByTime(2 * 60 * 60 * 1000)

    const result = SessionService.esContrasenaTemporal()

    expect(result).toBe(false)
  })
})
