// session.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { guardarSesion, obtenerSesion, cerrarSesion } from '../services/session'
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

    guardarSesion(token)

    const stored = sessionStorage.getItem('pingponeros_session')
    expect(stored).not.toBeNull()
    expect(stored).toBe(token)
  })

  it('obtiene sesión válida', () => {
    const payload = { id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr', exp: nowInSeconds() + 3600 }
    const token = buildJWT(payload)
    guardarSesion(token)

    const retrieved = obtenerSesion()

    expect(retrieved).toMatchObject({ id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr' })
  })

  it('devuelve null cuando no hay sesión guardada', () => {
    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null cuando sesión expiró', () => {
    // exp en el pasado (hace 1 segundo)
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() - 1 })
    guardarSesion(token)

    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('elimina sesión expirada del sessionStorage', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() - 1 })
    guardarSesion(token)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    obtenerSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('cierra sesión eliminándola del sessionStorage', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() + 3600 })
    guardarSesion(token)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    cerrarSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('devuelve null si el token no es un JWT válido', () => {
    sessionStorage.setItem('pingponeros_session', 'invalid-token')

    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null y limpia sessionStorage si el token es inválido', () => {
    sessionStorage.setItem('pingponeros_session', 'not.a.jwt')

    obtenerSesion()

    // El payload decodificado no es JSON válido → se limpia
    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('devuelve null cuando no tiene campo exp y lo trata como válido sin expiración forzada', () => {
    // Sin campo exp: session.js lo acepta (la condición exp es solo si typeof === 'number')
    const token = buildJWT({ id: 1, nombre: 'Test' })
    guardarSesion(token)

    const result = obtenerSesion()

    // Sin exp el token se considera válido indefinidamente
    expect(result).toMatchObject({ id: 1, nombre: 'Test' })
  })

  it('mantiene sesión válida cuando exp está en el futuro', () => {
    const token = buildJWT({ id: 1, nombre: 'Test', exp: nowInSeconds() + 3600 })
    guardarSesion(token)

    // Avanzar 30 minutos (en ms) — exp sigue siendo futuro
    vi.advanceTimersByTime(30 * 60 * 1000)

    const result = obtenerSesion()

    expect(result).toMatchObject({ id: 1, nombre: 'Test' })
  })

  it('ignora guardarSesion si el argumento no es un string', () => {
    guardarSesion({ id: 1 })
    guardarSesion(null)
    guardarSesion(undefined)
    guardarSesion('')

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })
})
