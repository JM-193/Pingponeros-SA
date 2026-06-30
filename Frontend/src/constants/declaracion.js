// Constantes del formulario de declaración jurada (cargas de trabajo).

// Jornadas laborales y sus horas semanales (base para el chequeo de carga 1x / 1.5x).
export const JORNADA_OPTIONS = [
  { value: 'Tiempo Completo', label: 'Tiempo Completo', horas: 48 },
  { value: '3/4 de Tiempo', label: '3/4 de Tiempo', horas: 36 },
  { value: 'Medio Tiempo', label: 'Medio Tiempo', horas: 24 },
  { value: '1/4 de Tiempo', label: '1/4 de Tiempo', horas: 12 },
]

export const JORNADA_HORAS = Object.fromEntries(JORNADA_OPTIONS.map((o) => [o.value, o.horas]))

// Periodicidad de las actividades y su factor de conversión a "veces por semana"
// (6 días laborales/semana, 4.33 semanas/mes).
export const PERIODICIDAD_OPTIONS = [
  { value: 'Diario', label: 'Diario' },
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Trimestral', label: 'Trimestral' },
  { value: 'Semestral', label: 'Semestral' },
  { value: 'Anual', label: 'Anual' },
]

export const PERIODICIDAD_FACTOR_SEMANAL = {
  Diario: 6,
  Semanal: 1,
  Mensual: 1 / 4.33,
  Trimestral: 1 / 13,
  Semestral: 1 / 26,
  Anual: 1 / 52,
}

// Tipos de función (valor exacto persistido en ACTIVIDADES.Tipo_Funcion).
export const TIPO_FUNCION = {
  PROPIA: 'Propia de mi puesto',
  OTRO: 'De otro puesto',
  APOYO: 'De apoyo ocasional',
  DEFINIDA: 'Definida por mí',
}

export const TIPO_FUNCION_OPTIONS = [
  { value: TIPO_FUNCION.PROPIA, label: 'Propia de mi puesto' },
  { value: TIPO_FUNCION.OTRO, label: 'De otro puesto' },
  { value: TIPO_FUNCION.APOYO, label: 'De apoyo ocasional' },
  { value: TIPO_FUNCION.DEFINIDA, label: 'Definida por mí' },
]
