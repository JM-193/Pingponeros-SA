// session.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { guardarSesion, obtenerSesion, cerrarSesion } from '../services/session'

describe('session service', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('guarda sesión en sessionStorage', () => {
    const usuario = { id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr' }

    guardarSesion(usuario)

    const stored = sessionStorage.getItem('pingponeros_session')
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored)
    expect(parsed.usuario).toEqual(usuario)
  })

  it('obtiene sesión válida', () => {
    const usuario = { id: 1, nombre: 'Test', correo: 'test@ucr.ac.cr' }
    guardarSesion(usuario)

    const retrieved = obtenerSesion()

    expect(retrieved).toEqual(usuario)
  })

  it('devuelve null cuando no hay sesión guardada', () => {
    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null cuando sesión expiró', () => {
    const usuario = { id: 1, nombre: 'Test' }
    guardarSesion(usuario)

    // Avanzar tiempo más de 1 hora
    vi.advanceTimersByTime(61 * 60 * 1000)

    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('elimina sesión expirada del sessionStorage', () => {
    const usuario = { id: 1, nombre: 'Test' }
    guardarSesion(usuario)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    vi.advanceTimersByTime(61 * 60 * 1000)

    obtenerSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('cierra sesión eliminándola del sessionStorage', () => {
    const usuario = { id: 1, nombre: 'Test' }
    guardarSesion(usuario)

    expect(sessionStorage.getItem('pingponeros_session')).not.toBeNull()

    cerrarSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('devuelve null si JSON es inválido en sessionStorage', () => {
    sessionStorage.setItem('pingponeros_session', 'invalid json')

    const result = obtenerSesion()

    expect(result).toBeNull()
  })

  it('devuelve null y limpia sessionStorage si JSON inválido', () => {
    sessionStorage.setItem('pingponeros_session', '{invalid')

    obtenerSesion()

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
  })

  it('guarda timestamp de expiración', () => {
    const usuario = { id: 1 }
    const now = Date.now()

    guardarSesion(usuario)

    const stored = JSON.parse(sessionStorage.getItem('pingponeros_session'))
    expect(stored.expira).toBeGreaterThan(now)
  })

  it('mantiene sesión válida dentro de 1 hora', () => {
    const usuario = { id: 1, nombre: 'Test' }
    guardarSesion(usuario)

    // Avanzar 30 minutos
    vi.advanceTimersByTime(30 * 60 * 1000)

    const result = obtenerSesion()

    expect(result).toEqual(usuario)
  })
})

