import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene todas las unidades.
 * @returns {Promise<Array>} Lista de unidades.
 */
export async function obtenerUnidades() {
  return apiFetch('/unidades', { method: 'GET', headers: JSON_HEADERS }, { emptyArrayOn404: true })
}

/**
 * Obtiene una unidad por nombre.
 * @param {string} nombre - Nombre de la unidad
 * @returns {Promise<object>} La unidad encontrada.
 */
export async function obtenerUnidadPorNombre(nombre) {
  return apiFetch(`/unidades/${encodeURIComponent(nombre)}`, { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Crea una nueva unidad.
 * @param {{ nombre: string, descripcion: string, idArea: number, idDepartamento?: number, idSeccion?: number, estado?: number }} datos
 * @returns {Promise<object>} La unidad creada.
 */
export async function crearUnidad(datos) {
  return apiFetch('/unidades', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Desactiva una unidad por ID.
 * @param {number} id - ID de la unidad a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarUnidad(id) {
  await apiFetch(`/unidades/${id}`, { method: 'DELETE' })
}

/**
 * Actualiza una unidad existente por nombre.
 * @param {string} nombreOriginal - Nombre original de la unidad
 * @param {{ nombre: string, descripcion: string, idArea: number, idDepartamento?: number, idSeccion?: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} La unidad actualizada.
 */
export async function actualizarUnidad(nombreOriginal, datos) {
  return apiFetch(`/unidades/${encodeURIComponent(nombreOriginal)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}
