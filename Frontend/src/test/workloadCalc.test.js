// workloadCalc.test.js
import { describe, it, expect } from 'vitest'
import {
  actividadMinutosSemanales,
  totalMinutosSemanales,
  evaluarCarga,
} from '../utils/workloadCalc'

describe('actividadMinutosSemanales', () => {
  it('calcula minutos semanales para actividad Diaria', () => {
    const act = { periodicidad: 'Diario', vecesRealizadas: 1, duracion: 30 }
    // factor Diario = 6 → 30 * 1 * 6 = 180
    expect(actividadMinutosSemanales(act)).toBeCloseTo(180)
  })

  it('calcula minutos semanales para actividad Semanal', () => {
    const act = { periodicidad: 'Semanal', vecesRealizadas: 3, duracion: 60 }
    // factor Semanal = 1 → 60 * 3 * 1 = 180
    expect(actividadMinutosSemanales(act)).toBeCloseTo(180)
  })

  it('calcula minutos semanales para actividad Mensual', () => {
    const act = { periodicidad: 'Mensual', vecesRealizadas: 1, duracion: 120 }
    // factor Mensual ≈ 1/4.33
    expect(actividadMinutosSemanales(act)).toBeCloseTo(120 / 4.33)
  })

  it('devuelve 0 si la periodicidad es desconocida', () => {
    const act = { periodicidad: 'Quincenal', vecesRealizadas: 2, duracion: 60 }
    expect(actividadMinutosSemanales(act)).toBe(0)
  })

  it('devuelve 0 si la actividad es null', () => {
    expect(actividadMinutosSemanales(null)).toBe(0)
  })

  it('devuelve 0 si vecesRealizadas es 0', () => {
    const act = { periodicidad: 'Diario', vecesRealizadas: 0, duracion: 60 }
    expect(actividadMinutosSemanales(act)).toBe(0)
  })

  it('devuelve 0 si duracion es 0', () => {
    const act = { periodicidad: 'Diario', vecesRealizadas: 5, duracion: 0 }
    expect(actividadMinutosSemanales(act)).toBe(0)
  })
})

describe('totalMinutosSemanales', () => {
  it('devuelve 0 para lista vacía', () => {
    expect(totalMinutosSemanales([])).toBe(0)
  })

  it('devuelve 0 para lista null', () => {
    expect(totalMinutosSemanales(null)).toBe(0)
  })

  it('suma los minutos semanales de varias actividades', () => {
    const actividades = [
      { periodicidad: 'Semanal', vecesRealizadas: 2, duracion: 60 },
      { periodicidad: 'Semanal', vecesRealizadas: 1, duracion: 30 },
    ]
    // 120 + 30 = 150
    expect(totalMinutosSemanales(actividades)).toBeCloseTo(150)
  })
})

describe('evaluarCarga', () => {
  const actividadBase = [{ periodicidad: 'Semanal', vecesRealizadas: 2, duracion: 60 }]
  // 120 min semanales

  it('devuelve nivel "ok" cuando la carga está dentro del límite', () => {
    // Tiempo Completo = 48h → 2880 min base, carga 120 min → ratio muy bajo
    const { nivel } = evaluarCarga(actividadBase, 'Tiempo Completo')
    expect(nivel).toBe('ok')
  })

  it('devuelve nivel "excede1" cuando la carga supera las horas base', () => {
    // 1/4 de Tiempo = 12h → 720 min base, carga 780 min (>1x pero <1.5x)
    const actividades = [{ periodicidad: 'Semanal', vecesRealizadas: 13, duracion: 60 }]
    const { nivel } = evaluarCarga(actividades, '1/4 de Tiempo')
    expect(nivel).toBe('excede1')
  })

  it('devuelve nivel "excede15" cuando la carga supera 1.5x las horas base', () => {
    // 1/4 de Tiempo = 12h → 720 min, carga 1200 min (>1.5x)
    const actividades = [{ periodicidad: 'Semanal', vecesRealizadas: 20, duracion: 60 }]
    const { nivel } = evaluarCarga(actividades, '1/4 de Tiempo')
    expect(nivel).toBe('excede15')
  })

  it('devuelve nivel "ok" cuando la jornada no existe en la tabla', () => {
    const { nivel, baseMin } = evaluarCarga(actividadBase, 'Jornada Desconocida')
    expect(baseMin).toBe(0)
    expect(nivel).toBe('ok')
  })

  it('expone totalMin y baseMin correctamente', () => {
    const { totalMin, baseMin } = evaluarCarga(actividadBase, 'Tiempo Completo')
    expect(totalMin).toBeCloseTo(120)
    expect(baseMin).toBe(48 * 60)
  })
})
