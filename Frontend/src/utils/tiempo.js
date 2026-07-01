// Conversión entre el formato HH:MM de los selectores de tiempo y minutos enteros (lo que persiste el backend).

export function hhmmAMinutos(hhmm) {
  if (typeof hhmm !== 'string' || !hhmm.includes(':')) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function minutosAHHMM(min) {
  const total = Math.max(0, Math.round(Number(min) || 0))
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Muestra una cantidad de minutos como "Xh Ymin" para los resúmenes de carga.
export function formatearMinutos(min) {
  const total = Math.max(0, Math.round(Number(min) || 0))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
