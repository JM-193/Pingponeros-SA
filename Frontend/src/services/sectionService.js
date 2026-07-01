import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene todas las secciones.
 * @returns {Promise<Array>} Lista de secciones.
 */
export async function obtenerSecciones() {
  return apiFetch('/secciones', { method: 'GET', headers: JSON_HEADERS }, { emptyArrayOn404: true })
}

/**
 * Obtiene una sección por nombre.
 * @param {string} nombre - Nombre de la sección
 * @returns {Promise<object>} La sección encontrada.
 */
export async function obtenerSeccionPorNombre(nombre) {
  return apiFetch(`/secciones/${encodeURIComponent(nombre)}`, { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Crea una nueva sección.
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos
 * @returns {Promise<object>} La sección creada.
 */
export async function crearSeccion(datos) {
  return apiFetch('/secciones', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Desactiva una sección por ID.
 * @param {number} id - ID de la sección a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarSeccion(id) {
  await apiFetch(`/secciones/${id}`, { method: 'DELETE' })
}

/**
 * Actualiza una sección existente por nombre.
 * @param {string} nombreOriginal - Nombre original de la sección
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} La sección actualizada.
 */
export async function actualizarSeccion(nombreOriginal, datos) {
  return apiFetch(`/secciones/${encodeURIComponent(nombreOriginal)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}
