const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todos los departamentos.
 * @returns {Promise<Array>} Lista de departamentos.
 */
export async function obtenerDepartamentos() {
  const response = await fetch(`${API_URL}/departamentos`, {
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
 * Obtiene un departamento por nombre.
 * @param {string} nombre - Nombre del departamento
 * @returns {Promise<object>} El departamento encontrado.
 */
export async function obtenerDepartamentoPorNombre(nombre) {
  const response = await fetch(`${API_URL}/departamentos/${encodeURIComponent(nombre)}`, {
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
 * Crea un nuevo departamento.
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos
 * @returns {Promise<object>} El departamento creado.
 */
export async function crearDepartamento(datos) {
  const response = await fetch(`${API_URL}/departamentos`, {
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
 * Desactiva un departamento por ID.
 * @param {number} id - ID del departamento a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarDepartamento(id) {
  const response = await fetch(`${API_URL}/departamentos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }
}

/**
 * Actualiza un departamento existente por nombre.
 * @param {string} nombreOriginal - Nombre original del departamento
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} El departamento actualizado.
 */
export async function actualizarDepartamento(nombreOriginal, datos) {
  const response = await fetch(`${API_URL}/departamentos/${encodeURIComponent(nombreOriginal)}`, {
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
