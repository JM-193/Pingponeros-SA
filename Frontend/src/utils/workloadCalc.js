import { JORNADA_HORAS, PERIODICIDAD_FACTOR_SEMANAL } from '../constants/declaracion'

// Minutos semanales que consume una actividad: duración (min) × veces × factor de periodicidad.
export function actividadMinutosSemanales(actividad) {
  const factor = PERIODICIDAD_FACTOR_SEMANAL[actividad?.periodicidad] ?? 0
  const veces = Number(actividad?.vecesRealizadas) || 0
  const duracion = Number(actividad?.duracion) || 0
  return duracion * veces * factor
}

export function totalMinutosSemanales(actividades) {
  return (actividades ?? []).reduce((suma, a) => suma + actividadMinutosSemanales(a), 0)
}

/**
 * Compara la carga total de las actividades con las horas de la jornada y devuelve el nivel de aviso.
 * nivel: 'ok' | 'excede1' (> 1×) | 'excede15' (> 1.5×). Es solo informativo (no bloquea).
 */
export function evaluarCarga(actividades, jornadaLaboral) {
  const totalMin = totalMinutosSemanales(actividades)
  const horas = JORNADA_HORAS[jornadaLaboral]
  const baseMin = horas ? horas * 60 : 0
  const ratio = baseMin > 0 ? totalMin / baseMin : 0

  let nivel = 'ok'
  if (baseMin > 0 && ratio > 1.5) nivel = 'excede15'
  else if (baseMin > 0 && ratio > 1) nivel = 'excede1'

  return { totalMin, baseMin, ratio, nivel }
}
