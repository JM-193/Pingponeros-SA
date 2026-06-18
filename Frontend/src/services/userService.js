const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Crea un nuevo usuario en el backend.
 * @param {{ correoInstitucional: string, primerNombre: string, segundoNombre?: string,
 *           primerApellido: string, segundoApellido: string, rol: number }} datos
 * @returns {Promise<object>} El usuario creado devuelto por el servidor.
 */
export async function crearUsuario(datos) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    // El backend devuelve { mensaje } en errores controlados, o { detail } en ProblemDetails
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  const data = await response.json()
  // Devuelve el objeto completo (incluye mensaje y contrasenaTemporal en creación)
  return data
}

/**
 * Obtiene la lista de todos los usuarios.
 * @returns {Promise<Array>} Lista de usuarios.
 */
export async function obtenerUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`)

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return response.json()
}

/**
 * Elimina (o desactiva) un usuario por su correo.
 * @param {string} correo El correo del usuario a deactivar.
 * @returns {Promise<void>}
 */
export async function eliminarUsuario(correo) {
  const response = await fetch(`${API_URL}/usuarios/${encodeURIComponent(correo)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }
}

/**
 * Obtiene un usuario por su correo.
 * @param {string} correo - Correo del usuario
 * @returns {Promise<object>} El usuario encontrado.
 */
export async function obtenerUsuarioPorCorreo(correo) {
  const response = await fetch(`${API_URL}/usuarios/${encodeURIComponent(correo)}`, {
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
 * Actualiza la información de un usuario existente.
 * @param {string} correo - El correo original del usuario a actualizar.
 * @param {{ correoInstitucional: string, primerNombre: string, segundoNombre?: string,
 *           primerApellido: string, segundoApellido: string, rol: number, estado: number }} datos
 * @returns {Promise<object>} El usuario actualizado devuelvo por el servidor.
 */
export async function actualizarUsuario(correo, datos) {
  const response = await fetch(`${API_URL}/usuarios/${encodeURIComponent(correo)}`, {
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


