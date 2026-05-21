const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todas las secciones.
 * @returns {Promise<Array>} Lista de secciones.
 */
export async function obtenerSecciones() {
  const response = await fetch(`${API_URL}/secciones`, {
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
 * Obtiene una sección por nombre.
 * @param {string} nombre - Nombre de la sección
 * @returns {Promise<object>} La sección encontrada.
 */
export async function obtenerSeccionPorNombre(nombre) {
  const response = await fetch(`${API_URL}/secciones/${encodeURIComponent(nombre)}`, {
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
 * Crea una nueva sección.
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos
 * @returns {Promise<object>} La sección creada.
 */
export async function crearSeccion(datos) {
  const response = await fetch(`${API_URL}/secciones`, {
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
 * Desactiva una sección por ID.
 * @param {number} id - ID de la sección a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarSeccion(id) {
  const response = await fetch(`${API_URL}/secciones/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }
}

/**
 * Actualiza una sección existente por nombre.
 * @param {string} nombreOriginal - Nombre original de la sección
 * @param {{ nombre: string, descripcion: string, idArea: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} La sección actualizada.
 */
export async function actualizarSeccion(nombreOriginal, datos) {
  const response = await fetch(`${API_URL}/secciones/${encodeURIComponent(nombreOriginal)}`, {
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
