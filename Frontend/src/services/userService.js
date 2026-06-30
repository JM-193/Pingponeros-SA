import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Crea un nuevo usuario en el backend.
 * @param {{ correoInstitucional: string, primerNombre: string, segundoNombre?: string,
 *           primerApellido: string, segundoApellido: string, rol: number }} datos
 * @returns {Promise<object>} El usuario creado devuelto por el servidor.
 */
export async function crearUsuario(datos) {
  return apiFetch('/usuarios', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Obtiene la lista de todos los usuarios.
 * @returns {Promise<Array>} Lista de usuarios.
 */
export async function obtenerUsuarios() {
  return apiFetch('/usuarios')
}

/**
 * Elimina (o desactiva) un usuario por su correo.
 * @param {string} correo El correo del usuario a deactivar.
 * @returns {Promise<void>}
 */
export async function eliminarUsuario(correo) {
  await apiFetch(`/usuarios/${encodeURIComponent(correo)}`, { method: 'DELETE' })
}

/**
 * Obtiene un usuario por su correo.
 * @param {string} correo - Correo del usuario
 * @returns {Promise<object>} El usuario encontrado.
 */
export async function obtenerUsuarioPorCorreo(correo) {
  return apiFetch(`/usuarios/${encodeURIComponent(correo)}`, {
    method: 'GET',
    headers: JSON_HEADERS,
  })
}

/**
 * Actualiza la información de un usuario existente.
 * @param {string} correo - El correo original del usuario a actualizar.
 * @param {{ correoInstitucional: string, primerNombre: string, segundoNombre?: string,
 *           primerApellido: string, segundoApellido: string, rol: number, estado: number }} datos
 * @returns {Promise<object>} El usuario actualizado devuelvo por el servidor.
 */
export async function actualizarUsuario(correo, datos) {
  return apiFetch(`/usuarios/${encodeURIComponent(correo)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Obtiene las plazas vinculadas (activas) de un usuario.
 * @param {string} correo - Correo del usuario.
 * @returns {Promise<Array>} Lista de vinculaciones plaza-usuario.
 */
export async function obtenerPlazasUsuario(correo) {
  return apiFetch(`/usuarios/${encodeURIComponent(correo)}/plazas`, {
    method: 'GET',
    headers: JSON_HEADERS,
  }, { emptyArrayOn404: true })
}

/**
 * Vincula una plaza disponible a un usuario.
 * @param {string} correo - Correo del usuario.
 * @param {{ numeroPlaza: number, idPuesto: number, idClaseOcupacional: number,
 *           lugarTrabajo: string, fechaInicio: string, fechaFinal?: string|null }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function asignarPlazaUsuario(correo, datos) {
  return apiFetch(`/usuarios/${encodeURIComponent(correo)}/plazas`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

/**
 * Desvincula (libera) una plaza de un usuario. La plaza no se elimina.
 * @param {string} correo - Correo del usuario.
 * @param {number} numeroPlaza - Número de la plaza a desvincular.
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function desasignarPlazaUsuario(correo, numeroPlaza) {
  return apiFetch(`/usuarios/${encodeURIComponent(correo)}/plazas/${numeroPlaza}`, {
    method: 'DELETE',
    headers: JSON_HEADERS,
  })
}
