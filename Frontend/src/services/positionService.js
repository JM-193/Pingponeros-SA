// positionService.js
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todas las plazas.
 * @returns {Promise<Array>} Lista de plazas.
 */
export async function obtenerPlazas() {
  const response = await fetch(`${API_URL}/plazas`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}

/**
 * Crea una nueva plaza.
 * @param {{ numeroPlaza: number, idUnidad?: number, idDepartamento?: number, idSeccion?: number, idArea?: number }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function crearPlaza(datos) {
  const response = await fetch(`${API_URL}/plazas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}

/**
 * Obtiene una plaza por número.
 * @param {number} numeroPlaza
 * @returns {Promise<object>} Datos de la plaza.
 */
export async function obtenerPlazaPorNumero(numeroPlaza) {
  const response = await fetch(`${API_URL}/plazas/${numeroPlaza}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}

/**
 * Actualiza las asignaciones de una plaza existente.
 * @param {number} numeroPlaza
 * @param {{ idUnidad?: number, idDepartamento?: number, idSeccion?: number, idArea?: number }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function actualizarPlaza(numeroPlaza, datos) {
  const response = await fetch(`${API_URL}/plazas/${numeroPlaza}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}
