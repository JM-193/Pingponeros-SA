import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Envía las credenciales al backend y devuelve los datos del usuario.
 * @param {string} correoInstitucional
 * @param {string} contrasena
 * @returns {Promise<object>} Datos del usuario autenticado.
 */
export async function login(correoInstitucional, contrasena) {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ correoInstitucional, contrasena }),
  })
}

/**
 * Solicita recuperación de contraseña.
 * @param {string} correoInstitucional
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function recuperarContrasena(correoInstitucional) {
  return apiFetch('/auth/recuperar-contrasena', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ correoInstitucional }),
  })
}

/**
 * Cambia la contraseña de un usuario autenticado.
 * @param {string} correoInstitucional
 * @param {string} contraseñaActual
 * @param {string} contraseñaNueva
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function cambiarContrasena(correoInstitucional, contrasenaActual, contrasenaNueva) {
  return apiFetch('/auth/cambiar-contrasena', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ correoInstitucional, contrasenaActual, contrasenaNueva }),
  })
}
