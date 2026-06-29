// tiempo.test.js
import { describe, it, expect } from 'vitest'
import { hhmmAMinutos, minutosAHHMM, formatearMinutos } from '../utils/tiempo'

describe('hhmmAMinutos', () => {
  it('convierte "08:30" en 510 minutos', () => {
    expect(hhmmAMinutos('08:30')).toBe(510)
  })

  it('convierte "00:00" en 0 minutos', () => {
    expect(hhmmAMinutos('00:00')).toBe(0)
  })

  it('convierte "01:01" en 61 minutos', () => {
    expect(hhmmAMinutos('01:01')).toBe(61)
  })

  it('devuelve null si el argumento no es string', () => {
    expect(hhmmAMinutos(830)).toBeNull()
    expect(hhmmAMinutos(null)).toBeNull()
    expect(hhmmAMinutos(undefined)).toBeNull()
  })

  it('devuelve null si el string no contiene dos puntos', () => {
    expect(hhmmAMinutos('0830')).toBeNull()
    expect(hhmmAMinutos('')).toBeNull()
  })

  it('devuelve null si alguna parte no es número', () => {
    expect(hhmmAMinutos('ab:00')).toBeNull()
    expect(hhmmAMinutos('08:xx')).toBeNull()
  })
})

describe('minutosAHHMM', () => {
  it('convierte 0 en "00:00"', () => {
    expect(minutosAHHMM(0)).toBe('00:00')
  })

  it('convierte 60 en "01:00"', () => {
    expect(minutosAHHMM(60)).toBe('01:00')
  })

  it('convierte 90 en "01:30"', () => {
    expect(minutosAHHMM(90)).toBe('01:30')
  })

  it('convierte 510 en "08:30"', () => {
    expect(minutosAHHMM(510)).toBe('08:30')
  })

  it('trata valores negativos como 0', () => {
    expect(minutosAHHMM(-10)).toBe('00:00')
  })

  it('trata null y NaN como 0', () => {
    expect(minutosAHHMM(null)).toBe('00:00')
    expect(minutosAHHMM(NaN)).toBe('00:00')
  })

  it('redondea fracciones', () => {
    expect(minutosAHHMM(1.6)).toBe('00:02')
  })
})

describe('formatearMinutos', () => {
  it('devuelve "0 min" para 0 minutos', () => {
    expect(formatearMinutos(0)).toBe('0 min')
  })

  it('devuelve solo minutos cuando son menos de 60', () => {
    expect(formatearMinutos(30)).toBe('30 min')
    expect(formatearMinutos(45)).toBe('45 min')
  })

  it('devuelve solo horas cuando los minutos son exactamente 0', () => {
    expect(formatearMinutos(60)).toBe('1 h')
    expect(formatearMinutos(120)).toBe('2 h')
  })

  it('devuelve horas y minutos cuando ambos son distintos de cero', () => {
    expect(formatearMinutos(90)).toBe('1 h 30 min')
    expect(formatearMinutos(150)).toBe('2 h 30 min')
  })

  it('trata valores negativos y nulos como 0', () => {
    expect(formatearMinutos(-5)).toBe('0 min')
    expect(formatearMinutos(null)).toBe('0 min')
  })
})
