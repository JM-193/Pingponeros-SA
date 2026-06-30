const SESSION_KEY = 'pingponeros_session'
const TEMP_PW_KEY = 'pingponeros_temp_password'

/**
 * Decodifica el payload de un JWT sin verificar la firma
 * (la verificación de la firma la realiza el backend).
 * @param {string} token
 * @returns {object|null}
 */
function decodificarPayload(token) {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const base64 = payloadB64.replaceAll('-', '+').replaceAll('_', '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.codePointAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Guarda el token JWT en SessionStorage.
 * La expiración se obtiene del claim `exp` del propio token (segundos epoch).
 *
 * El que la contraseña sea temporal vive fuera del token (el backend lo mantiene
 * fuera de los claims), por lo que se persiste aquí como bandera complementaria. Esto permite
 * que el bloqueo de cambio forzado sobreviva a recargas de página / navegación directa.
 * @param {string} token JWT recibido del backend
 * @param {boolean} [esTemporal] Indica si la contraseña con la que se inició sesión es temporal.
 */
export function guardarSesion(token, esTemporal = false) {
  if (typeof token !== 'string' || !token) return
  sessionStorage.setItem(SESSION_KEY, token)
  if (esTemporal) {
    sessionStorage.setItem(TEMP_PW_KEY, '1')
  } else {
    sessionStorage.removeItem(TEMP_PW_KEY)
  }
}

function obtenerSesionValida() {
  const token = sessionStorage.getItem(SESSION_KEY)
  if (!token) return null

  const payload = decodificarPayload(token)
  if (!payload) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  // exp viene en segundos (epoch), Date.now() en milisegundos
  if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  return { payload, token }
}

/**
 * Devuelve el payload decodificado del usuario si el token existe y no ha expirado,
 * o null si expiró / no existe / es inválido.
 * @returns {object|null}
 */
export function obtenerSesion() {
  return obtenerSesionValida()?.payload ?? null
}

/**
 * Devuelve el token JWT en bruto (para enviarlo en el encabezado Authorization),
 * o null si no existe o ha expirado.
 * @returns {string|null}
 */
export function obtenerToken() {
  return obtenerSesionValida()?.token ?? null
}

/**
 * Devuelve true cuando la sesión activa se inició con una contraseña temporal
 * y debe cambiarse antes de continuar. Protegido por un token válido para que una bandera
 * obsoleta (sin sesión / token expirado) devuelva false.
 * @returns {boolean}
 */
export function esContrasenaTemporal() {
  if (!obtenerToken()) return false
  return sessionStorage.getItem(TEMP_PW_KEY) === '1'
}

/**
 * Elimina la bandera de contraseña temporal una vez que el usuario ha establecido una contraseña permanente,
 * manteniendo intacto el token de la sesión activa.
 */
export function limpiarContrasenaTemporal() {
  sessionStorage.removeItem(TEMP_PW_KEY)
}

/**
 * Finaliza la sesión activa.
 */
export function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(TEMP_PW_KEY)
}
