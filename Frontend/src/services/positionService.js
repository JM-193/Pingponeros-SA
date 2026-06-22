import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene todas las plazas.
 * @returns {Promise<Array>} Lista de plazas.
 */
export async function obtenerPlazas() {
  return apiFetch('/plazas', { method: 'GET', headers: JSON_HEADERS }, { emptyArrayOn404: true })
}

/**
 * Crea una nueva plaza.
 * @param {{ numeroPlaza: number, idUnidad?: number, idDepartamento?: number, idSeccion?: number, idArea?: number }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function crearPlaza(datos) {
  return apiFetch('/plazas', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Obtiene una plaza por número.
 * @param {number} numeroPlaza
 * @returns {Promise<object>} Datos de la plaza.
 */
export async function obtenerPlazaPorNumero(numeroPlaza) {
  return apiFetch(`/plazas/${numeroPlaza}`, { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Actualiza las asignaciones de una plaza existente.
 * @param {number} numeroPlaza
 * @param {{ idUnidad?: number, idDepartamento?: number, idSeccion?: number, idArea?: number }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function actualizarPlaza(numeroPlaza, datos) {
  return apiFetch(`/plazas/${numeroPlaza}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}
