const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Envía las credenciales al backend y devuelve los datos del usuario.
 * @param {string} correoInstitucional
 * @param {string} contrasena
 * @returns {Promise<object>} Datos del usuario autenticado.
 */
export async function login(correoInstitucional, contrasena) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correoInstitucional, contrasena }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.mensaje ?? `Error inesperado (${response.status})`)
  }

  return data
}

/**
 * Solicita recuperación de contraseña.
 * @param {string} correoInstitucional
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function recuperarContrasena(correoInstitucional) {
  const response = await fetch(`${API_URL}/auth/recuperar-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correoInstitucional }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.mensaje ?? `Error inesperado (${response.status})`)
  }

  return data
}

/**
 * Cambia la contraseña de un usuario autenticado.
 * @param {string} correoInstitucional
 * @param {string} contraseñaActual
 * @param {string} contraseñaNueva
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function cambiarContrasena(correoInstitucional, contraseñaActual, contraseñaNueva) {
  const response = await fetch(`${API_URL}/auth/cambiar-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correoInstitucional,
      contraseñaActual,
      contraseñaNueva,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.mensaje ?? `Error inesperado (${response.status})`)
  }

  return data
}
