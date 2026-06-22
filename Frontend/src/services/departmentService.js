import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene todos los departamentos.
 * @returns {Promise<Array>} Lista de departamentos.
 */
export async function obtenerDepartamentos() {
  return apiFetch('/departamentos', { method: 'GET', headers: JSON_HEADERS }, { emptyArrayOn404: true })
}

/**
 * Obtiene un departamento por nombre.
 * @param {string} nombre - Nombre del departamento
 * @returns {Promise<object>} El departamento encontrado.
 */
export async function obtenerDepartamentoPorNombre(nombre) {
  return apiFetch(`/departamentos/${encodeURIComponent(nombre)}`, { method: 'GET', headers: JSON_HEADERS })
}

/**
 * Crea un nuevo departamento.
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos
 * @returns {Promise<object>} El departamento creado.
 */
export async function crearDepartamento(datos) {
  return apiFetch('/departamentos', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Desactiva un departamento por ID.
 * @param {number} id - ID del departamento a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarDepartamento(id) {
  await apiFetch(`/departamentos/${id}`, { method: 'DELETE' })
}

/**
 * Actualiza un departamento existente por nombre.
 * @param {string} nombreOriginal - Nombre original del departamento
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} El departamento actualizado.
 */
export async function actualizarDepartamento(nombreOriginal, datos) {
  return apiFetch(`/departamentos/${encodeURIComponent(nombreOriginal)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}
