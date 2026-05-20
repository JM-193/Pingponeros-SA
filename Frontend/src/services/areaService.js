const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todas las áreas de la base de datos.
 * @returns {Promise<Array>} Lista de áreas.
 */
export async function obtenerAreas() {
  const response = await fetch(`${API_URL}/areas`, {
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
 * Obtiene un área por nombre.
 * @param {string} nombre - Nombre del área
 * @returns {Promise<object>} El área encontrada.
 */
export async function obtenerAreaPorNombre(nombre) {
  const response = await fetch(`${API_URL}/areas/${encodeURIComponent(nombre)}`, {
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
 * Crea una nueva área en la base de datos.
 * @param {{ nombre: string, descripcion: string, estado?: number }} datos
 * @returns {Promise<object>} El área creada.
 */
export async function crearArea(datos) {
  const response = await fetch(`${API_URL}/areas`, {
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
 * Elimina un área por ID.
 * @param {number} id - ID del área a eliminar
 * @returns {Promise<void>}
 */
export async function eliminarArea(id) {
  const response = await fetch(`${API_URL}/areas/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }
}

/**
 * Actualiza un área existente por nombre.
 * @param {string} nombreOriginal - Nombre original del área
 * @param {{ nombre: string, descripcion: string, estado?: number }} datos - Nuevos datos
 * @returns {Promise<object>} El área actualizada.
 */
export async function actualizarArea(nombreOriginal, datos) {
  const response = await fetch(`${API_URL}/areas/${encodeURIComponent(nombreOriginal)}`, {
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
