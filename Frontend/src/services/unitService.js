const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todas las unidades.
 * @returns {Promise<Array>} Lista de unidades.
 */
export async function obtenerUnidades() {
  const response = await fetch(`${API_URL}/unidades`, {
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
 * Obtiene una unidad por nombre.
 * @param {string} nombre - Nombre de la unidad
 * @returns {Promise<object>} La unidad encontrada.
 */
export async function obtenerUnidadPorNombre(nombre) {
  const response = await fetch(`${API_URL}/unidades/${encodeURIComponent(nombre)}`, {
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
 * Crea una nueva unidad.
 * @param {{ nombre: string, descripcion: string, idArea: number, idDepartamento?: number, idSeccion?: number, estado?: number }} datos
 * @returns {Promise<object>} La unidad creada.
 */
export async function crearUnidad(datos) {
  const response = await fetch(`${API_URL}/unidades`, {
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
 * Desactiva una unidad por ID.
 * @param {number} id - ID de la unidad a desactivar
 * @returns {Promise<void>}
 */
export async function eliminarUnidad(id) {
  const response = await fetch(`${API_URL}/unidades/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }
}

/**
 * Actualiza una unidad existente por nombre.
 * @param {string} nombreOriginal - Nombre original de la unidad
 * @param {{ nombre: string, descripcion: string, idArea: number, idDepartamento?: number, idSeccion?: number, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} La unidad actualizada.
 */
export async function actualizarUnidad(nombreOriginal, datos) {
  const response = await fetch(`${API_URL}/unidades/${encodeURIComponent(nombreOriginal)}`, {
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
