import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene todas las áreas de la base de datos.
 * @returns {Promise<Array>} Lista de áreas.
 */
export async function obtenerAreas() {
  return apiFetch('/areas', { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Obtiene un área por nombre.
 * @param {string} nombre - Nombre del área
 * @returns {Promise<object>} El área encontrada.
 */
export async function obtenerAreaPorNombre(nombre) {
  return apiFetch(`/areas/${encodeURIComponent(nombre)}`, { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Crea una nueva área en la base de datos.
 * @param {{ nombre: string, descripcion: string, estado?: number }} datos
 * @returns {Promise<object>} El área creada.
 */
export async function crearArea(datos) {
  return apiFetch('/areas', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Elimina un área por ID.
 * @param {number} id - ID del área a eliminar
 * @returns {Promise<void>}
 */
export async function eliminarArea(id) {
  await apiFetch(`/areas/${id}`, { method: 'DELETE' })
}

/**
 * Actualiza un área existente por nombre.
 * @param {string} nombreOriginal - Nombre original del área
 * @param {{ nombre: string, descripcion: string, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} El área actualizada.
 */
export async function actualizarArea(nombreOriginal, datos) {
  return apiFetch(`/areas/${encodeURIComponent(nombreOriginal)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}
